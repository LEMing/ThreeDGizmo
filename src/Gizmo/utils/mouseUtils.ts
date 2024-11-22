import * as THREE from 'three';
import { GizmoCube } from '../core/GizmoCube';

export function updateMousePosition(event: MouseEvent, renderer: THREE.WebGLRenderer, mouse: THREE.Vector2) {
  if (!renderer) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

export function checkIntersection(
  mouse: THREE.Vector2,
  camera: THREE.Camera,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster
): THREE.Object3D | null {
  if (!camera || !scene) return null;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const exceptions = ['Wireframe', ''];
  return intersects.find(intersect => !exceptions.includes(intersect.object.name))?.object || null;
}

export function handleClick(
  intersectedObject: THREE.Object3D | null,
  alignCameraWithVector: (vector: THREE.Vector3) => void
) {
  const gizmoCube: GizmoCube = intersectedObject?.userData.gizmoCube;
  if (intersectedObject && gizmoCube) {
    // gizmoCube.handleClick();
    const vectorToCube = gizmoCube.vectorToCube;
    if (vectorToCube) {
      alignCameraWithVector(vectorToCube);
    }
  }
}
