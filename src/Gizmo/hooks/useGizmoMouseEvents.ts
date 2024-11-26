import React, { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { throttle } from "../utils/throttle";
import {
  updateMousePosition,
  checkIntersection,
  handleClick,
} from "../utils/mouseUtils";
import GizmoControl from "../core/GizmoControl";

interface MouseEventsProps {
  gizmoRenderer: THREE.WebGLRenderer | null;
  gizmoScene: THREE.Scene;
  gizmoCamera: THREE.Camera;
  alignCameraWithVector: (vector: THREE.Vector3) => void;
  gizmoControlRef: React.MutableRefObject<GizmoControl | null>;
}

const MOUSE_MOVE_THROTTLE_FPS = 25;
const CLICK_DURATION_THRESHOLD = 200;
const ROTATION_STEPS = 15;

let isRotating = false;

export function useGizmoMouseEvents({
  gizmoRenderer,
  gizmoScene,
  gizmoCamera,
  alignCameraWithVector,
  gizmoControlRef,
}: MouseEventsProps) {
  const clickStartTime = useRef<number | null>(null);
  const clickStartPosition = useRef<{ x: number; y: number } | null>(null);
  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!gizmoControlRef.current || !gizmoRenderer) return;

      updateMousePosition(event, gizmoRenderer, mouse);
      const intersectedObject = checkIntersection(
        mouse,
        gizmoCamera,
        gizmoScene,
        raycaster,
      );

      if (intersectedObject?.userData.gizmoCube) {
        intersectedObject.userData.gizmoCube.highlightObject(intersectedObject);
      } else {
        gizmoScene.traverse((child) => {
          if (child.userData.gizmoCube) {
            child.userData.gizmoCube.highlightObject(null);
          }
        });
      }
    }, 1000 / MOUSE_MOVE_THROTTLE_FPS),
    [gizmoControlRef, gizmoRenderer, gizmoCamera, gizmoScene, raycaster, mouse],
  );

  const handleMouseDown = useCallback((event: MouseEvent) => {
    clickStartTime.current = Date.now();
    clickStartPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleCubeClick = useCallback(
    (event: MouseEvent) => {
      const clickDuration = clickStartTime.current
        ? Date.now() - clickStartTime.current
        : 0;

      if (clickDuration < CLICK_DURATION_THRESHOLD) {
        updateMousePosition(event, gizmoRenderer!, mouse);
        const intersectedObject = checkIntersection(
          mouse,
          gizmoCamera,
          gizmoScene,
          raycaster,
        );
        handleClick(intersectedObject, alignCameraWithVector);
      }
      clickStartTime.current = null;
      clickStartPosition.current = null;
    },
    [alignCameraWithVector],
  );

  const handleRotationArrowClick = useCallback(() => {
    const currentPos = gizmoCamera.position.clone();
    const centerPoint = new THREE.Vector3(0, 0, 0); // Or your target point

    // Calculate radius (distance from center)
    const radius = currentPos.distanceTo(centerPoint);

    // Calculate current angle in XZ plane
    const currentAngle = Math.atan2(currentPos.x, currentPos.z);

    // Calculate new position (90 degrees rotation)
    const newAngle = currentAngle + Math.PI / 2;
    const newX = Math.sin(newAngle) * radius;
    const newZ = Math.cos(newAngle) * radius;

    // Update camera position, maintaining Y position
    gizmoCamera.position.set(newX, currentPos.y, newZ);

    // Keep camera looking at center
    gizmoCamera.lookAt(centerPoint);

    // Update controls
    gizmoControlRef.current?.gizmoControls.update();
  }, [gizmoCamera, gizmoControlRef]);

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      // handleCubeClick(event);
      handleRotationArrowClick();
    },
    [handleRotationArrowClick, handleCubeClick],
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
}
