import * as THREE from "three";

export const CUBE_CONSTANTS = {
  CUBE_SIZE: 1.8,
  EDGE_SECTION_SIZE: 0.35,
  FACE_THICKNESS: 0.35,
  CANVAS_SIZE: 256,
  FONT_SIZE: "62px",
  TEXT_COLOR: "#000000",
  TEXT_ALIGN: "center",
  TEXT_BASELINE: "middle",
  FACE_COLOR: "#EFF3F2",
  FACE_OPACITY: 1,
  EDGE_COLOR: "#EFF3F2",
  CORNER_COLOR: "#EFF3F2",
  LINE_COLOR: 0x000000,
};

export enum InitialCubeFace {
  FRONT = "FRONT",
  BACK = "BACK",
  RIGHT = "RIGHT",
  LEFT = "LEFT",
  TOP = "TOP",
  BOTTOM = "BOTTOM",
}


export const defaultGizmoOptions = {
  up: new THREE.Vector3(0, 1, 0),
  initialFace: InitialCubeFace.TOP,
};

export const ROTATION_ARROWS_NAME = 'rotation-arrows-name'
