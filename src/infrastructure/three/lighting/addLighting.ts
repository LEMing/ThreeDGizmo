import * as THREE from 'three';

export const addLighting = (scene: THREE.Scene) => {
  // Add ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // intensity set to 1
  scene.add(ambientLight);

  // Add directional lights from different angles to create uneven lighting
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(5, 10, 5); // light from above
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight2.position.set(-5, -10, 5); // light from below and side
  scene.add(directionalLight2);

  // Add a point light to illuminate the cube like a bulb
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 0, 5); // light in front of the cube
  scene.add(pointLight);

  // Shadows are disabled
  directionalLight1.castShadow = false;
  directionalLight2.castShadow = false;
  pointLight.castShadow = false;
};
