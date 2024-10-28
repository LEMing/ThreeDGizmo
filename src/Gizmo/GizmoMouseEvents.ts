import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { throttle } from './throttle';
import { updateMousePosition, checkIntersection, handleClick } from './GizmoMouseUtils';
import GizmoControl from './GizmoControl';

interface MouseEventsProps {
  gizmoRenderer: THREE.WebGLRenderer | null;
  gizmoScene: THREE.Scene;
  gizmoCamera: THREE.Camera;
  alignCameraWithVector: (vector: THREE.Vector3) => void;
  gizmoControlRef: React.MutableRefObject<GizmoControl | null>;
}

export function useGizmoMouseEvents({
    gizmoRenderer,
    gizmoScene,
    gizmoCamera,
    alignCameraWithVector,
    gizmoControlRef,
  }: MouseEventsProps) {
  const [isRotating, setIsRotating] = useState(false);
  const clickStartTime = useRef<number | null>(null);
  const clickStartPosition = useRef<{ x: number; y: number } | null>(null);
  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;

  // Mouse move event with throttling
  const onMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!gizmoControlRef.current || !gizmoRenderer) return;
      updateMousePosition(event, gizmoRenderer, mouse);
      const intersectedObject = checkIntersection(mouse, gizmoCamera, gizmoScene, raycaster);

      if (intersectedObject && intersectedObject.userData.gizmoCube) {
        intersectedObject.userData.gizmoCube.highlightObject(intersectedObject);
      } else {
        const anyObject = gizmoScene.children[0];
        if (anyObject && anyObject.userData.gizmoCube) {
          anyObject.userData.gizmoCube.highlightObject(null);
        }
      }
    }, 1000 / 25), // MOUSE_MOVE_THROTTLE_FPS is 25
    [gizmoRenderer, gizmoCamera, gizmoScene, raycaster, mouse, gizmoControlRef]
  );

  // Mouse down event
  const onMouseDown = useCallback((event: MouseEvent) => {
    clickStartTime.current = Date.now();
    clickStartPosition.current = { x: event.clientX, y: event.clientY };
    setIsRotating(false);
  }, []);

  // Mouse up event
  const onMouseUp = useCallback(
    (event: MouseEvent) => {
      const clickDuration = clickStartTime.current ? Date.now() - clickStartTime.current : 0;
      if (!isRotating && clickDuration < 200) {
        updateMousePosition(event, gizmoRenderer!, mouse); // gizmoRenderer is guaranteed to exist here
        const intersectedObject = checkIntersection(mouse, gizmoCamera, gizmoScene, raycaster);
        handleClick(intersectedObject, alignCameraWithVector);
      }
      clickStartTime.current = null;
      clickStartPosition.current = null;
      setIsRotating(false);
    },
    [isRotating, alignCameraWithVector, gizmoRenderer, gizmoCamera, gizmoScene, raycaster, mouse]
  );

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
