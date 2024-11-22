import * as THREE from "three";
import { ROTATION_ARROWS_NAME } from "../constants";

export default class RotationArrows {
  constructor() {}

  public create(): THREE.Group {
    const group = new THREE.Group();
    
    // Create quarter-circle curve points
    const numPoints = 32;
    const radius = 2.2;
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const theta = (Math.PI * i) / (numPoints * 2); // Divide by 2 for quarter circle
      const x = radius * Math.sin(theta);
      const y = radius * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Create two separate curves for the arrows
    const midPoint = Math.floor(points.length / 2);
    const points1 = points.slice(0, midPoint);
    const points2 = points.slice(midPoint);

    const curve1 = new THREE.CatmullRomCurve3(points1);
    const curve2 = new THREE.CatmullRomCurve3(points2);
    
    // Create tube geometries
    const tubeGeometry1 = new THREE.TubeGeometry(curve1, 32, 0.1, 8, false);
    const tubeGeometry2 = new THREE.TubeGeometry(curve2, 32, 0.1, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: 0x4169e1 });
    
    const tube1 = new THREE.Mesh(tubeGeometry1, material);
    const tube2 = new THREE.Mesh(tubeGeometry2, material);

    // Arrow heads
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(0.3, -0.4);
    arrowShape.lineTo(-0.3, -0.4);
    arrowShape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: false,
    };

    const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);

    const arrowMesh1 = new THREE.Mesh(arrowGeometry, material);
    const arrowMesh3 = new THREE.Mesh(arrowGeometry.clone(), material);

    const point1 = curve1.getPoint(0);
    const point2 = curve2.getPoint(1);
    
    const tangent1 = curve1.getTangent(0);

    arrowMesh1.position.copy(point1);
    arrowMesh3.position.copy(point2);

    const angle1 = Math.atan2(tangent1.y, tangent1.x);
    
    arrowMesh1.rotation.z = angle1 + Math.PI / 2;
    arrowMesh3.rotation.z = Math.PI;

    group.add(tube1);
    group.add(tube2);
    group.add(arrowMesh1);
    group.add(arrowMesh3);

    group.name = ROTATION_ARROWS_NAME;
    return group;
  }
}