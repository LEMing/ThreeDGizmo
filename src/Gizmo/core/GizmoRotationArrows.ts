import * as THREE from "three";
import { ROTATION_ARROWS_NAME } from "../constants";

// Geometric constants
const QUARTER_CIRCLE_ANGLE = Math.PI / 2;
const HALF_PI = Math.PI / 2;
const FULL_PI = Math.PI;

// Default curve constants
const DEFAULT_NUM_POINTS = 32;
const DEFAULT_RADIUS = 2.2;
const DEFAULT_TUBE_RADIUS = 0.1;
const DEFAULT_TUBE_SEGMENTS = 8;
const DEFAULT_COLOR = 0x4169e1; // Royal Blue

// Arrow head constants
const ARROW_HEAD = {
  SIZE: 0.3,
  DEPTH: 0.1,
  HEIGHT_RATIO: 1.33, // Ratio of arrow height to width
  SEGMENTS: 1,
} as const;

// Geometry constants
const EXTRUDE_SETTINGS = {
  steps: ARROW_HEAD.SEGMENTS,
  depth: ARROW_HEAD.DEPTH,
  bevelEnabled: false,
} as const;

interface ArrowConfig {
  radius?: number;
  color?: number;
}

class CurveFactory {
  private points: THREE.Vector3[];

  constructor(radius: number) {
    this.points = this.generateQuarterCirclePoints(radius);
  }
   
  private generateQuarterCirclePoints(radius: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= DEFAULT_NUM_POINTS; i++) {
      const theta = (QUARTER_CIRCLE_ANGLE * i) / DEFAULT_NUM_POINTS;
      const x = radius * Math.sin(theta);
      const y = radius * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    return points;
  }

  public splitCurve(): [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3] {
    const midPoint = Math.floor(this.points.length / 2);
    const points1 = this.points.slice(0, midPoint);
    const points2 = this.points.slice(midPoint);

    return [
      new THREE.CatmullRomCurve3(points1),
      new THREE.CatmullRomCurve3(points2)
    ];
  }
}

class ArrowHead {
  private geometry: THREE.ExtrudeGeometry;
  private material: THREE.Material;

  constructor(color: number) {
    const shape = this.createArrowShape();
    this.geometry = this.createGeometry(shape);
    this.material = new THREE.MeshBasicMaterial({ color });
  }

  private createArrowShape(): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(ARROW_HEAD.SIZE, -ARROW_HEAD.SIZE * ARROW_HEAD.HEIGHT_RATIO);
    shape.lineTo(-ARROW_HEAD.SIZE, -ARROW_HEAD.SIZE * ARROW_HEAD.HEIGHT_RATIO);
    shape.lineTo(0, 0);
    return shape;
  }

  private createGeometry(shape: THREE.Shape): THREE.ExtrudeGeometry {
    return new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
  }

  public createMesh(): THREE.Mesh {
    return new THREE.Mesh(this.geometry.clone(), this.material);
  }
}

export default class RotationArrows {
  private readonly radius: number;
  private readonly color: number;

  constructor(config: ArrowConfig = {}) {
    this.radius = config.radius ?? DEFAULT_RADIUS;
    this.color = config.color ?? DEFAULT_COLOR;
  }

  public create(): THREE.Group {
    const group = new THREE.Group();
    const curveFactory = new CurveFactory(this.radius);
    const [curve1, curve2] = curveFactory.splitCurve();
    
    const tubes = this.createTubes(curve1, curve2);
    const arrowHeads = this.createArrowHeads(curve1, curve2);
    
    group.add(...tubes, ...arrowHeads);
    group.name = ROTATION_ARROWS_NAME;
    
    return group;
  }

  private createTubes(curve1: THREE.CatmullRomCurve3, curve2: THREE.CatmullRomCurve3): THREE.Mesh[] {
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    const tubeParams = [
      DEFAULT_NUM_POINTS,
      DEFAULT_TUBE_RADIUS,
      DEFAULT_TUBE_SEGMENTS,
      false
    ] as const;

    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(curve1, ...tubeParams),
      material
    );
    const tube2 = new THREE.Mesh(
      new THREE.TubeGeometry(curve2, ...tubeParams),
      material
    );

    return [tube1, tube2];
  }

  private createArrowHeads(
    curve1: THREE.CatmullRomCurve3,
    curve2: THREE.CatmullRomCurve3
  ): THREE.Mesh[] {
    const arrowHead = new ArrowHead(this.color);
    const arrow1 = arrowHead.createMesh();
    const arrow2 = arrowHead.createMesh();

    const point1 = curve1.getPoint(0);
    const point2 = curve2.getPoint(1);
    const tangent1 = curve1.getTangent(0);

    arrow1.position.copy(point1);
    arrow2.position.copy(point2);

    arrow1.rotation.z = Math.atan2(tangent1.y, tangent1.x) + HALF_PI;
    arrow2.rotation.z = FULL_PI;

    return [arrow1, arrow2];
  }
}
