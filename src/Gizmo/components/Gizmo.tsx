import React, {HTMLAttributes, useCallback, useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {animateCameraToPosition} from '../utils/animateCameraToPosition';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo } from '../core/CameraController';
import getWebGLRenderer from '../utils/getWebGLRenderer';
import GizmoControl from '../core/GizmoControl';
import '../Gizmo.css';
import { GizmoOptions } from '../types';
import { useGizmoMouseEvents } from '../hooks/useGizmoMouseEvents';

interface GizmoProps extends HTMLAttributes<HTMLDivElement> {
  camera: THREE.Camera | null;
  controls: OrbitControls | MapControls | null;
  render: () => void;
  options: GizmoOptions;
}

const Gizmo: React.FC<GizmoProps> = ({
    camera,
    controls,
    className,
    render,
    options,
  }) => {
  const gizmoRef = useRef<HTMLDivElement | null>(null);
  const gizmoScene = useRef(new THREE.Scene()).current;
  const [gizmoRenderer] = useState(() => getWebGLRenderer());
  const CAMERA_FOV = 30;
  const CAMERA_ASPECT = 1;
  const CAMERA_NEAR_CLIP = 0.1;
  const CAMERA_FAR_CLIP = 10;
  const gizmoDefaultCamera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR_CLIP, CAMERA_FAR_CLIP);

  const gizmoCamera = useRef(gizmoDefaultCamera).current;
  gizmoCamera.up.copy(options.up);

  const gizmoControlRef = useRef<GizmoControl | null>(null);

  const renderGizmo = useCallback(() => {
    if (!gizmoRenderer) return;
    render();
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  }, [render, gizmoRenderer, gizmoScene, gizmoCamera]);

  const alignCameraWithVector = useCallback((vector: THREE.Vector3) => {
    if (!camera || !controls) return;

    const distance = camera.position.length();
    const newPosition = vector.clone().multiplyScalar(distance);
    const CAMERA_ANIMATION_DURATION = 400;

    animateCameraToPosition(
      camera,
      controls,
      camera.position.clone(),
      newPosition,
      CAMERA_ANIMATION_DURATION,
      renderGizmo
    );

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.up.set(0, 1, 0);
    controls.target.set(0, 0, 0);
  }, [camera, controls, renderGizmo]);

  const { onMouseDown, onMouseMove, onMouseUp } = useGizmoMouseEvents({
    gizmoRenderer,
    gizmoScene,
    gizmoCamera,
    alignCameraWithVector,
    gizmoControlRef,
  });

  useEffect(() => {
    const gizmoDiv = gizmoRef.current;
    if (!gizmoDiv || !camera || !controls || !gizmoRenderer) return;

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