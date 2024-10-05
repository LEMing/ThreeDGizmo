import * as THREE from 'three';

export type Axis = 'x' | 'y' | 'z';

export type FacePosition = {
  pos: THREE.Vector3;
  rotation: THREE.Euler;
  label: string;
};

export interface AxisOptions {
  color: number;
  direction: THREE.Vector3;
  length: number;
  origin: THREE.Vector3;
  lineWidth: number;
  label: string;
}

export type GizmoOptions = {
  up: THREE.Vector3;
}
