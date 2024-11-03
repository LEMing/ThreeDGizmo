// useGizmoMouseEvents.test.ts
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useGizmoMouseEvents } from '../GizmoMouseEvents';
import * as THREE from 'three';
import { updateMousePosition, checkIntersection, handleClick } from '../GizmoMouseUtils';

// Mock the three.js components and utilities
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      getSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      children: [],
    })),
    Camera: jest.fn().mockImplementation(() => ({})),
    Raycaster: jest.fn().mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn(),
    })),
  };
});


jest.mock('../GizmoMouseUtils', () => ({
  updateMousePosition: jest.fn(),
  checkIntersection: jest.fn(),
  handleClick: jest.fn(),
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
    expect(checkIntersection).toHaveBeenCalled();
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

  it('should not call handleClick if rotating', () => {
    // Set isRotating to true
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    const { result } = renderHook(() =>
      useGizmoMouseEvents({
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        alignCameraWithVector,
        gizmoControlRef,
      })
    );

    const mouseUpEvent = new MouseEvent('mouseup', { clientX: 200, clientY: 200 });

    act(() => {
      result.current.onMouseUp(mouseUpEvent);
    });

    expect(handleClick).not.toHaveBeenCalled();
  });
});
