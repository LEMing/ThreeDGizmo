import * as THREE from 'three';
import { CUBE_CONSTANTS } from './constants';
import { Axis, AxisOptions, FacePosition } from './types';
import { CubePartFactory } from './CubePartFactory';
import { TextureFactory } from './TextureFactory';

export class GizmoCube {
  private hoveredObject: THREE.Object3D | null = null;
  private originalColor: THREE.Color | null = null;

  get vectorToCube() {
    return this.hoveredObject?.userData.vectorToCube;
  }

  private createTextSprite(text: string, color: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'Bold 48px Arial';
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5, 0.5, 0.5);

    return sprite;
  }

  private createTextTexture(text: string): THREE.Texture {
    return TextureFactory.createTextTexture(text);
  }

  private createWireframe(): THREE.LineSegments {
    const side = CUBE_CONSTANTS.CUBE_SIZE + CUBE_CONSTANTS.EDGE_SECTION_SIZE;
    const wireframe = CubePartFactory.createWireframe([side, side, side]);
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

  private createAxis(options: AxisOptions): THREE.Group {
    const { color, direction, length, origin, lineWidth, label } = options;

    const group = new THREE.Group();

    // Use lineWidth as the cylinder's diameter
    const radius = lineWidth / 2;
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 32);
    const material = new THREE.MeshBasicMaterial({ color });

    // Create mesh
    const cylinder = new THREE.Mesh(geometry, material);

    // Position cylinder
    cylinder.position.copy(origin).add(direction.clone().multiplyScalar(length / 2));

    // Orient cylinder
    if (!direction.equals(new THREE.Vector3(0, 1, 0))) {
      const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
      const angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction));
      cylinder.setRotationFromAxisAngle(axis, angle);
    }

    group.add(cylinder);

    // Create and position text sprite
    const sprite = this.createTextSprite(label, color);
    sprite.position.copy(origin).add(direction.clone().multiplyScalar(length + 0.1)); // Slightly further from the end of the cylinder
    group.add(sprite);

    return group;
  }

  private createCoordinateAxes(): THREE.Object3D {
    const axesGroup = new THREE.Group();
    const cubeSize = CUBE_CONSTANTS.CUBE_SIZE;
    const edgeWidth = CUBE_CONSTANTS.EDGE_SECTION_SIZE;

    // Calculate the cube's corner coordinate
    const cornerCoordinate = -(cubeSize / 2 + edgeWidth / 2);

    const getOrigin = (cc: number) => {
      const offsetVector = new THREE.Vector3(1, 1, 1);
      const offset = 0.04; // Can be adjusted as desired
      return new THREE.Vector3(cc, cc, cc).add(offsetVector.clone().normalize().negate().multiplyScalar(offset));
    }

    const length = cubeSize + 1.25 * edgeWidth;

    const axesData: AxisOptions[] = [
      {
        color: 0xff0000,
        direction: new THREE.Vector3(1, 0, 0),
        length,
        origin: getOrigin(cornerCoordinate),
        lineWidth: 0.04, // Increased line thickness
        label: 'X'
      },
      {
        color: 0x00ff00,
        direction: new THREE.Vector3(0, 1, 0),
        length,
        origin: getOrigin(cornerCoordinate),
        lineWidth: 0.04,
        label: 'Y'
      },
      {
        color: 0x0000ff,
        direction: new THREE.Vector3(0, 0, 1),
        length,
        origin: getOrigin(cornerCoordinate),
        lineWidth: 0.04,
        label: 'Z'
      }
    ];

    axesData.forEach(axisOptions => {
      const axis = this.createAxis(axisOptions);
      axesGroup.add(axis);
    });

    return axesGroup;
  }

  public create(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Gizmo Group';

    const wireframe = this.createWireframe();
    group.add(wireframe);

    this.createEdges(group);
    this.createCorners(group);
    this.createFaces(group);

    const axes = this.createCoordinateAxes();
    group.add(axes);

    return group;
  }

  public highlightObject(object: THREE.Object3D | null): void {
    if (this.hoveredObject === object) return;

    // Reset previous hovered object
    if (this.hoveredObject && this.originalColor) {
      const material = (this.hoveredObject as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.color.set(this.originalColor);
    }

    // Set new hovered object
    if (object && object instanceof THREE.Mesh) {
      const material = object.material as THREE.MeshStandardMaterial;
      this.hoveredObject = object;
      this.originalColor = material.color.clone();
      material.color.set(0xAFC7E5);  // Highlight color
    } else {
      this.hoveredObject = null;
      this.originalColor = null;
    }
  }

  public handleClick(): void {
    if (this.hoveredObject) {
      let objectPosition = new THREE.Vector3();
      objectPosition = this.hoveredObject.getWorldPosition(objectPosition).clone();
      const cubeCenter = new THREE.Vector3(0, 0, 0);
      const vectorToCube = objectPosition.sub(cubeCenter).normalize();

      // Save the vector in the object's userData
      this.hoveredObject.userData.vectorToCube = vectorToCube;
    }
  }
}
