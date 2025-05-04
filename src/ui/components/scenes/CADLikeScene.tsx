import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { addLighting } from '../../../infrastructure/three/lighting/addLighting';
import Gizmo from '../../components/Gizmo/Gizmo';

const CADLikeScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null); // Reference to the div
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(75, 640 / 360, 0.1, 1000); // Aspect ratio of 640x480
    setCamera(newCamera);
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(640, 360);
    renderer.pixelRatio = window.devicePixelRatio;
    // Append renderer to div
    divRef.current.appendChild(renderer.domElement);

    // Set up OrbitControls for CAD-like interaction
    const newControls = new OrbitControls(newCamera, renderer.domElement);
    newControls.enableZoom = true;
    newControls.enablePan = true;
    newControls.rotateSpeed = 0.5;
    setControls(newControls);

    // Create a cube for visualization
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    addLighting(scene);
    scene.add(cube);

    newCamera.position.set(5, 5, 5);
    newControls.update();

    // Rendering loop
    const renderScene = () => {
      requestAnimationFrame(renderScene);
      renderer.render(scene, newCamera);
    };

    renderScene(); // Start the rendering

    return () => {
      // Cleanup on unmount
      renderer.dispose();
      if (divRef.current) {
        divRef.current.removeChild(renderer.domElement); // Clean up renderer on unmount
      }
    };
  }, []);

  return (
    <div ref={divRef} className="cad-scene" style={{ width: '640px', height: '480px' }}>
      {camera && controls && (
        <Gizmo
          render={() => console.log('Render external scene CAD-like')}
          camera={camera}
          controls={controls}
          className="cad-gizmo-style"
          options={{ up: new THREE.Vector3(0, 1, 0) }}
        />
      )}
    </div>
  );
};

export default CADLikeScene;