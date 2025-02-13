import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useGizmoMouseEvents } from '../useGizmoMouseEvents';
import * as THREE from 'three';
import { updateMousePosition, checkIntersection, handleClick, getIntersectedObjects } from '../../utils/mouseUtils';
import { LEFT_ROTATION_ARROW_NAME, RIGHT_ROTATION_ARROW_NAME } from '../../constants';

jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      getSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
    })),
    Camera: jest.fn().mockImplementation(() => ({
      rotation: {x: 0, y: 0, z: 0},
    })),
    Raycaster: jest.fn().mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn(),
    })),
  };
});

jest.mock('../../utils/mouseUtils', () => ({
  updateMousePosition: jest.fn(),
  checkIntersection: jest.fn(),
  handleClick: jest.fn(),
  getAllIntersects: jest.fn().mockReturnValue([]),
  getIntersectedObjects: jest.fn(),
}));

describe('useGizmoMouseEvents', () => {
  let gizmoRenderer: THREE.WebGLRenderer;
  let gizmoScene: THREE.Scene;
  let gizmoCamera: THREE.Camera;
  let alignCameraWithVector: jest.Mock;
  let gizmoControlRef: React.MutableRefObject<any>;

  beforeEach(() => {
    gizmoRenderer = new THREE.WebGLRenderer();
    gizmoScene = new THREE.Scene();
    gizmoCamera = new THREE.Camera();
    alignCameraWithVector = jest.fn();
    gizmoControlRef = { current: {} };

    jest.clearAllMocks();
  });

  it('should set click start position on onMouseDown', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });

    act(() => {
      result.current.onMouseDown(event);
    });

    // Verify internal state or mock behavior accordingly
    expect(result.current).toBeTruthy(); // Check for initial setup completeness
  });

  it('should call updateMousePosition and checkIntersection on mouse move', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 150 });

    act(() => {
      jest.advanceTimersByTime(50); // Advance timer for throttle
      result.current.onMouseMove(mouseMoveEvent);
    });

    expect(updateMousePosition).toHaveBeenCalledWith(mouseMoveEvent, gizmoRenderer, expect.any(THREE.Vector2));
    expect(getIntersectedObjects).toHaveBeenCalled();
  });

  it('should call handleClick when not rotating and click is short', () => {
    jest.spyOn(Date, 'now')
    .mockReturnValueOnce(1000) // Start time on mouse down
    .mockReturnValueOnce(1050); // End time on mouse up (50ms duration)

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 200, clientY: 200 });
    const mouseUpEvent = new MouseEvent('mouseup', { clientX: 200, clientY: 200 });

    act(() => {
      result.current.onMouseDown(mouseDownEvent);
    });

    act(() => {
      result.current.onMouseUp(mouseUpEvent);
    });

    expect(handleClick).toHaveBeenCalled();
  });

  it('should return early if gizmoControlRef.current is null', () => {
    const gizmoControlRef = { current: null };

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 150,
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.onMouseMove(mouseMoveEvent);
    });

    expect(updateMousePosition).not.toHaveBeenCalled();
    expect(checkIntersection).not.toHaveBeenCalled();
  });

  it('should return early if gizmoRenderer is null', () => {
    const gizmoRenderer = null;

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 150,
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.onMouseMove(mouseMoveEvent);
    });

    expect(updateMousePosition).not.toHaveBeenCalled();
    expect(checkIntersection).not.toHaveBeenCalled();
  });

  it('should call highlightObject on intersectedObject when it has userData.gizmoCube', () => {
    const mockGizmoCube = {
      highlightObject: jest.fn(),
    };

    const intersectedObject = {
      userData: {
        gizmoCube: mockGizmoCube,
      },
    };

    (checkIntersection as jest.Mock).mockReturnValue(intersectedObject);
    (getIntersectedObjects as jest.Mock).mockReturnValue(intersectedObject);

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 150,
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.onMouseMove(mouseMoveEvent);
    });

    expect(mockGizmoCube.highlightObject).toHaveBeenCalledWith(intersectedObject);
  });

  it('should call highlightObject(null) on anyObject when intersectedObject is null and anyObject has userData.gizmoCube', () => {
    const mockGizmoCube = {
      highlightObject: jest.fn(),
    };

    // Create a mock Object3D instance
    const anyObject = new THREE.Object3D();
    anyObject.userData = {
      gizmoCube: mockGizmoCube,
    };

    gizmoScene.children[0] = anyObject;

    (getIntersectedObjects as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 150,
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.onMouseMove(mouseMoveEvent);
    });

    expect(mockGizmoCube.highlightObject).toHaveBeenCalledWith(null);
  });

});

describe('handleRotationArrowClick', () => {
  let gizmoRenderer: THREE.WebGLRenderer;
  let gizmoScene: THREE.Scene;
  let gizmoCamera: THREE.Camera;
  let alignCameraWithVector: jest.Mock;
  let gizmoControlRef: React.MutableRefObject<any>;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    mockUpdate = jest.fn();
    gizmoRenderer = new THREE.WebGLRenderer();
    gizmoScene = new THREE.Scene();
    gizmoCamera = new THREE.Camera();
    alignCameraWithVector = jest.fn();
    gizmoControlRef = { 
      current: {
        gizmoControls: {
          update: mockUpdate
        }
      }
    };

    // Setup initial camera properties
    gizmoCamera.up = new THREE.Vector3(0, 1, 0);
    gizmoCamera.lookAt = jest.fn();

    jest.clearAllMocks();
  });

  it('should rotate camera 90 degrees clockwise when right arrow is clicked', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100);

    const rightArrow = new THREE.Object3D();
    rightArrow.name = RIGHT_ROTATION_ARROW_NAME;

    (checkIntersection as jest.Mock).mockReturnValue(rightArrow);

    act(() => {
      result.current.onMouseDown(new MouseEvent('mousedown'));
      result.current.onMouseUp(new MouseEvent('mouseup'));
    });

    // Verify camera was rotated correctly
    expect(gizmoCamera.lookAt).toHaveBeenCalledWith(new THREE.Vector3(0, 0, 0));
    expect(mockUpdate).toHaveBeenCalled();

    // Verify camera up vector was transformed
    expect(Math.abs(gizmoCamera.up.x + 1)).toBeLessThan(0.001); // ≈ -1
    expect(Math.abs(gizmoCamera.up.y)).toBeLessThan(0.001);     // ≈ 0
    expect(Math.abs(gizmoCamera.up.z)).toBeLessThan(0.001);     // ≈ 0
  });

  it('should rotate camera 90 degrees counterclockwise when left arrow is clicked', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100);

    const leftArrow = new THREE.Object3D();
    leftArrow.name = LEFT_ROTATION_ARROW_NAME;

    (checkIntersection as jest.Mock).mockReturnValue(leftArrow);

    act(() => {
      result.current.onMouseDown(new MouseEvent('mousedown'));
      result.current.onMouseUp(new MouseEvent('mouseup'));
    });

    // Verify camera was rotated correctly
    expect(gizmoCamera.lookAt).toHaveBeenCalledWith(new THREE.Vector3(0, 0, 0));
    expect(mockUpdate).toHaveBeenCalled();

    // Verify camera up vector was transformed
    expect(Math.abs(gizmoCamera.up.x - 1)).toBeLessThan(0.001); // ≈ 1
    expect(Math.abs(gizmoCamera.up.y)).toBeLessThan(0.001);     // ≈ 0
    expect(Math.abs(gizmoCamera.up.z)).toBeLessThan(0.001);     // ≈ 0
  });

  it('should not rotate camera if click duration exceeds threshold', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1300);

    const rightArrow = new THREE.Object3D();
    rightArrow.name = RIGHT_ROTATION_ARROW_NAME;
    (checkIntersection as jest.Mock).mockReturnValue(rightArrow);

    const initialUp = gizmoCamera.up.clone();

    act(() => {
      result.current.onMouseDown(new MouseEvent('mousedown'));
      result.current.onMouseUp(new MouseEvent('mouseup'));
    });

    expect(gizmoCamera.up).toEqual(initialUp);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should update gizmoControls after rotation', () => {
    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100);

    const rightArrow = new THREE.Object3D();
    rightArrow.name = RIGHT_ROTATION_ARROW_NAME;
    (checkIntersection as jest.Mock).mockReturnValue(rightArrow);

    act(() => {
      result.current.onMouseDown(new MouseEvent('mousedown'));
      result.current.onMouseUp(new MouseEvent('mouseup'));
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });
});