import React, { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo } from './CameraController';
import getWebGLRenderer from './getWebGLRenderer';
import GizmoControl from './GizmoControl';
import './Gizmo.css';
import { GizmoCube } from './GizmoCube';
import {throttle} from './throttle';
import {GizmoOptions} from './types';

interface GizmoProps extends HTMLAttributes<HTMLDivElement> {
  camera: THREE.Camera | null;
  controls: OrbitControls | MapControls | null;
  render: () => void;
  options: GizmoOptions;
}

const Gizmo: React.FC<GizmoProps> = (
  {
    camera,
    controls,
    className,
    render,
    options,
  }) => {
  const gizmoRef = useRef<HTMLDivElement | null>(null);
  const gizmoScene = useRef(new THREE.Scene()).current;
  const [gizmoRenderer] = useState(() => getWebGLRenderer());
  const CAMERA_FOV = 50; // Field of View
  const CAMERA_ASPECT = 1; // Aspect Ratio
  const CAMERA_NEAR_CLIP = 0.1; // Near Clipping Plane
  const CAMERA_FAR_CLIP = 100; // Far Clipping Plane

  const gizmoCamera = useRef(new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR_CLIP, CAMERA_FAR_CLIP)).current;  gizmoCamera.up.copy(options.up);

  const gizmoControlRef = useRef<GizmoControl | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const clickStartTime = useRef<number | null>(null);
  const clickStartPosition = useRef<{ x: number; y: number } | null>(null);

  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;

  const renderGizmo = useCallback(() => {
    if (!gizmoRenderer) return;
    render();
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  }, [render, gizmoRenderer, gizmoScene, gizmoCamera]);

  const animateCameraToPosition = (startPosition: THREE.Vector3, targetPosition: THREE.Vector3, duration: number, onUpdate: () => void) => {
    const startTime = performance.now();

    const animate = () => {
      const elapsedTime = performance.now() - startTime;
      const t = Math.min(elapsedTime / duration, 1); // Normalize t within the range of 0 to 1

      // Linear interpolation between start and target position
      camera!.position.lerpVectors(startPosition, targetPosition, t);

      // Update controls and render the scene
      controls?.update();
      onUpdate();

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const alignCameraWithVector = useCallback((vector: THREE.Vector3) => {
    if (!camera || !controls) return;

    const distance = camera.position.length(); // Store current distance from center
    const newPosition = vector.clone().multiplyScalar(distance);

    // Start the transition animation
    const CAMERA_ANIMATION_DURATION = 400; // in milliseconds
    animateCameraToPosition(camera.position.clone(), newPosition, CAMERA_ANIMATION_DURATION, renderGizmo);

    // Point the camera at the center of the scene
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Update the camera's up vector
    camera.up.set(0, 1, 0);

    // Update controls
    controls.target.set(0, 0, 0);
  }, [camera, controls, renderGizmo]);

  const updateMousePosition = useCallback((event: MouseEvent) => {
    if (!gizmoRenderer) return;
    const rect = gizmoRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gizmoRenderer, mouse]);

  const checkIntersection = useCallback(() => {
    if (!gizmoCamera || !gizmoScene) return null;
    raycaster.setFromCamera(mouse, gizmoCamera);
    const intersects = raycaster.intersectObjects(gizmoScene.children, true);
    const exceptions = ['Wireframe', ''];
    return intersects.find(intersect => !exceptions.includes(intersect.object.name))?.object || null;
  }, [gizmoCamera, gizmoScene, raycaster, mouse]);

  const handleClick = useCallback((intersectedObject: THREE.Object3D | null) => {
    const gizmoCube: GizmoCube = intersectedObject?.userData.gizmoCube;
    if (intersectedObject && gizmoCube) {
      gizmoCube.handleClick();
      const vectorToCube = gizmoCube.vectorToCube;
      if (vectorToCube) {
        alignCameraWithVector(vectorToCube);
      }
    }
  }, [alignCameraWithVector]);

  const onMouseDown = useCallback((event: MouseEvent) => {
    clickStartTime.current = Date.now();
    clickStartPosition.current = { x: event.clientX, y: event.clientY };
    setIsRotating(false);
  }, []);

  const MOUSE_MOVE_THROTTLE_FPS = 25;
  const onMouseMove = useCallback(throttle((event: MouseEvent) => {
    if (!gizmoControlRef.current) return; // Check if gizmoControlRef is initialized
    updateMousePosition(event);
    const intersectedObject = checkIntersection();

    if (intersectedObject && intersectedObject.userData.gizmoCube) {
      intersectedObject.userData.gizmoCube.highlightObject(intersectedObject);
    } else {
      const anyObject = gizmoScene.children[0];
      if (anyObject && anyObject.userData.gizmoCube) {
        anyObject.userData.gizmoCube.highlightObject(null);
      }
    }

  }, 1000 / MOUSE_MOVE_THROTTLE_FPS), [updateMousePosition, checkIntersection, gizmoScene, renderGizmo]);

  const onMouseUp = useCallback((event: MouseEvent) => {
    const clickDuration = clickStartTime.current ? Date.now() - clickStartTime.current : 0;
    if (!isRotating && clickDuration < 200) {
      updateMousePosition(event);
      const intersectedObject = checkIntersection();
      handleClick(intersectedObject);
    }
    clickStartTime.current = null;
    clickStartPosition.current = null;
    setIsRotating(false);
  }, [isRotating, updateMousePosition, checkIntersection, handleClick]);

  useEffect(() => {
    const gizmoDiv = gizmoRef.current;
    if (!gizmoDiv || !camera || !controls || !gizmoRenderer) return;

    // Initialize GizmoControl
    if (gizmoControlRef.current) {
      gizmoControlRef.current.dispose();
    }

    const gizmoParams = {
      gizmoDiv,
      gizmoScene,
      gizmoRenderer,
      gizmoCamera,
    };

    const mainParams = {
      mainCamera: camera,
      mainControls: controls,
      renderGizmo,
    };

    const syncFunctions = {
      syncGizmoCameraWithMain,
      syncMainCameraWithGizmo,
    };

    gizmoControlRef.current = new GizmoControl({
      gizmoParams,
      mainParams,
      syncFunctions,
    });

    // Add event listeners to the DOM element
    gizmoDiv.addEventListener('mousedown', onMouseDown);
    gizmoDiv.addEventListener('mousemove', onMouseMove);
    gizmoDiv.addEventListener('mouseup', onMouseUp);

    return () => {
      if (gizmoControlRef.current) {
        gizmoControlRef.current.dispose();
        gizmoControlRef.current = null;
      }
      gizmoDiv.removeEventListener('mousedown', onMouseDown);
      gizmoDiv.removeEventListener('mousemove', onMouseMove);
      gizmoDiv.removeEventListener('mouseup', onMouseUp);
    };
  }, [camera, controls, renderGizmo, onMouseMove, onMouseDown, onMouseUp]);

  useEffect(() => {
    if (!camera) return;
    syncGizmoCameraWithMain(gizmoCamera, camera);
    renderGizmo();
  }, [camera, renderGizmo]);

  return (
    <div
      className={className ? `${className}` : 'gizmo-default'}
      ref={gizmoRef}
    />
  );
};

export default Gizmo;
