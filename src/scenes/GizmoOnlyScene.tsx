import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Gizmo from '../Gizmo/components/Gizmo';

const GizmoOnlyScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(75, 640 / 360, 0.1, 1000);
    setCamera(newCamera);
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.pixelRatio = window.devicePixelRatio;
    renderer.setSize(640, 360);

    divRef.current.appendChild(renderer.domElement);

    // Set up OrbitControls
    const newControls = new OrbitControls(newCamera, renderer.domElement);
    setControls(newControls);

    newCamera.position.set(5, 5, 5);
    newControls.update();

    // Rendering loop
    const renderScene = () => {
      requestAnimationFrame(renderScene);
      renderer.render(scene, newCamera);
    };

    renderScene();

    return () => {
      renderer.dispose();
      if (divRef.current) {
        divRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={divRef} className="gizmo-scene" style={{ width: '640px', height: '360px' }}>
      {camera && controls && (
        <Gizmo
          render={() => console.log('Gizmo only rendering external scene')}
          camera={camera}
          controls={controls}
          className="custom-gizmo-style"
          options={{ up: new THREE.Vector3(0, 1, 0) }}
        />
      )}
    </div>
  );
};

export default GizmoOnlyScene;
