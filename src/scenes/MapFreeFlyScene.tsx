import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { addLighting } from '../Gizmo/addLighting';
import Gizmo from '../Gizmo/Gizmo';

const MapFreeFlyScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [camera, setCamera] = useState<THREE.Camera | null>(null);
  const [controls, setControls] = useState<MapControls | null>(null);
  const [cameraType, setCameraType] = useState<'orthographic' | 'perspective'>('orthographic');

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Initialize the scene and renderer only once
  useEffect(() => {
    if (!divRef.current) return;

    // Create scene and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 360);
    renderer.setPixelRatio(window.devicePixelRatio);
    divRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting to the scene
    addLighting(scene);

    // Create a plane to simulate a map surface
    const geometry = new THREE.PlaneGeometry(100, 100);

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

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (divRef.current) {
          divRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  // Update camera and controls when cameraType changes
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current) return;

    const aspect = 640 / 360; // Same aspect ratio as the div dimensions
    const frustumSize = 100; // Adjust this to cover your entire scene

    // Dispose of previous controls
    if (controls) {
      controls.dispose();
    }

    // Create camera based on the selected camera type
    let newCamera: THREE.Camera;
    if (cameraType === 'orthographic') {
      // Create Orthographic Camera
      newCamera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2, // left
        (frustumSize * aspect) / 2,  // right
        frustumSize / 2,             // top
        frustumSize / -2,            // bottom
        0.1,                         // near
        100000000000                 // far
      );
      (newCamera as THREE.OrthographicCamera).zoom = 1.5; // Increase zoom if necessary
      // @ts-ignore
      newCamera.updateProjectionMatrix();
    } else {
      // Create Perspective Camera
      newCamera = new THREE.PerspectiveCamera(
        75,    // Field of View
        aspect, // Aspect ratio
        0.1,   // Near clipping plane
        100000000000 // Far clipping plane
      );
    }

    // Set camera position and look at the center
    newCamera.position.set(10, 10, 10);
    newCamera.lookAt(0, 0, 0);

    setCamera(newCamera);

    // Set up MapControls for free fly interaction
    const newControls = new MapControls(newCamera, rendererRef.current.domElement);
    newControls.enableDamping = true;
    newControls.zoomToCursor = true;
    newControls.dampingFactor = 1;
    newControls.screenSpacePanning = false;
    newControls.maxPolarAngle = Math.PI / 2;
    setControls(newControls);

    // Rendering loop
    const renderScene = () => {
      animationFrameIdRef.current = requestAnimationFrame(renderScene);
      newControls.update(); // Ensure controls are updated
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, newCamera);
      }
    };
    renderScene();

    // Cleanup when the component unmounts or cameraType changes
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      newControls.dispose();
    };
  }, [cameraType]);

  return (
    <div ref={divRef} className="map-scene" style={{ width: '640px', height: '360px', position: 'relative' }}>
      {/* Control to change camera type */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        <select
          value={cameraType}
          onChange={(e) => setCameraType(e.target.value as 'orthographic' | 'perspective')}
        >
          <option value="orthographic">Orthographic Camera</option>
          <option value="perspective">Perspective Camera</option>
        </select>
      </div>
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
