import React, { HTMLAttributes, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { syncGizmoCameraWithMain, syncMainCameraWithGizmo } from './CameraController';
import getWebGLRenderer from './getWebGLRenderer';
import GizmoControl from './GizmoControl';
import './Gizmo.css';

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

  const raycaster = useRef(new THREE.Raycaster()).current;
  const mouse = useRef(new THREE.Vector2()).current;

  const checkIntersection = useCallback(() => {
    if (!gizmoCamera || !gizmoScene) return null;

    raycaster.setFromCamera(mouse, gizmoCamera);
    const intersects = raycaster.intersectObjects(gizmoScene.children, true);
    const exceptions = ['Wireframe', ''];
    const filtered = intersects.filter(intersect => !exceptions.includes(intersect.object.name));

    return filtered.length > 0 ? filtered[0].object : null;
  }, [gizmoCamera, gizmoScene, raycaster, mouse]);

  const onClick = useCallback((event: MouseEvent) => {
    const intersectedObject = checkIntersection();

    if (intersectedObject) {
      const gizmoCube = intersectedObject?.userData.gizmoCube;
      gizmoCube.handleClick();
    }
  }, [checkIntersection, gizmoScene]);

  // Обработчик изменения материала при наведении
  const onMouseMove = useCallback((event: MouseEvent) => {
    if (!gizmoRenderer || !gizmoCamera || !gizmoScene) return;

    const rect = gizmoRenderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, gizmoCamera);

    const intersects = raycaster.intersectObjects(gizmoScene.children, true);
    const exceptions = ['Wireframe', ''];
    const filtered = intersects.filter(intersect => !exceptions.includes(intersect.object.name));

    if (filtered.length > 0) {
      const firstIntersected = filtered[0].object;
      if (firstIntersected.userData.gizmoCube) {
        firstIntersected.userData.gizmoCube.highlightObject(firstIntersected);
      }
    } else {
      // Если нет пересечений, сбрасываем выделение
      const anyObject = gizmoScene.children[0];
      if (anyObject && anyObject.userData.gizmoCube) {
        anyObject.userData.gizmoCube.highlightObject(null);
      }
    }

    renderGizmo();
  }, [gizmoRenderer, gizmoCamera, gizmoScene]);

  // Принудительный рендеринг Gizmo
  const renderGizmo = useCallback(() => {
    if (!gizmoRenderer) return;
    render();
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  }, [render, gizmoRenderer, gizmoScene, gizmoCamera]);

  useEffect(() => {
    const gizmoDiv = gizmoRef.current;
    if (!gizmoDiv || !camera || !controls || !gizmoRenderer) return;

    // Если уже есть инстанс GizmoControl, очищаем его
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

    // Создаем инстанс GizmoControl
    gizmoControlRef.current = new GizmoControl({
      gizmoParams,
      mainParams,
      syncFunctions,
    });

    // Добавляем обработчики событий для мыши
    gizmoDiv.addEventListener('mousemove', onMouseMove);
    gizmoDiv.addEventListener('click', onClick);

    return () => {
      if (gizmoControlRef.current) {
        gizmoControlRef.current.dispose();
        gizmoControlRef.current = null;
      }

      // Убираем обработчики событий
      gizmoDiv.removeEventListener('mousemove', onMouseMove);
      gizmoDiv.removeEventListener('click', onClick);
    };
  }, [camera, controls, renderGizmo, onMouseMove, onClick]);

  // Синхронизация камеры Gizmo с основной камерой
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
