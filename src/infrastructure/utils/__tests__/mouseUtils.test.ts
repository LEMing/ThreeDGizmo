import * as THREE from 'three';
import { updateMousePosition, checkIntersection, handleClick } from '../mouseUtils';
import { GizmoCube } from '../../../domain/gizmo/entities/GizmoCube';

describe('GizmoMouseUtils', () => {
  describe('updateMousePosition', () => {
    it('should correctly update the mouse position based on the event and renderer', () => {
      // Mock the renderer's DOM element and its bounding rectangle
      const mockRenderer = {
        domElement: {
          getBoundingClientRect: jest.fn().mockReturnValue({
            left: 10,
            top: 10,
            width: 200,
            height: 200,
          }),
        },
      } as unknown as THREE.WebGLRenderer;

      const mockEvent = {
        clientX: 60,
        clientY: 110,
      } as MouseEvent;

      const mouse = new THREE.Vector2();
      updateMousePosition(mockEvent, mockRenderer, mouse);

      expect(mouse.x).toBeCloseTo(-0.5);
      expect(mouse.y).toBeCloseTo(0);
    });

    it('should do nothing if the renderer is null', () => {
      const mockEvent = {
        clientX: 60,
        clientY: 110,
      } as MouseEvent;

      const mouse = new THREE.Vector2();
      updateMousePosition(mockEvent, null as unknown as THREE.WebGLRenderer, mouse);

      expect(mouse.x).toBe(0);
      expect(mouse.y).toBe(0);
    });
  });

  describe('checkIntersection', () => {
    it('should return the intersected object not in the exceptions list', () => {
      const mockCamera = new THREE.PerspectiveCamera();
      const mockScene = new THREE.Scene();
      const mockRaycaster = new THREE.Raycaster();
      const mockMouse = new THREE.Vector2(0.5, -0.5);

      // Create mock objects in the scene
      const intersectedObject = new THREE.Mesh();
      intersectedObject.name = 'ValidObject';
      mockScene.add(intersectedObject);

      const wireframeObject = new THREE.Mesh();
      wireframeObject.name = 'Wireframe';
      mockScene.add(wireframeObject);

      // Mock the intersectObjects method to return our mock objects
      jest.spyOn(mockRaycaster, 'intersectObjects').mockReturnValue([
        // @ts-ignore
        { object: wireframeObject },
        // @ts-ignore
        { object: intersectedObject },
      ]);

      const result = checkIntersection(mockMouse, mockCamera, mockScene, mockRaycaster);

      expect(result).toBe(intersectedObject);
    });

    it('should return null if no valid object is intersected', () => {
      const mockCamera = new THREE.PerspectiveCamera();
      const mockScene = new THREE.Scene();
      const mockRaycaster = new THREE.Raycaster();
      const mockMouse = new THREE.Vector2(0.5, -0.5);

      // Create mock objects that are only in the exceptions list
      const wireframeObject = new THREE.Mesh();
      wireframeObject.name = 'Wireframe';
      mockScene.add(wireframeObject);

      // Mock the intersectObjects method to return our mock objects
      jest.spyOn(mockRaycaster, 'intersectObjects').mockReturnValue([
        // @ts-ignore
        { object: wireframeObject },
      ]);

      const result = checkIntersection(mockMouse, mockCamera, mockScene, mockRaycaster);

      expect(result).toBeNull();
    });
  });

  describe('handleClick', () => {
    it('should call handleClick and alignCameraWithVector if vectorToCube is available', () => {
      const mockAlignCameraWithVector = jest.fn();
      const mockGizmoCube = {
        handleClick: jest.fn(),
        vectorToCube: new THREE.Vector3(1, 2, 3),
      } as unknown as GizmoCube;

      const mockObject = new THREE.Mesh();
      mockObject.userData = { gizmoCube: mockGizmoCube };

      handleClick(mockObject, mockAlignCameraWithVector);

      expect(mockGizmoCube.handleClick).toHaveBeenCalled();
      expect(mockAlignCameraWithVector).toHaveBeenCalledWith(new THREE.Vector3(1, 2, 3));
    });

    it('should not call alignCameraWithVector if no vectorToCube is available', () => {
      const mockAlignCameraWithVector = jest.fn();
      const mockGizmoCube = {
        handleClick: jest.fn(),
        vectorToCube: null,
      } as unknown as GizmoCube;

      const mockObject = new THREE.Mesh();
      mockObject.userData = { gizmoCube: mockGizmoCube };

      handleClick(mockObject, mockAlignCameraWithVector);

      expect(mockGizmoCube.handleClick).toHaveBeenCalled();
      expect(mockAlignCameraWithVector).not.toHaveBeenCalled();
    });

    it('should do nothing if the intersectedObject or gizmoCube is null', () => {
      const mockAlignCameraWithVector = jest.fn();

      handleClick(null, mockAlignCameraWithVector);
      expect(mockAlignCameraWithVector).not.toHaveBeenCalled();
    });
  });

  it('should return null if the camera is null', () => {
    const mockScene = new THREE.Scene();
    const mockRaycaster = new THREE.Raycaster();
    const mockMouse = new THREE.Vector2(0.5, -0.5);

    const result = checkIntersection(mockMouse, null as unknown as THREE.Camera, mockScene, mockRaycaster);

    expect(result).toBeNull();
  });

  it('should return null if the scene is null', () => {
    const mockCamera = new THREE.PerspectiveCamera();
    const mockRaycaster = new THREE.Raycaster();
    const mockMouse = new THREE.Vector2(0.5, -0.5);

    const result = checkIntersection(mockMouse, mockCamera, null as unknown as THREE.Scene, mockRaycaster);

    expect(result).toBeNull();
  });
});