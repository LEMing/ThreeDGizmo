import React, { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo } from './CameraController';
import getWebGLRenderer from './getWebGLRenderer';
import GizmoControl from './GizmoControl';
import './Gizmo.css';
import {GizmoCube} from './GizmoCube';

interface GizmoProps extends HTMLAttributes<HTMLDivElement> {
  camera: THREE.Camera | null;
  controls: OrbitControls | MapControls | null;
  render: () => void;
}

const Gizmo: React.FC<GizmoProps> = ({ camera, controls, className, render }) => {
  const gizmoRef = useRef<HTMLDivElement | null>(null);
  const gizmoScene = useRef(new THREE.Scene()).current;
  const gizmoRenderer = useRef(getWebGLRenderer()).current;
  const gizmoCamera = useRef(new THREE.PerspectiveCamera(50, 1, 0.1, 100)).current;
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
      const t = Math.min(elapsedTime / duration, 1); // Нормализуем t в пределах от 0 до 1

      // Линейная интерполяция между начальной и целевой позицией
      camera!.position.lerpVectors(startPosition, targetPosition, t);

      // Обновляем контролы и рендерим сцену
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

    const distance = camera.position.length(); // Сохраняем текущее расстояние от центра
    const newPosition = vector.clone().multiplyScalar(distance);

    // Запускаем анимацию перехода
    animateCameraToPosition(camera.position.clone(), newPosition, 400, renderGizmo);

    // Направляем камеру на центр сцены
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Обновляем up-вектор камеры
    camera.up.set(0, 1, 0);

    // Обновляем контролы
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

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (!gizmoControlRef.current) return; // Проверяем, инициализирован ли gizmoControlRef
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

    renderGizmo();
  }, [updateMousePosition, checkIntersection, gizmoScene, renderGizmo]);


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

    // Инициализация GizmoControl
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

    // Добавляем обработчики событий на DOM элемент
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
