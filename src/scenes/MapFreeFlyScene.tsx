import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import {addLighting} from '../Gizmo/addLighting';
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
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(640, 360);
    renderer.pixelRatio = window.devicePixelRatio;
    divRef.current.appendChild(renderer.domElement);

    // Set up MapControls for free fly interaction
    const newControls = new MapControls(newCamera, renderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.05;
    newControls.screenSpacePanning = false;
    newControls.maxPolarAngle = Math.PI / 2;
    setControls(newControls);

    // Create a plane to simulate a map surface
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    addLighting(scene);

    newCamera.position.set(10, 10, 10);
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
    <div ref={divRef} className="map-scene" style={{ width: '640px', height: '360px' }}>
      {camera && controls && (
        <Gizmo
          render={() => console.log('render')}
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
