import * as THREE from 'three';
import {MapControls} from 'three/examples/jsm/controls/MapControls';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

interface CameraSyncParams {
  sourceCamera: THREE.Camera;
  targetCamera: THREE.Camera;
  distance?: number;
  controls?: OrbitControls | MapControls
}


const syncCameras = ({ sourceCamera, targetCamera, distance, controls }: CameraSyncParams) => {
  targetCamera.quaternion.copy(sourceCamera.quaternion);
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(targetCamera.quaternion).normalize();
  const moveDistance = distance ?? sourceCamera.position.length();
  targetCamera.position.copy(direction.multiplyScalar(-moveDistance));

  const target = controls && !controls.target.equals(new THREE.Vector3(0, 0, 0))
    ? controls.target
    : new THREE.Vector3(0, 0, 0);

  targetCamera.lookAt(target);
  targetCamera.updateMatrixWorld(true);

  if (controls) {
    controls.update();
  }
};

export const syncGizmoCameraWithMain = (gizmoCamera: THREE.Camera, mainCamera: THREE.Camera) => {
  syncCameras({ sourceCamera: mainCamera, targetCamera: gizmoCamera, distance: 5 });
};

export const syncMainCameraWithGizmo = (mainCamera: THREE.Camera, gizmoCamera: THREE.Camera, controls: OrbitControls | MapControls) => {
  syncCameras({
    sourceCamera: gizmoCamera,
    targetCamera: mainCamera,
    distance: mainCamera.position.length(),
    controls,
  });
};
