import * as THREE from 'three';
import { CUBE_CONSTANTS } from './constants';
import { Axis } from './types';
import { TextureFactory } from './TextureFactory';

export class CubePartFactory {
  static createWireframe(): THREE.LineSegments {
    const side = CUBE_CONSTANTS.CUBE_SIZE + CUBE_CONSTANTS.EDGE_SECTION_SIZE;
    const geometry = new THREE.BoxGeometry(side, side, side);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: CUBE_CONSTANTS.LINE_COLOR });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.name = 'Wireframe';
    return wireframe;
  }

  static createEdgeBox(pos: THREE.Vector3, axis: Axis, index: number): THREE.Mesh {
    const adjustedEdgeLength = CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE;
    const size = {
      x: CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      y: CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      z: CUBE_CONSTANTS.EDGE_SECTION_SIZE
    };

    size[axis] = adjustedEdgeLength;

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ color: CUBE_CONSTANTS.EDGE_COLOR });
    const edge = new THREE.Mesh(geometry, material);
    edge.position.copy(pos);
    edge.name = `Edge Box ${index}`;
    return edge;
  }

  static createCornerCube(pos: THREE.Vector3, index: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(
      CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      CUBE_CONSTANTS.EDGE_SECTION_SIZE
    );
    const material = new THREE.MeshStandardMaterial({ color: CUBE_CONSTANTS.CORNER_COLOR });
    const cornerCube = new THREE.Mesh(geometry, material);
    cornerCube.position.copy(pos);
    cornerCube.name = `Corner Cube ${index}`;
    return cornerCube;
  }

  static createFace(pos: THREE.Vector3, rotation: THREE.Euler, label: string): THREE.Group {
    const faceGroup = new THREE.Group();

    const faceGeometry = new THREE.BoxGeometry(
      CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      CUBE_CONSTANTS.FACE_THICKNESS
    );
    const faceMaterial = new THREE.MeshStandardMaterial({ color: CUBE_CONSTANTS.FACE_COLOR });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.name = `Face Box ${label}`;
    faceGroup.add(faceMesh);

    const planeGeometry = new THREE.PlaneGeometry(
      CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE
    );
    const textMaterial = new THREE.MeshStandardMaterial({
      map: TextureFactory.createTextTexture(label),
      transparent: true,
      depthWrite: false,
    });
    const textPlane = new THREE.Mesh(planeGeometry, textMaterial);
    textPlane.position.set(0, 0, CUBE_CONSTANTS.FACE_THICKNESS / 2 + 0.01);
    faceGroup.add(textPlane);

    faceGroup.position.copy(pos);
    faceGroup.rotation.copy(rotation);

    return faceGroup;
  }
}
