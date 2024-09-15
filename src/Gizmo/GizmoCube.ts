import * as THREE from 'three';
import { CUBE_CONSTANTS } from './constants';
import { Axis, FacePosition } from './types';
import { CubePartFactory } from './CubePartFactory';
import { TextureFactory } from './TextureFactory';

export class GizmoCube {
  private hoveredObject: THREE.Object3D | null = null;
  private originalColor: THREE.Color | null = null;

  private createTextTexture(text: string): THREE.Texture {
    return TextureFactory.createTextTexture(text);
  }

  private createWireframe(): THREE.LineSegments {
    const wireframe = CubePartFactory.createWireframe();
    wireframe.userData.gizmoCube = this;
    return wireframe;
  }

  private createEdgeBox(pos: THREE.Vector3, axis: Axis, index: number): THREE.Mesh {
    const edge = CubePartFactory.createEdgeBox(pos, axis, index);
    edge.userData.gizmoCube = this;
    return edge;
  }

  private createCornerCube(pos: THREE.Vector3, index: number): THREE.Mesh {
    const corner = CubePartFactory.createCornerCube(pos, index);
    corner.userData.gizmoCube = this;
    return corner;
  }

  private createFace(pos: THREE.Vector3, rotation: THREE.Euler, label: string): THREE.Group {
    const face = CubePartFactory.createFace(pos, rotation, label);
    const mesh = face.getObjectByName(`Face Box ${label}`) as THREE.Mesh;
    mesh.userData.gizmoCube = this;
    return face;
  }

  private createEdges(group: THREE.Group): void {
    const halfSize = CUBE_CONSTANTS.CUBE_SIZE / 2;
    const edgePositions: { axis: Axis; pos: THREE.Vector3 }[] = [
      { axis: 'x', pos: new THREE.Vector3(0, halfSize, -halfSize) },
      { axis: 'x', pos: new THREE.Vector3(0, halfSize, halfSize) },
      { axis: 'x', pos: new THREE.Vector3(0, -halfSize, -halfSize) },
      { axis: 'x', pos: new THREE.Vector3(0, -halfSize, halfSize) },
      { axis: 'y', pos: new THREE.Vector3(halfSize, 0, -halfSize) },
      { axis: 'y', pos: new THREE.Vector3(halfSize, 0, halfSize) },
      { axis: 'y', pos: new THREE.Vector3(-halfSize, 0, -halfSize) },
      { axis: 'y', pos: new THREE.Vector3(-halfSize, 0, halfSize) },
      { axis: 'z', pos: new THREE.Vector3(halfSize, halfSize, 0) },
      { axis: 'z', pos: new THREE.Vector3(halfSize, -halfSize, 0) },
      { axis: 'z', pos: new THREE.Vector3(-halfSize, halfSize, 0) },
      { axis: 'z', pos: new THREE.Vector3(-halfSize, -halfSize, 0) },
    ];

    edgePositions.forEach(({ axis, pos }, index) => {
      const edge = this.createEdgeBox(pos, axis, index + 1);
      group.add(edge);
    });
  }

  private createCorners(group: THREE.Group): void {
    const halfSize = CUBE_CONSTANTS.CUBE_SIZE / 2;
    const cornerPositions = [
      new THREE.Vector3(-halfSize, -halfSize, -halfSize),
      new THREE.Vector3(-halfSize, -halfSize, halfSize),
      new THREE.Vector3(-halfSize, halfSize, -halfSize),
      new THREE.Vector3(-halfSize, halfSize, halfSize),
      new THREE.Vector3(halfSize, -halfSize, -halfSize),
      new THREE.Vector3(halfSize, -halfSize, halfSize),
      new THREE.Vector3(halfSize, halfSize, -halfSize),
      new THREE.Vector3(halfSize, halfSize, halfSize),
    ];

    cornerPositions.forEach((pos, index) => {
      const cornerCube = this.createCornerCube(pos, index + 1);
      group.add(cornerCube);
    });
  }

  private createFaces(group: THREE.Group): void {
    const halfSize = CUBE_CONSTANTS.CUBE_SIZE / 2;
    const facePositions: FacePosition[] = [
      { pos: new THREE.Vector3(0, 0, halfSize), rotation: new THREE.Euler(0, 0, 0), label: 'FRONT' },
      { pos: new THREE.Vector3(0, 0, -halfSize), rotation: new THREE.Euler(0, Math.PI, 0), label: 'BACK' },
      { pos: new THREE.Vector3(halfSize, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0), label: 'RIGHT' },
      { pos: new THREE.Vector3(-halfSize, 0, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0), label: 'LEFT' },
      { pos: new THREE.Vector3(0, halfSize, 0), rotation: new THREE.Euler(-Math.PI / 2, 0, 0), label: 'TOP' },
      { pos: new THREE.Vector3(0, -halfSize, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0), label: 'BOTTOM' },
    ];

    facePositions.forEach(({ pos, rotation, label }) => {
      const face = this.createFace(pos, rotation, label);
      group.add(face);
    });
  }

  public create(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Gizmo Group';

    const wireframe = this.createWireframe();
    group.add(wireframe);

    this.createEdges(group);
    this.createCorners(group);
    this.createFaces(group);

    return group;
  }

  public highlightObject(object: THREE.Object3D | null): void {
    if (this.hoveredObject === object) return;

    // Reset previous hovered object
    if (this.hoveredObject && this.originalColor) {
      const material = (this.hoveredObject as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.color.set(this.originalColor);
      this.hoveredObject = null;
      this.originalColor = null;
    }

    // Set new hovered object
    if (object && object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      this.hoveredObject = object;
      this.originalColor = material.color.clone();
      material.color.set(0xAFC7E5);  // Highlight color
    }
  }

  public handleClick(): void {
    if (this.hoveredObject) {
      console.log("Clicked object name:", this.hoveredObject.name);
    }
  }

  public getHoveredObject(): THREE.Object3D | null {
    return this.hoveredObject;
  }
}
