import * as THREE from "three";
import { LEFT_ROTATION_ARROW_NAME, RIGHT_ROTATION_ARROW_NAME, ROTATION_ARROWS_NAME } from "../constants";

// Geometric constants
const QUARTER_CIRCLE_ANGLE = Math.PI / 2;
const HALF_PI = Math.PI / 2;
const FULL_PI = Math.PI;

// Default curve constants
const DEFAULT_NUM_POINTS = 64;
const DEFAULT_RADIUS = 2;
const DEFAULT_TUBE_RADIUS = 0.12;
const DEFAULT_TUBE_SEGMENTS = 8;
const DEFAULT_COLOR = 0x4169e1;

// Arrow head constants
const ARROW_HEAD = {
  SIZE: 0.3,
  DEPTH: 0.1,
  HEIGHT_RATIO: 1.33,
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
    const [leftCurve, rightCurve] = curveFactory.splitCurve();
    
    const tubes = this.createTubes(leftCurve, rightCurve);
    const arrowHeads = this.createArrowHeads(leftCurve, rightCurve);
    
    group.add(...tubes, ...arrowHeads);
    group.name = ROTATION_ARROWS_NAME;
    
    return group;
  }

  private createTubes(leftCurve: THREE.CatmullRomCurve3, rightCurve: THREE.CatmullRomCurve3): THREE.Mesh[] {
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    const tubeParams = [
      DEFAULT_NUM_POINTS,
      DEFAULT_TUBE_RADIUS,
      DEFAULT_TUBE_SEGMENTS,
      false
    ] as const;

    const leftTube = new THREE.Mesh(
      new THREE.TubeGeometry(leftCurve, ...tubeParams),
      material
    );
    leftTube.name = LEFT_ROTATION_ARROW_NAME;

    const rightTube = new THREE.Mesh(
      new THREE.TubeGeometry(rightCurve, ...tubeParams),
      material
    );
    rightTube.name = RIGHT_ROTATION_ARROW_NAME;

    return [leftTube, rightTube];
  }

  private createArrowHeads(
    leftCurve: THREE.CatmullRomCurve3,
    rightCurve: THREE.CatmullRomCurve3
  ): THREE.Mesh[] {
    const arrowHead = new ArrowHead(this.color);
    const leftArrowHead = arrowHead.createMesh();
    const rightArrowHead = arrowHead.createMesh();

    const point1 = leftCurve.getPoint(0);
    const point2 = rightCurve.getPoint(1);
    const tangent1 = leftCurve.getTangent(0);

    leftArrowHead.position.copy(point1);
    rightArrowHead.position.copy(point2);

    leftArrowHead.rotation.z = Math.atan2(tangent1.y, tangent1.x) + HALF_PI;
    rightArrowHead.rotation.z = FULL_PI;

    leftArrowHead.name = LEFT_ROTATION_ARROW_NAME;
    rightArrowHead.name = RIGHT_ROTATION_ARROW_NAME;

    return [leftArrowHead, rightArrowHead];
  }
}
