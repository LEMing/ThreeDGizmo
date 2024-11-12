import * as THREE from "three";
import { CubePartFactory } from "../CubePartFactory";
import { CUBE_CONSTANTS } from "../../constants";
import { Axis } from "../../types";

describe("CubePartFactory", () => {
  beforeEach(() => {
    const mockCanvas = document.createElement(
      "canvas",
    ) as jest.Mocked<HTMLCanvasElement>;
    const mockContext = {
      fillStyle: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
    } as unknown as jest.Mocked<CanvasRenderingContext2D>;

    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        return document.createElement(tagName);
      });

    jest.spyOn(mockCanvas, "getContext").mockImplementation(() => mockContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createWireframe", () => {
    it("should create a wireframe with correct properties", () => {
      const dimensions = [1, 2, 3];
      const wireframe = CubePartFactory.createWireframe(dimensions);

      expect(wireframe).toBeInstanceOf(THREE.LineSegments);
      expect(wireframe.name).toBe("Wireframe");
      expect(wireframe.geometry).toBeInstanceOf(THREE.EdgesGeometry);
      expect(wireframe.material).toBeInstanceOf(THREE.LineBasicMaterial);
      expect(
        (wireframe.material as THREE.LineBasicMaterial).color.getHex(),
      ).toBe(CUBE_CONSTANTS.LINE_COLOR);
    });
  });

  describe("createEdgeBox", () => {
    it("should create an edge box with correct properties", () => {
      const pos = new THREE.Vector3(1, 2, 3);
      const axis: Axis = "x";
      const index = 0;

      const edgeBox = CubePartFactory.createEdgeBox(pos, axis, index);

      expect(edgeBox).toBeInstanceOf(THREE.Mesh);
      expect(edgeBox.name).toBe("Edge Box 0");
      expect(edgeBox.position).toEqual(pos);
      expect(edgeBox.geometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(edgeBox.material).toBeInstanceOf(THREE.MeshStandardMaterial);
      const color = (edgeBox.material as THREE.MeshStandardMaterial).color
        .getHexString()
        .toUpperCase();
      expect(`#${color}`).toBe(CUBE_CONSTANTS.EDGE_COLOR);

      const geometry = edgeBox.geometry as THREE.BoxGeometry;
      expect(geometry.parameters.width).toBe(
        CUBE_CONSTANTS.CUBE_SIZE - CUBE_CONSTANTS.EDGE_SECTION_SIZE,
      );
      expect(geometry.parameters.height).toBe(CUBE_CONSTANTS.EDGE_SECTION_SIZE);
      expect(geometry.parameters.depth).toBe(CUBE_CONSTANTS.EDGE_SECTION_SIZE);
    });
  });

  describe("createCornerCube", () => {
    it("should create a corner cube with correct properties", () => {
      const pos = new THREE.Vector3(1, 2, 3);
      const index = 0;

      const cornerCube = CubePartFactory.createCornerCube(pos, index);

      expect(cornerCube).toBeInstanceOf(THREE.Mesh);
      expect(cornerCube.name).toBe("Corner Cube 0");
      expect(cornerCube.position).toEqual(pos);
      expect(cornerCube.geometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(cornerCube.material).toBeInstanceOf(THREE.MeshStandardMaterial);
      const color = (cornerCube.material as THREE.MeshStandardMaterial).color
        .getHexString()
        .toUpperCase();
      expect(`#${color}`).toBe(CUBE_CONSTANTS.CORNER_COLOR);

      const geometry = cornerCube.geometry as THREE.BoxGeometry;
      expect(geometry.parameters.width).toBe(CUBE_CONSTANTS.EDGE_SECTION_SIZE);
      expect(geometry.parameters.height).toBe(CUBE_CONSTANTS.EDGE_SECTION_SIZE);
      expect(geometry.parameters.depth).toBe(CUBE_CONSTANTS.EDGE_SECTION_SIZE);
    });
  });

  describe("createFace", () => {
    it("should create a face group with correct properties", () => {
      const pos = new THREE.Vector3(1, 2, 3);
      const rotation = new THREE.Euler(0, Math.PI / 2, 0);
      const label = "A";

      const faceGroup = CubePartFactory.createFace(pos, rotation, label);

      expect(faceGroup).toBeInstanceOf(THREE.Group);
      expect(faceGroup.position).toEqual(pos);
      expect(faceGroup.rotation.y).toEqual(rotation.y);

      expect(faceGroup.children.length).toBe(2);

      const faceMesh = faceGroup.children[0] as THREE.Mesh;
      expect(faceMesh.name).toBe("Face Box A");
      expect(faceMesh.geometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(faceMesh.material).toBeInstanceOf(THREE.MeshStandardMaterial);
      const color = (faceMesh.material as THREE.MeshStandardMaterial).color
        .getHexString()
        .toUpperCase();
      expect(`#${color}`).toBe(CUBE_CONSTANTS.FACE_COLOR);

      const textPlane = faceGroup.children[1] as THREE.Mesh;
      expect(textPlane.geometry).toBeInstanceOf(THREE.PlaneGeometry);
      expect(textPlane.material).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(
        (textPlane.material as THREE.MeshStandardMaterial).map,
      ).toBeTruthy();
    });
  });
});
