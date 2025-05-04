import * as THREE from 'three';
import GizmoRotationArrows from '../../../gizmo/entities/GizmoRotationArrows';
import {
  LEFT_ROTATION_ARROW_NAME,
  RIGHT_ROTATION_ARROW_NAME,
  ROTATION_ARROWS_NAME,
} from '../../../gizmo/constants';

describe('GizmoRotationArrows', () => {
  let gizmoRotationArrows: GizmoRotationArrows;

  beforeEach(() => {
    gizmoRotationArrows = new GizmoRotationArrows();
    jest.clearAllMocks();
  });

  describe('constructor and configuration', () => {
    test('initializes with default configuration when no config provided', () => {
      const arrows = new GizmoRotationArrows();
      // Using any to access private property for testing
      const config = (arrows as any).config;
      
      expect(config.radius).toBe(2.1);
      expect(config.color).toBe(0xbcbfbe);
      expect(config.tubeRadius).toBe(0.1);
      expect(config.tubeSegments).toBe(8);
      expect(config.numPoints).toBe(64);
      expect(config.tubeOffset).toBe(1.5);
    });

    test('merges custom config with defaults', () => {
      const customConfig = {
        radius: 3.0,
        color: 0xff0000,
        tubeRadius: 0.2,
      };
      
      const arrows = new GizmoRotationArrows(customConfig);
      const config = (arrows as any).config;
      
      expect(config.radius).toBe(3.0);
      expect(config.color).toBe(0xff0000);
      expect(config.tubeRadius).toBe(0.2);
      expect(config.tubeSegments).toBe(8); // Default value
      expect(config.numPoints).toBe(64); // Default value
      expect(config.tubeOffset).toBe(1.5); // Default value
    });

    test('creates material with correct color', () => {
      const customColor = 0x00ff00;
      const arrows = new GizmoRotationArrows({ color: customColor });
      const material = (arrows as any).material;
      
      expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
      expect(material.color.getHex()).toBe(customColor);
    });
    
    test('accepts empty object as config', () => {
      const arrows = new GizmoRotationArrows({});
      const config = (arrows as any).config;
      
      // Should use all defaults
      expect(config.radius).toBe(2.1);
      expect(config.color).toBe(0xbcbfbe);
      expect(config.tubeRadius).toBe(0.1);
      expect(config.tubeSegments).toBe(8);
      expect(config.numPoints).toBe(64);
      expect(config.tubeOffset).toBe(1.5);
    });
    
    test('handles all custom configuration properties', () => {
      const fullCustomConfig = {
        radius: 3.5,
        color: 0xff0000,
        tubeRadius: 0.3,
        tubeSegments: 12,
        numPoints: 128,
        tubeOffset: 2.0,
      };
      
      const arrows = new GizmoRotationArrows(fullCustomConfig);
      const config = (arrows as any).config;
      
      expect(config.radius).toBe(3.5);
      expect(config.color).toBe(0xff0000);
      expect(config.tubeRadius).toBe(0.3);
      expect(config.tubeSegments).toBe(12);
      expect(config.numPoints).toBe(128);
      expect(config.tubeOffset).toBe(2.0);
    });
  });

  describe('create method', () => {
    test('returns a THREE.Group', () => {
      const group = gizmoRotationArrows.create();
      
      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe(ROTATION_ARROWS_NAME);
    });

    test('creates group with correct child elements', () => {
      const createTubesSpy = jest.spyOn(gizmoRotationArrows as any, 'createTubes')
        .mockReturnValue([new THREE.Mesh(), new THREE.Mesh()]);
      
      const createArrowHeadsSpy = jest.spyOn(gizmoRotationArrows as any, 'createArrowHeads')
        .mockReturnValue([new THREE.Mesh(), new THREE.Mesh()]);
      
      const group = gizmoRotationArrows.create();
      
      expect(createTubesSpy).toHaveBeenCalled();
      expect(createArrowHeadsSpy).toHaveBeenCalled();
      expect(group.children.length).toBe(4); // 2 tubes + 2 arrow heads
      
      createTubesSpy.mockRestore();
      createArrowHeadsSpy.mockRestore();
    });
    
    test('create method uses createQuarterCircleCurves', () => {
      // Mock implementation to avoid THREE.js errors
      const mockCurves = [
        { isCatmullRomCurve3: true },
        { isCatmullRomCurve3: true }
      ];
      
      // Mock both methods to avoid calling real implementation
      const createCurvesSpy = jest.spyOn(gizmoRotationArrows as any, 'createQuarterCircleCurves')
        .mockReturnValue(mockCurves);
      
      const createTubesSpy = jest.spyOn(gizmoRotationArrows as any, 'createTubes')
        .mockReturnValue([new THREE.Mesh(), new THREE.Mesh()]);
      
      const createArrowHeadsSpy = jest.spyOn(gizmoRotationArrows as any, 'createArrowHeads')
        .mockReturnValue([new THREE.Mesh(), new THREE.Mesh()]);
      
      // Call the method under test
      gizmoRotationArrows.create();
      
      // Verify the method was called
      expect(createCurvesSpy).toHaveBeenCalled();
      
      // Clean up
      createCurvesSpy.mockRestore();
      createTubesSpy.mockRestore();
      createArrowHeadsSpy.mockRestore();
    });
    
    test('create method properly adds meshes to group', () => {
      // Create mock meshes with distinct names for testing
      const mockLeftTube = new THREE.Mesh();
      mockLeftTube.name = LEFT_ROTATION_ARROW_NAME + '-tube';
      
      const mockRightTube = new THREE.Mesh();
      mockRightTube.name = RIGHT_ROTATION_ARROW_NAME + '-tube';
      
      const mockLeftHead = new THREE.Mesh();
      mockLeftHead.name = LEFT_ROTATION_ARROW_NAME + '-head';
      
      const mockRightHead = new THREE.Mesh();
      mockRightHead.name = RIGHT_ROTATION_ARROW_NAME + '-head';
      
      // Spy on the private methods to return our mock objects
      const createTubesSpy = jest.spyOn(gizmoRotationArrows as any, 'createTubes')
        .mockReturnValue([mockLeftTube, mockRightTube]);
      
      const createArrowHeadsSpy = jest.spyOn(gizmoRotationArrows as any, 'createArrowHeads')
        .mockReturnValue([mockLeftHead, mockRightHead]);
      
      // Create the group
      const group = gizmoRotationArrows.create();
      
      // Verify all mock objects were added to the group
      expect(group.children).toContain(mockLeftTube);
      expect(group.children).toContain(mockRightTube);
      expect(group.children).toContain(mockLeftHead);
      expect(group.children).toContain(mockRightHead);
      
      // Cleanup
      createTubesSpy.mockRestore();
      createArrowHeadsSpy.mockRestore();
    });
    
    test('different instances create independent groups', () => {
      const arrows1 = new GizmoRotationArrows();
      const arrows2 = new GizmoRotationArrows({ color: 0xff0000 });
      
      const group1 = arrows1.create();
      const group2 = arrows2.create();
      
      // Each should be a distinct instance
      expect(group1).not.toBe(group2);
      
      // Different material color on children
      const material1 = (group1.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const material2 = (group2.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
      
      expect(material1.color.getHex()).not.toBe(material2.color.getHex());
    });
  });

  describe('private curve generation methods', () => {
    test('generateQuarterCirclePoints creates correct number of points', () => {
      const points = (gizmoRotationArrows as any).generateQuarterCirclePoints();
      
      expect(points.length).toBe(65); // numPoints (64) + 1
      expect(points[0]).toBeInstanceOf(THREE.Vector3);
    });

    test('createQuarterCircleCurves returns two curves', () => {
      const curves = (gizmoRotationArrows as any).createQuarterCircleCurves();
      
      expect(curves.length).toBe(2);
      expect(curves[0]).toBeInstanceOf(THREE.CatmullRomCurve3);
      expect(curves[1]).toBeInstanceOf(THREE.CatmullRomCurve3);
    });

    test('points are generated with correct radius', () => {
      const customRadius = 3.5;
      const arrows = new GizmoRotationArrows({ radius: customRadius });
      const points = (arrows as any).generateQuarterCirclePoints();
      
      // Get a valid index (not a decimal number)
      const sampleIndex = Math.floor(points.length / 2);
      const samplePoint = points[sampleIndex];
      
      // Verify the point exists
      expect(samplePoint).toBeDefined();
      expect(samplePoint).toBeInstanceOf(THREE.Vector3);
      
      // Calculate distance from origin
      const distanceFromOrigin = Math.sqrt(
        samplePoint.x * samplePoint.x + samplePoint.y * samplePoint.y
      );
      
      expect(distanceFromOrigin).toBeCloseTo(customRadius);
    });
    
    test('generated points form a quarter circle in first quadrant', () => {
      const points = (gizmoRotationArrows as any).generateQuarterCirclePoints();
      
      // All points should be in the first quadrant (x >= 0, y >= 0)
      for (const point of points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.z).toBe(0); // Should lie in xy plane
      }
      
      // First and last points should be at specific angles
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      
      // Calculate angles of first and last points
      const firstAngle = Math.atan2(firstPoint.x, firstPoint.y);
      const lastAngle = Math.atan2(lastPoint.x, lastPoint.y);
      
      // First angle should be around PI/8 (22.5 degrees)
      expect(firstAngle).toBeCloseTo(Math.PI / 8, 1);
      
      // Last angle should be around 3PI/8 (67.5 degrees)
      expect(lastAngle).toBeCloseTo(3 * Math.PI / 8, 1);
    });
    
    test('createQuarterCircleCurves applies offset to split points', () => {
      // Instead of mocking, let's just test the actual implementation's behavior
      const arrows = new GizmoRotationArrows({ tubeOffset: 2 });
      const points = (arrows as any).generateQuarterCirclePoints();
      const curves = (arrows as any).createQuarterCircleCurves();
      
      // Verify we got back two curves
      expect(curves.length).toBe(2);
      expect(curves[0]).toBeInstanceOf(THREE.CatmullRomCurve3);
      expect(curves[1]).toBeInstanceOf(THREE.CatmullRomCurve3);
      
      // Verify the points are split into two separate curves
      // We don't need to test exact lengths since that's implementation detail
      // Just verify that we have two non-empty curves with different points
      expect(curves[0].points.length).toBeGreaterThan(0);
      expect(curves[1].points.length).toBeGreaterThan(0);
      
      // First point of first curve should be near start of the arc
      const firstPoint = curves[0].getPoint(0);
      // Last point of second curve should be near end of the arc
      const lastPoint = curves[1].getPoint(1);
      
      // They should be different points
      expect(firstPoint.equals(lastPoint)).toBe(false);
    });
    
    test('generateQuarterCirclePoints respects numPoints config', () => {
      const customNumPoints = 32;
      const arrows = new GizmoRotationArrows({ numPoints: customNumPoints });
      const points = (arrows as any).generateQuarterCirclePoints();
      
      expect(points.length).toBe(customNumPoints + 1);
    });
  });

  describe('tube and arrow head creation', () => {
    test('createTubes creates two mesh objects with correct names', () => {
      const curves = (gizmoRotationArrows as any).createQuarterCircleCurves();
      const tubes = (gizmoRotationArrows as any).createTubes(curves);
      
      expect(tubes.length).toBe(2);
      expect(tubes[0]).toBeInstanceOf(THREE.Mesh);
      expect(tubes[1]).toBeInstanceOf(THREE.Mesh);
      expect(tubes[0].name).toBe(LEFT_ROTATION_ARROW_NAME);
      expect(tubes[1].name).toBe(RIGHT_ROTATION_ARROW_NAME);
    });

    test('createArrowHeads creates two mesh objects with correct names', () => {
      const curves = (gizmoRotationArrows as any).createQuarterCircleCurves();
      const arrowHeads = (gizmoRotationArrows as any).createArrowHeads(curves);
      
      expect(arrowHeads.length).toBe(2);
      expect(arrowHeads[0]).toBeInstanceOf(THREE.Mesh);
      expect(arrowHeads[1]).toBeInstanceOf(THREE.Mesh);
      expect(arrowHeads[0].name).toBe(LEFT_ROTATION_ARROW_NAME);
      expect(arrowHeads[1].name).toBe(RIGHT_ROTATION_ARROW_NAME);
    });

    test('createArrowShape returns a THREE.Shape', () => {
      const shape = (gizmoRotationArrows as any).createArrowShape(0.2, 1.4);
      
      expect(shape).toBeInstanceOf(THREE.Shape);
    });

    test('calculateArrowRotation returns correct angle based on tangent', () => {
      const tangent = new THREE.Vector3(1, 1, 0);
      const rotation = (gizmoRotationArrows as any).calculateArrowRotation(tangent);
      
      expect(rotation).toBeCloseTo(Math.PI / 4); // 45 degrees
    });
    
    test('createTubes creates two mesh objects with correct names and material properties', () => {
      // Since we can't directly mock THREE.TubeGeometry or spy on it,
      // let's just test the functionality of createTubes with a real instance
      
      // Get the curves from a real instance
      const curves = (gizmoRotationArrows as any).createQuarterCircleCurves();
      
      // Call the method under test
      const tubes = (gizmoRotationArrows as any).createTubes(curves);
      
      // Verify the meshes were created
      expect(tubes.length).toBe(2);
      expect(tubes[0]).toBeInstanceOf(THREE.Mesh);
      expect(tubes[1]).toBeInstanceOf(THREE.Mesh);
      
      // Verify the mesh names
      expect(tubes[0].name).toBe(LEFT_ROTATION_ARROW_NAME);
      expect(tubes[1].name).toBe(RIGHT_ROTATION_ARROW_NAME);
      
      // Verify material color
      expect((tubes[0].material as THREE.MeshBasicMaterial).color.getHex()).toBe(0xbcbfbe);
      expect((tubes[1].material as THREE.MeshBasicMaterial).color.getHex()).toBe(0xbcbfbe);
      
      // Verify geometry
      expect(tubes[0].geometry).toBeDefined();
      expect(tubes[1].geometry).toBeDefined();
    });
    
    test('createArrowHeads positions arrow heads at curve endpoints', () => {
      // Create mock curves with known points and tangents
      const mockLeftCurve = {
        getPoint: jest.fn().mockReturnValue(new THREE.Vector3(1, 0, 0)),
        getTangent: jest.fn().mockReturnValue(new THREE.Vector3(0, 1, 0))
      } as unknown as THREE.CatmullRomCurve3;
      
      const mockRightCurve = {
        getPoint: jest.fn().mockReturnValue(new THREE.Vector3(0, 1, 0)),
        getTangent: jest.fn().mockReturnValue(new THREE.Vector3(-1, 0, 0))
      } as unknown as THREE.CatmullRomCurve3;
      
      // Spy on calculation methods
      const calculateRotationSpy = jest.spyOn(gizmoRotationArrows as any, 'calculateArrowRotation')
        .mockReturnValueOnce(0) // For left curve
        .mockReturnValueOnce(Math.PI / 2); // For right curve
      
      // Create arrow heads
      const arrowHeads = (gizmoRotationArrows as any).createArrowHeads([mockLeftCurve, mockRightCurve]);
      
      // Verify positions
      expect(arrowHeads[0].position.equals(new THREE.Vector3(1, 0, 0))).toBe(true);
      expect(arrowHeads[1].position.equals(new THREE.Vector3(0, 1, 0))).toBe(true);
      
      // Verify rotations (add Math.PI/2 for left, subtract Math.PI/2 for right)
      expect(arrowHeads[0].rotation.z).toBe(Math.PI / 2);
      expect(arrowHeads[1].rotation.z).toBe(0);
      
      // Verify tangent calculations
      expect(mockLeftCurve.getTangent).toHaveBeenCalledWith(0); // First point of left curve
      expect(mockRightCurve.getTangent).toHaveBeenCalledWith(1); // Last point of right curve
      
      // Clean up
      calculateRotationSpy.mockRestore();
    });
    
    test('createArrowShape creates a triangular shape', () => {
      const size = 0.2;
      const heightRatio = 1.4;
      const shape = (gizmoRotationArrows as any).createArrowShape(size, heightRatio);
      
      // Check it's a shape with points
      expect(shape).toBeInstanceOf(THREE.Shape);
      
      // Get shape points
      const points = shape.extractPoints().shape;
      
      // Triangle should have 3 points (plus a closing point that might be the same as first)
      expect(points.length).toBeGreaterThanOrEqual(3);
      
      // The first point should be at (0,0)
      expect(points[0].x).toBeCloseTo(0);
      expect(points[0].y).toBeCloseTo(0);
      
      // The second point should be at (size, -size*heightRatio)
      expect(points[1].x).toBeCloseTo(size);
      expect(points[1].y).toBeCloseTo(-size * heightRatio);
      
      // The third point should be at (-size, -size*heightRatio)
      expect(points[2].x).toBeCloseTo(-size);
      expect(points[2].y).toBeCloseTo(-size * heightRatio);
    });
    
    test('complete GizmoRotationArrows with custom color has correct color on its materials', () => {
      const customColor = 0xff0000;
      
      // Create a full instance with custom color
      const arrows = new GizmoRotationArrows({ color: customColor });
      
      // Create the complete group
      const group = arrows.create();
      
      // Check all the meshes in the group have the custom color
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshBasicMaterial;
          expect(material.color.getHex()).toBe(customColor);
        }
      });
      
      // There should be at least 2 children with materials
      const meshesWithMaterials = group.children.filter(
        child => child instanceof THREE.Mesh && child.material
      );
      expect(meshesWithMaterials.length).toBeGreaterThan(1);
    });
  });
});