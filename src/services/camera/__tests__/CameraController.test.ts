import * as THREE from 'three';
// @ts-ignore
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import {MapControls} from 'three/examples/jsm/controls/MapControls';
import {mockRenderer} from '../../../infrastructure/mocks/mockRenderer';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo, createCameraSynchronizer } from '../CameraController';
import { ROTATION_ARROWS_NAME } from '../../../domain/gizmo/constants';

describe('Camera Synchronization', () => {
  let mainCamera: THREE.PerspectiveCamera;
  let gizmoCamera: THREE.PerspectiveCamera;
  let gizmoScene: THREE.Scene;
  let orbitControls: OrbitControls;
  let mapControls: MapControls;
  let renderer: THREE.WebGLRenderer;
  let rotationArrows: THREE.Object3D;

  beforeEach(() => {
    // @ts-ignore
    renderer = mockRenderer;
    mainCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    gizmoCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    orbitControls = new OrbitControls(mainCamera, renderer.domElement);
    mapControls = new MapControls(mainCamera, renderer.domElement);
    gizmoScene = new THREE.Scene();
    
    // Create rotation arrows mock object for testing
    rotationArrows = new THREE.Object3D();
    rotationArrows.name = ROTATION_ARROWS_NAME;
    rotationArrows.rotation.set(0, 0, 0);
    gizmoScene.add(rotationArrows);
    
    // Setup camera for consistent tests
    mainCamera.position.set(10, 10, 10);
    gizmoCamera.position.set(0, 0, 8);
    orbitControls.target.set(0, 0, 0);
    mapControls.target.set(0, 0, 0);
  });

  test('syncGizmoCameraWithMain updates gizmo camera position and rotation', () => {
    mainCamera.position.set(10, 10, 10);
    mainCamera.lookAt(0, 0, 0);

    syncGizmoCameraWithMain(gizmoCamera, mainCamera, gizmoScene);

    expect(gizmoCamera.position.length()).toBeCloseTo(8);
    const gizmoQuaternion = gizmoCamera.quaternion.toArray();
    const mainQuaternion = mainCamera.quaternion.toArray();
    gizmoQuaternion.forEach((value, index) => {
      expect(value).toBeCloseTo(mainQuaternion[index], 5);
    });
  });

  test('syncMainCameraWithGizmo updates main camera position and rotation', () => {
    gizmoCamera.position.set(0, 0, 5);
    gizmoCamera.lookAt(0, 0, 0);
    mainCamera.position.set(20, 20, 20);

    syncMainCameraWithGizmo(mainCamera, gizmoCamera, orbitControls);

    expect(mainCamera.position.length()).toBeCloseTo(34.64);
    const mainQuaternion = mainCamera.quaternion.toArray();
    const gizmoQuaternion = gizmoCamera.quaternion.toArray();
    mainQuaternion.forEach((value, index) => {
      expect(Math.abs(value)).toBeCloseTo(Math.abs(gizmoQuaternion[index]), 5);
    });
  });

  test('syncMainCameraWithGizmo respects controls target', () => {
    gizmoCamera.position.set(0, 0, 5);
    gizmoCamera.lookAt(0, 0, 0);
    mainCamera.position.set(20, 20, 20);
    orbitControls.target.set(10, 0, 0);

    syncMainCameraWithGizmo(mainCamera, gizmoCamera, orbitControls);

    const expectedDirection = new THREE.Vector3(10, 0, 0).sub(mainCamera.position).normalize();
    const actualDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(mainCamera.quaternion).normalize();

    expect(actualDirection.dot(expectedDirection)).toBeCloseTo(1, 5);
  });
  
  test('syncMapControls maintains height and applies forward direction', () => {
    // Create a direct test for the private syncMapControls method
    // First, create a synchronizer
    const synchronizer = createCameraSynchronizer(gizmoScene);
    
    // Create test objects
    const main = {
      camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
      position: new THREE.Vector3(10, 20, 10),
      quaternion: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0)
    };
    
    const gizmo = {
      camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
      position: new THREE.Vector3(0, 0, 8),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/4, 0, 0)),
      up: new THREE.Vector3(0, 1, 0)
    };
    
    // Target and distance parameters
    const target = new THREE.Vector3(0, 0, 0);
    const distance = 15;
    const currentHeight = main.position.y - target.y; // Should be 20
    
    // Call the method directly using bracket notation to access private method
    (synchronizer as any)['syncMapControls'](main, gizmo, target, distance);
    
    // Verify camera position has been updated correctly
    // Main camera should maintain its height above target
    expect(main.position.y - target.y).toBeCloseTo(currentHeight);
    
    // Forward direction should be normalized with y=0
    const expectedForward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(gizmo.quaternion);
    expectedForward.y = 0;
    expectedForward.normalize();
    
    // The main camera should be positioned based on the target, height, and forward direction
    const expectedPosition = target.clone();
    expectedPosition.y += currentHeight;
    expectedPosition.add(expectedForward.clone().multiplyScalar(-distance));
    
    // Verify position matches expected
    expect(main.position.x).toBeCloseTo(expectedPosition.x);
    expect(main.position.y).toBeCloseTo(expectedPosition.y);
    expect(main.position.z).toBeCloseTo(expectedPosition.z);
    
    // Verify up vector is correctly set to default up
    expect(main.up.x).toBeCloseTo(0);
    expect(main.up.y).toBeCloseTo(1);
    expect(main.up.z).toBeCloseTo(0);
  });
  
  test('syncGizmoWithMain updates rotation arrows to match camera rotation', () => {
    // Setup test scenario
    const initialRotation = new THREE.Euler(0, 0, 0);
    rotationArrows.rotation.copy(initialRotation);
    
    // Set main camera rotation
    mainCamera.position.set(10, 5, 10);
    mainCamera.lookAt(0, 0, 0);
    mainCamera.updateMatrixWorld(true);
    
    syncGizmoCameraWithMain(gizmoCamera, mainCamera, gizmoScene);
    
    // Rotation arrows rotation should match the gizmo camera rotation
    expect(rotationArrows.rotation.x).toBeCloseTo(gizmoCamera.rotation.x);
    expect(rotationArrows.rotation.y).toBeCloseTo(gizmoCamera.rotation.y);
    expect(rotationArrows.rotation.z).toBeCloseTo(gizmoCamera.rotation.z);
    
    // Change main camera orientation to test a different rotation
    mainCamera.position.set(-10, 15, -10);
    mainCamera.lookAt(0, 0, 0);
    mainCamera.updateMatrixWorld(true);
    
    syncGizmoCameraWithMain(gizmoCamera, mainCamera, gizmoScene);
    
    // Verify arrows rotation updates to match new camera orientation
    expect(rotationArrows.rotation.x).toBeCloseTo(gizmoCamera.rotation.x);
    expect(rotationArrows.rotation.y).toBeCloseTo(gizmoCamera.rotation.y);
    expect(rotationArrows.rotation.z).toBeCloseTo(gizmoCamera.rotation.z);
  });
});