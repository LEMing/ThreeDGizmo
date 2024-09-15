import * as THREE from 'three';
import { GizmoCube } from '../GizmoCube';

// Mock для HTMLCanvasElement в Jest
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    clearRect: jest.fn(),
    fillText: jest.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
  }),
});

describe('GizmoCube', () => {
  let gizmoCube: GizmoCube;

  beforeEach(() => {
    gizmoCube = new GizmoCube();
  });

  it('should create a group with a wireframe and edges', () => {
    const group = gizmoCube.create();
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.name).toBe('Gizmo Group');

    const wireframe = group.getObjectByName('Wireframe');
    expect(wireframe).toBeInstanceOf(THREE.LineSegments);

    const edges = group.children.filter((child) => child.name.includes('Edge Box'));
    expect(edges.length).toBe(12);
  });

  it('should create corner cubes', () => {
    const group = gizmoCube.create();
    const corners = group.children.filter((child) => child.name.includes('Corner Cube'));
    expect(corners.length).toBe(8);
  });

  it('should create the correct wireframe for the cube', () => {
    const group = gizmoCube.create();
    const wireframe = group.getObjectByName('Wireframe') as THREE.LineSegments;

    expect(wireframe).toBeInstanceOf(THREE.LineSegments);
    expect(wireframe.geometry).toBeInstanceOf(THREE.EdgesGeometry);
    expect((wireframe.material as THREE.LineBasicMaterial).color.getHex()).toBe(0x000000);
  });


  it('should create text textures for each face', () => {
    const group = gizmoCube.create();
    const faceLabels = ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'FRONT', 'BACK'];

    faceLabels.forEach((label) => {
      const face = group.getObjectByName(`Face Box ${label}`) as THREE.Group;

      expect(face).toBeDefined();
    });
  });
});
