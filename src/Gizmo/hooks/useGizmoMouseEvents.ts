import React, { useCallback, useRef } from "react";
import * as THREE from "three";
import { throttle } from "../utils/throttle";
import {
  updateMousePosition,
  checkIntersection,
  handleClick,
  getAllIntersects,
  getIntersectedObjects,
} from "../utils/mouseUtils";
import GizmoControl from "../core/GizmoControl";
import RotationArrows from "../core/GizmoRotationArrows";
import { ROTATION_ARROWS_NAME } from "../constants";
import { isCubeRotated } from "../utils/objectUtils";

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

  const addRotationArrows = useCallback(() => {
    const existingArrows = gizmoScene.getObjectByName(ROTATION_ARROWS_NAME);
    const isRotated = isCubeRotated(gizmoCamera);

    if (existingArrows && isRotated) {
      gizmoScene.remove(existingArrows);
      return;
    }

    if (existingArrows || isRotated) return;

    const rotationArrows = new RotationArrows().create();
    rotationArrows.rotation.copy(gizmoCamera.rotation);
    gizmoScene.add(rotationArrows);
  }, [gizmoScene, gizmoCamera]);

  const removeRotationArrows = useCallback(() => {
    const object = gizmoScene.getObjectByName(ROTATION_ARROWS_NAME);
    if (object) {
      gizmoScene.remove(object);
    }
  }, [gizmoScene]);

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!gizmoControlRef.current || !gizmoRenderer) return;

      updateMousePosition(event, gizmoRenderer, mouse);
      const intersects = getAllIntersects(
        mouse,
        gizmoCamera,
        gizmoScene,
        raycaster,
      );
      const intersectedObject = getIntersectedObjects(intersects);

      if (intersectedObject?.userData.gizmoCube) {
        intersectedObject.userData.gizmoCube.highlightObject(intersectedObject);
      } else {
        gizmoScene.traverse((child) => {
          if (child.userData.gizmoCube) {
            child.userData.gizmoCube.highlightObject(null);
          }
        });
      }

      if (intersects.length > 0) {
        addRotationArrows();
      } else {
        removeRotationArrows();
      }
    }, 1000 / MOUSE_MOVE_THROTTLE_FPS),
    [
      gizmoControlRef,
      gizmoRenderer,
      gizmoCamera,
      gizmoScene,
      raycaster,
      mouse,
      addRotationArrows,
      removeRotationArrows,
    ],
  );

  const handleMouseDown = useCallback((event: MouseEvent) => {
    clickStartTime.current = Date.now();
    clickStartPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseUp = useCallback(
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

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: removeRotationArrows,
  };
}
