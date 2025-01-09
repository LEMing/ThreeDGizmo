import * as THREE from "three";

export const isCubeRotated = (gizmoCamera: THREE.Camera): boolean => {
  const rotation = gizmoCamera.rotation;
  const EPSILON = 0.1;
  const PI = Math.PI;
  const x = ((Math.abs(rotation.x) % (2 * PI)) + 2 * PI) % (2 * PI);

  const isVertical =
    Math.abs(x - PI / 2) < EPSILON || Math.abs(x - (3 * PI) / 2) < EPSILON;

  const isHorizontal = Math.abs(x) < EPSILON || Math.abs(x - PI) < EPSILON;
  return !(isVertical || isHorizontal);
};
