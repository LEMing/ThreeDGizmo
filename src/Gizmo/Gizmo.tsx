import React, {HTMLAttributes, useCallback, useEffect, useRef} from 'react';
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
  const hoveredObject = useRef<THREE.Object3D | null>(null);
  const originalColor = useRef<THREE.Color | null>(null);

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
      const firstIntersected = filtered[0].object as THREE.Mesh;
      const material = firstIntersected.material as THREE.MeshStandardMaterial;

      // Проверяем, не меняем ли мы материал того же объекта
      if (hoveredObject.current !== firstIntersected) {
        // Возвращаем цвет предыдущему объекту
        if (hoveredObject.current && originalColor.current) {
          (hoveredObject.current.material as THREE.MeshStandardMaterial).color.set(originalColor.current);
        }

        // Сохраняем текущий объект и его цвет
        hoveredObject.current = firstIntersected;
        originalColor.current = material.color.clone();

        // Изменяем цвет при наведении
        material.color.set(0xAFC7E5);
      }
    } else if (hoveredObject.current && originalColor.current) {
      // Возвращаем исходный цвет, если курсор ушел с объекта
      (hoveredObject.current.material as THREE.MeshStandardMaterial).color.set(originalColor.current);
      hoveredObject.current = null;
    }
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

    return () => {
      if (gizmoControlRef.current) {
        gizmoControlRef.current.dispose();
        gizmoControlRef.current = null;
      }

      // Убираем обработчики событий
      gizmoDiv.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, controls, renderGizmo, onMouseMove]);

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
