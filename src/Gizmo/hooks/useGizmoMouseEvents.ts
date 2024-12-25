import React, { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { throttle } from "../utils/throttle";
import {
  updateMousePosition,
  checkIntersection,
  handleClick,
} from "../utils/mouseUtils";
import GizmoControl from "../core/GizmoControl";
import { ROTATION_ARROWS_NAMES } from "../constants";

interface MouseEventsProps {
  gizmoRenderer: THREE.WebGLRenderer | null;
  gizmoScene: THREE.Scene;
  gizmoCamera: THREE.Camera;
  alignCameraWithVector: (vector: THREE.Vector3) => void;
  gizmoControlRef: React.MutableRefObject<GizmoControl | null>;
}

const MOUSE_MOVE_THROTTLE_FPS = 25;
const CLICK_DURATION_THRESHOLD = 200;

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
    [
      alignCameraWithVector,
      gizmoRenderer,
      gizmoCamera,
      gizmoScene,
      raycaster,
      mouse,
    ],
  );
 
//   const handleRotationArrowClick = useCallback(() => {
//     const centerPoint = new THREE.Vector3(0, 0, 0);
//     const currentPos = gizmoCamera.position.clone();

//     const directionVector = currentPos.sub(centerPoint);

//     // Keep Z the same, rotate X and Y
//     const newX = -directionVector.y;
//     const newY = directionVector.x;

//     gizmoCamera.position.set(newX, newY, directionVector.z);
//     gizmoCamera.lookAt(centerPoint);

//     gizmoControlRef.current?.gizmoControls.update();
// }, [gizmoCamera, gizmoControlRef]);

const handleRotationArrowClick = useCallback(() => {
  const centerPoint = new THREE.Vector3(0, 0, 0);
  const currentPos = gizmoCamera.position.clone();
  const directionVector = currentPos.sub(centerPoint);
  
  // Get current angle in radians and convert to degrees
  const currentAngle = Math.atan2(directionVector.x, directionVector.z) * (180 / Math.PI);
  
  // Round to nearest 90° increment and convert back to radians
  const snappedAngle = (Math.round((currentAngle + 90) / 90) * 90) * (Math.PI / 180);
  
  // Calculate new position using snapped angle
  const radius = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
  const newX = Math.sin(snappedAngle) * radius;
  const newY = Math.cos(snappedAngle) * radius;
  
  gizmoCamera.position.set(newX, newY, directionVector.z);
  gizmoCamera.lookAt(centerPoint);
  
  gizmoControlRef.current?.gizmoControls.update();
}, [gizmoCamera, gizmoControlRef]);

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const intersectedObject = checkIntersection(
        mouse,
        gizmoCamera,
        gizmoScene,
        raycaster,
      );

      if (intersectedObject?.name && ROTATION_ARROWS_NAMES.includes(intersectedObject.name)) {
        handleRotationArrowClick();
      } else {
        handleCubeClick(event);
      }
    },
    [handleRotationArrowClick, handleCubeClick],
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
}
