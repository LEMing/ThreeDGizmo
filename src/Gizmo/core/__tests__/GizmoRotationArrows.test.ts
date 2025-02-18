import * as THREE from "three";
import GizmoRotationArrows from "../GizmoRotationArrows";
import {
  LEFT_ROTATION_ARROW_NAME,
  RIGHT_ROTATION_ARROW_NAME,
  ROTATION_ARROWS_NAME,
} from "../../constants";

describe("GizmoRotationArrows", () => {
  let gizmo: GizmoRotationArrows;

  beforeEach(() => {
    gizmo = new GizmoRotationArrows();
  });

  describe("creation", () => {
    it("should create a group with default configuration", () => {
      const group = gizmo.create();

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe(ROTATION_ARROWS_NAME);
    });

    it("should create a group with custom configuration", () => {
      const customConfig = {
        radius: 3.0,
        color: 0xff0000,
        tubeRadius: 0.2,
      };
      const customGizmo = new GizmoRotationArrows(customConfig);
      const group = customGizmo.create();

      expect(group).toBeInstanceOf(THREE.Group);
      const mesh = group.children[0] as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      expect(material.color.getHex()).toBe(customConfig.color);
    });
  });

  describe("group structure", () => {
    let group: THREE.Group;

    beforeEach(() => {
      group = gizmo.create();
    });

    it("should contain exactly four meshes (two tubes and two arrow heads)", () => {
      expect(group.children.length).toBe(4);
      group.children.forEach((child) => {
        expect(child).toBeInstanceOf(THREE.Mesh);
      });
    });

    it("should have correctly named components", () => {
      const leftComponents = group.children.filter(
        (child) => child.name === LEFT_ROTATION_ARROW_NAME,
      );
      const rightComponents = group.children.filter(
        (child) => child.name === RIGHT_ROTATION_ARROW_NAME,
      );

      expect(leftComponents.length).toBe(2); // tube and arrow head
      expect(rightComponents.length).toBe(2); // tube and arrow head
    });
  });

  describe("geometry", () => {
    let group: THREE.Group;

    beforeEach(() => {
      group = gizmo.create();
    });

    it("should create tubes with correct geometry", () => {
      const tubes = group.children.filter(
        (child) => (child as THREE.Mesh).geometry instanceof THREE.TubeGeometry,
      );

      expect(tubes.length).toBe(2);
      tubes.forEach((tube) => {
        const geometry = (tube as THREE.Mesh).geometry as THREE.TubeGeometry;
        expect(geometry.parameters.tubularSegments).toBe(64); // numPoints
        expect(geometry.parameters.radius).toBe(0.1); // tubeRadius
        expect(geometry.parameters.radialSegments).toBe(8); // tubeSegments
      });
    });

    it("should create arrow heads with correct geometry", () => {
      const arrowHeads = group.children.filter(
        (child) =>
          (child as THREE.Mesh).geometry instanceof THREE.ExtrudeGeometry,
      );

      expect(arrowHeads.length).toBe(2);
    });
  });

  describe("positioning", () => {
    let group: THREE.Group;

    beforeEach(() => {
      group = gizmo.create();
    });

    it("should position arrow heads at the ends of the tubes", () => {
      const leftTube = group.children.find(
        (child) =>
          child.name === LEFT_ROTATION_ARROW_NAME &&
          (child as THREE.Mesh).geometry instanceof THREE.TubeGeometry,
      ) as THREE.Mesh;

      const leftArrowHead = group.children.find(
        (child) =>
          child.name === LEFT_ROTATION_ARROW_NAME &&
          (child as THREE.Mesh).geometry instanceof THREE.ExtrudeGeometry,
      ) as THREE.Mesh;

      // Verify that the arrow head is positioned near the end of the tube
      const tubePoints = (
        leftTube.geometry as THREE.TubeGeometry
      ).parameters.path.getPoints();
      const firstTubePoint = tubePoints[0];
      expect(leftArrowHead.position.distanceTo(firstTubePoint)).toBeLessThan(
        0.1,
      );
    });
  });

  describe("material", () => {
    it("should use the same material for all meshes", () => {
      const group = gizmo.create();
      const materials = new Set(
        group.children.map((child) => (child as THREE.Mesh).material),
      );

      expect(materials.size).toBe(1); // All meshes should share the same material
      const material = materials.values().next()
        .value as THREE.MeshBasicMaterial;
      expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
      expect(material.color.getHex()).toBe(0xbcbfbe); // Default color
    });
  });
});
