import * as THREE from 'three';

export const addLighting = (scene: THREE.Scene) => {
  // Добавляем окружающий свет (AmbientLight) для общего освещения
  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // интенсивность установлена на Math.PI
  scene.add(ambientLight);

  // Добавляем направленные источники света с разных углов для создания неравномерного освещения
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(5, 10, 5); // свет сверху
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(-5, -10, 5); // свет снизу и сбоку
  scene.add(directionalLight2);

  // Добавляем точечный источник света, который освещает куб как лампочка
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 0, 5); // свет перед кубом
  scene.add(pointLight);

  // Тени отключены
  directionalLight1.castShadow = false;
  directionalLight2.castShadow = false;
  pointLight.castShadow = false;
};
