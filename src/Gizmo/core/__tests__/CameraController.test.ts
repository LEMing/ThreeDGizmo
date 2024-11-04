import * as THREE from 'three';
// @ts-ignore
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {mockRenderer} from '../../../__mocks__/mockRenderer';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo } from '../CameraController';

describe('Camera Synchronization', () => {
  let mainCamera: THREE.PerspectiveCamera;
  let gizmoCamera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let renderer: THREE.WebGLRenderer;

  beforeEach(() => {
    // @ts-ignore
    renderer = mockRenderer;
    mainCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    gizmoCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    controls = new OrbitControls(mainCamera, renderer.domElement);
  });

  test('syncGizmoCameraWithMain updates gizmo camera position and rotation', () => {
    mainCamera.position.set(10, 10, 10);
    mainCamera.lookAt(0, 0, 0);

    syncGizmoCameraWithMain(gizmoCamera, mainCamera);

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

    syncMainCameraWithGizmo(mainCamera, gizmoCamera, controls);

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
    controls.target.set(10, 0, 0);

    syncMainCameraWithGizmo(mainCamera, gizmoCamera, controls);

    const expectedDirection = new THREE.Vector3(10, 0, 0).sub(mainCamera.position).normalize();
    const actualDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(mainCamera.quaternion).normalize();

    expect(actualDirection.dot(expectedDirection)).toBeCloseTo(1, 5);
  });
});
