import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Gizmo from '../../components/Gizmo/Gizmo';
import { addLighting } from '../../../infrastructure/three/lighting/addLighting';

const GizmoOnlyScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    renderer.setPixelRatio(window.devicePixelRatio);
    divRef.current.appendChild(renderer.domElement);

    // Set up lighting
    addLighting(scene);

    // Set up camera
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    setCamera(camera);

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    setControls(controls);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      renderer.dispose();
      if (divRef.current && divRef.current.contains(renderer.domElement)) {
        divRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={divRef} style={{ width: '640px', height: '480px', position: 'relative' }}>
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