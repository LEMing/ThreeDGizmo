import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from 'three/examples/jsm/controls/MapControls';

type Controls = OrbitControls | MapControls | null;

export const animateCameraToPosition = (
  camera: THREE.Camera,
  controls: Controls,
  startPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  duration: number,
  onUpdate: () => void
) => {
  if (duration === 0) {
    // Instantly move camera to the target position if duration is 0
    camera.position.copy(targetPosition);
    controls?.update();
    onUpdate();
    return;
  }

  const startTime = performance.now();

  const animate = () => {
    const elapsedTime = performance.now() - startTime;
    const t = Math.min(elapsedTime / duration, 1); // Normalize t within the range of 0 to 1

    // Linear interpolation between start and target position
    camera.position.lerpVectors(startPosition, targetPosition, t);

    // Update controls and render the scene
    controls?.update();
    onUpdate();

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
