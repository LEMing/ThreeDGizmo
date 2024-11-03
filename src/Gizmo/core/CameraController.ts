import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface CameraSyncParams {
  sourceCamera: THREE.Camera;
  targetCamera: THREE.Camera;
  distance?: number;
  controls?: OrbitControls | MapControls;
  isMapControl?: boolean;
}

export const syncGizmoCameraWithMain = (
  gizmoCamera: THREE.Camera,
  mainCamera: THREE.Camera,
) => {

  // For both controls, we can synchronize the gizmo camera's quaternion with the main camera's quaternion
  gizmoCamera.quaternion.copy(mainCamera.quaternion);

  // Position the gizmo camera at a fixed distance along the main camera's forward direction
  const gizmoDistance = 5; // You can adjust this distance as needed
  const gizmoDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(gizmoCamera.quaternion).normalize();
  gizmoCamera.position.copy(gizmoDirection.multiplyScalar(-gizmoDistance));

  // Ensure the gizmo camera looks at the origin
  gizmoCamera.lookAt(new THREE.Vector3(0, 0, 0));

  gizmoCamera.updateMatrixWorld(true);
};


export const syncMainCameraWithGizmo = (
  mainCamera: THREE.Camera,
  gizmoCamera: THREE.Camera,
  controls: OrbitControls | MapControls
) => {
  const isMapControl = controls instanceof MapControls;

  // Get the current target from the controls
  const target = controls.target.clone();

  // Calculate the offset vector from the camera to the target
  const offset = mainCamera.position.clone().sub(target);
  const distance = offset.length();

  // Create a unit vector pointing along the gizmo camera's forward direction
  const gizmoDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(gizmoCamera.quaternion).normalize();

  // Scale the direction vector by the distance to maintain the same distance from the target
  const newOffset = gizmoDirection.multiplyScalar(-distance);

  // Update the main camera's position and quaternion
  mainCamera.position.copy(target).add(newOffset);
  mainCamera.quaternion.copy(gizmoCamera.quaternion);

  mainCamera.updateMatrixWorld(true);

  // Update controls (this is important for MapControls to reflect the new camera position)
  controls.update();
};
