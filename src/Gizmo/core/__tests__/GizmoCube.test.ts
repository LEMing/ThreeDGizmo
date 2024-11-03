import * as THREE from 'three';
import { GizmoCube } from '../GizmoCube';
import { CubePartFactory } from '../../factories/CubePartFactory';

// Mock the factory and constants
jest.mock('../../factories/CubePartFactory');
jest.mock('../../factories/TextureFactory');
jest.mock('../../utils/constants', () => ({
  CUBE_CONSTANTS: {
    CUBE_SIZE: 1,
    EDGE_SECTION_SIZE: 0.1,
  },
}));

jest.mock('../../utils/createTextSprite', () => {
  return jest.fn().mockReturnValue(new THREE.Sprite());
})

describe('GizmoCube', () => {
  let gizmoCube: GizmoCube;

  beforeEach(() => {
    gizmoCube = new GizmoCube();
    jest.clearAllMocks();

    // Mock factory methods
    (CubePartFactory.createWireframe as jest.Mock).mockReturnValue(new THREE.LineSegments());
    (CubePartFactory.createEdgeBox as jest.Mock).mockReturnValue(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
    (CubePartFactory.createCornerCube as jest.Mock).mockReturnValue(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
    // @ts-ignore
    (CubePartFactory.createFace as jest.Mock).mockImplementation((pos, rotation, label) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshStandardMaterial());
      mesh.name = `Face Box ${label}`;
      mesh.userData = {}; // Initialize userData
      group.add(mesh);
      group.getObjectByName = jest.fn().mockReturnValue(mesh);
      return group;
    });

  });

  test('create method returns a THREE.Group', () => {
    const group = gizmoCube.create();
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.name).toBe('Gizmo Group');
  });

  test('createWireframe is called during create', () => {
    gizmoCube.create();
    expect(CubePartFactory.createWireframe).toHaveBeenCalled();
  });

  test('createEdges adds correct number of edges', () => {
    gizmoCube.create();
    expect(CubePartFactory.createEdgeBox).toHaveBeenCalledTimes(12);
  });

  test('createCorners adds correct number of corners', () => {
    gizmoCube.create();
    expect(CubePartFactory.createCornerCube).toHaveBeenCalledTimes(8);
  });

  test('createFaces adds correct number of faces', () => {
    gizmoCube.create();
    expect(CubePartFactory.createFace).toHaveBeenCalledTimes(6);
  });

  test('highlightObject changes color of hovered object', () => {
    const mockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    gizmoCube.highlightObject(mockMesh);
    expect((mockMesh.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xAFC7E5);
  });

  test('highlightObject resets color of previously hovered object', () => {
    const mockMesh1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    const mockMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    gizmoCube.highlightObject(mockMesh1);
    gizmoCube.highlightObject(mockMesh2);

    expect((mockMesh1.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xffffff);
    expect((mockMesh2.material as THREE.MeshStandardMaterial).color.getHex()).toBe(0xAFC7E5);
  });

  test('handleClick sets vectorToCube on hovered object', () => {
    const mockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial()
    );
    mockMesh.position.set(1, 1, 1);
    gizmoCube.highlightObject(mockMesh);
    gizmoCube.handleClick();

    expect(mockMesh.userData.vectorToCube).toBeDefined();
    expect(mockMesh.userData.vectorToCube instanceof THREE.Vector3).toBeTruthy();
  });

  test('vectorToCube getter returns correct value', () => {
    const mockMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial()
    );
    const mockVector = new THREE.Vector3(0.5, 0.5, 0.5);
    mockMesh.userData.vectorToCube = mockVector;

    gizmoCube.highlightObject(mockMesh);

    expect(gizmoCube.vectorToCube).toBe(mockVector);
  });
});
