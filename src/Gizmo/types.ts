import * as THREE from 'three';

export type Axis = 'x' | 'y' | 'z';

export type FacePosition = {
  pos: THREE.Vector3;
  rotation: THREE.Euler;
  label: string;
};
