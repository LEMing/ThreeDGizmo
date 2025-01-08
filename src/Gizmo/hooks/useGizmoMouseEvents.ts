import React, { useCallback, useRef } from "react";
import * as THREE from "three";
import { throttle } from "../utils/throttle";
import {
  updateMousePosition,
  checkIntersection,
  handleClick,
} from "../utils/mouseUtils";
import GizmoControl from "../core/GizmoControl";
import RotationArrows from "../core/GizmoRotationArrows";
import { ROTATION_ARROWS_NAME } from "../constants";

interface MouseEventsProps {
  gizmoRenderer: THREE.WebGLRenderer | null;
  gizmoScene: THREE.Scene;
  gizmoCamera: THREE.Camera;
  alignCameraWithVector: (vector: THREE.Vector3) => void;
  gizmoControlRef: React.MutableRefObject<GizmoControl | null>;
}

const MOUSE_MOVE_THROTTLE_FPS = 25;
const CLICK_DURATION_THRESHOLD = 200; // milliseconds

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

  const isCubeRotated = () => {
    const rotation = gizmoCamera.rotation;
    const EPSILON = 0.1;
    const PI = Math.PI;
    const x = ((Math.abs(rotation.x) % (2 * PI)) + 2 * PI) % (2 * PI);

    const isVertical =
      Math.abs(x - PI / 2) < EPSILON || Math.abs(x - (3 * PI) / 2) < EPSILON;

    const isHorizontal = Math.abs(x) < EPSILON || Math.abs(x - PI) < EPSILON;
    return !(isVertical || isHorizontal);
  };

  const addRotationArrows = useCallback(() => {
    const existingArrows = gizmoScene.getObjectByName(ROTATION_ARROWS_NAME);
    const isRotated = isCubeRotated();

    if (existingArrows && isRotated) {
      gizmoScene.remove(existingArrows);
      return;
    }

    if (existingArrows || isRotated) {
      return;
    }

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

  // Core logic for mouse move event
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
        addRotationArrows();
      } else {
        removeRotationArrows();
        gizmoScene.traverse((child) => {
          if (child.userData.gizmoCube) {
            child.userData.gizmoCube.highlightObject(null);
          }
        });
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

  // Mouse down event
  const handleMouseDown = useCallback((event: MouseEvent) => {
    clickStartTime.current = Date.now();
    clickStartPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  // Mouse up event
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
  };
}
