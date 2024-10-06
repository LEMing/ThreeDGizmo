import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { addLighting } from '../Gizmo/addLighting';
import Gizmo from '../Gizmo/Gizmo';

const MapFreeFlyScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<MapControls | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(75, 640 / 360, 0.1, 1000);
    setCamera(newCamera);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 360);
    renderer.setPixelRatio(window.devicePixelRatio); // Use setPixelRatio instead of pixelRatio property
    divRef.current.appendChild(renderer.domElement);

    // Set up MapControls for free fly interaction
    const newControls = new MapControls(newCamera, renderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 1;
    newControls.screenSpacePanning = false;
    newControls.maxPolarAngle = Math.PI / 2;
    setControls(newControls);

    // Add lighting to the scene
    addLighting(scene);

    // Set camera position
    newCamera.position.set(10, 10, 10);
    newControls.update();

    // Create a plane to simulate a map surface
    const geometry = new THREE.PlaneGeometry(100, 100);
    // We'll update the material after loading the texture

    // Load the forest texture
    const textureLoader = new THREE.TextureLoader();
    const textureURL = 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg';

    textureLoader.load(
      textureURL,
      (texture) => {
        // Texture loaded successfully
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4); // Adjust to repeat the texture

        const material = new THREE.MeshStandardMaterial({ map: texture });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
        scene.add(plane);
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the texture:', error);
        // Use a default material if texture fails to load
        const material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
      }
    );

    // Rendering loop
    const renderScene = () => {
      requestAnimationFrame(renderScene);
      newControls.update(); // Ensure controls are updated
      renderer.render(scene, newCamera);
    };

    renderScene();

    // Cleanup
    return () => {
      renderer.dispose();
      if (divRef.current) {
        divRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={divRef} className="map-scene" style={{ width: '640px', height: '360px' }}>
      {camera && controls && (
        <Gizmo
          render={() => console.log('Call external rendering function')}
          camera={camera}
          controls={controls}
          className="map-gizmo-style"
          options={{ up: new THREE.Vector3(0, 1, 0) }}
        />
      )}
    </div>
  );
};

export default MapFreeFlyScene;
