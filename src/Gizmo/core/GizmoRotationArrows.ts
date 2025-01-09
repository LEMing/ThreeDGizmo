import * as THREE from "three";
import {
  LEFT_ROTATION_ARROW_NAME,
  RIGHT_ROTATION_ARROW_NAME,
  ROTATION_ARROWS_NAME,
} from "../constants";

interface ArrowConfig {
  radius?: number;
  color?: number;
  tubeRadius?: number;
  tubeSegments?: number;
  numPoints?: number;
  tubeOffset?: number;
}

interface ArrowHeadConfig {
  size: number;
  depth: number;
  heightRatio: number;
  segments: number;
}

const DEFAULT_ARROW_CONFIG: Required<ArrowConfig> = {
  radius: 2.1,
  color: 0xbcbfbe,
  tubeRadius: 0.1,
  tubeSegments: 8,
  numPoints: 64,
  tubeOffset: 1.5,
};

const DEFAULT_ARROW_HEAD_CONFIG: ArrowHeadConfig = {
  size: 0.2,
  depth: 0.1,
  heightRatio: 1.4,
  segments: 1,
};

type CurvePair = [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3];

class GizmoRotationArrows {
  private readonly config: Required<ArrowConfig>;
  private readonly material: THREE.MeshBasicMaterial;

  constructor(config: ArrowConfig = {}) {
    this.config = { ...DEFAULT_ARROW_CONFIG, ...config };
    this.material = new THREE.MeshBasicMaterial({ color: this.config.color });
  }

  public create(): THREE.Group {
    const group = new THREE.Group();
    const curves = this.createQuarterCircleCurves();

    group.add(...this.createTubes(curves), ...this.createArrowHeads(curves));
    group.name = ROTATION_ARROWS_NAME;

    return group;
  }

  private createQuarterCircleCurves(): CurvePair {
    const points = this.generateQuarterCirclePoints();
    const midPoint = Math.floor(points.length / 2);

    return [
      new THREE.CatmullRomCurve3(points.slice(0, midPoint - this.config.tubeOffset)),
      new THREE.CatmullRomCurve3(points.slice(midPoint + this.config.tubeOffset)),
    ];
  }

  private generateQuarterCirclePoints(): THREE.Vector3[] {
    const quarterCircle = Math.PI / 2;
    const arcLength = quarterCircle / 2;
    const startAngle = quarterCircle / 4;

    return Array.from({ length: this.config.numPoints + 1 }, (_, i) => {
      const t = i / this.config.numPoints;
      const theta = startAngle + arcLength * t;
      const x = this.config.radius * Math.sin(theta);
      const y = this.config.radius * Math.cos(theta);
      return new THREE.Vector3(x, y, 0);
    });
  }

  private createTubes([leftCurve, rightCurve]: CurvePair): THREE.Mesh[] {
    const createTubeMesh = (
      curve: THREE.CatmullRomCurve3,
      name: string,
    ): THREE.Mesh => {
      const geometry = new THREE.TubeGeometry(
        curve,
        this.config.numPoints,
        this.config.tubeRadius,
        this.config.tubeSegments,
        false,
      );
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.name = name;
      return mesh;
    };

    return [
      createTubeMesh(leftCurve, LEFT_ROTATION_ARROW_NAME),
      createTubeMesh(rightCurve, RIGHT_ROTATION_ARROW_NAME),
    ];
  }

  private createArrowHeads([leftCurve, rightCurve]: CurvePair): THREE.Mesh[] {
    const { size, depth, heightRatio, segments } = DEFAULT_ARROW_HEAD_CONFIG;
    const arrowShape = this.createArrowShape(size, heightRatio);
    const geometry = new THREE.ExtrudeGeometry(arrowShape, {
      steps: segments,
      depth,
      bevelEnabled: false,
    }).center();

    const createArrowHead = (
      position: THREE.Vector3,
      rotation: number,
      name: string,
    ): THREE.Mesh => {
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.position.copy(position);
      mesh.rotation.z = rotation;
      mesh.name = name;
      return mesh;
    };

    return [
      createArrowHead(
        leftCurve.getPoint(0),
        this.calculateArrowRotation(leftCurve.getTangent(0)) + Math.PI / 2,
        LEFT_ROTATION_ARROW_NAME,
      ),
      createArrowHead(
        rightCurve.getPoint(1),
        this.calculateArrowRotation(rightCurve.getTangent(1)) - Math.PI / 2,
        RIGHT_ROTATION_ARROW_NAME,
      ),
    ];
  }

  private createArrowShape(size: number, heightRatio: number): THREE.Shape {
    return new THREE.Shape()
      .moveTo(0, 0)
      .lineTo(size, -size * heightRatio)
      .lineTo(-size, -size * heightRatio)
      .lineTo(0, 0);
  }

  private calculateArrowRotation(tangent: THREE.Vector3): number {
    return Math.atan2(tangent.y, tangent.x);
  }
}

export default GizmoRotationArrows;
