import * as THREE from 'three';
import { addLighting } from '../addLighting';

describe('addLighting function', () => {
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  test('adds ambient light to the scene', () => {
    addLighting(scene);
    const ambientLight = scene.children.find(child => child instanceof THREE.AmbientLight);
    expect(ambientLight).toBeDefined();
    expect((ambientLight as THREE.AmbientLight).intensity).toBe(1);
  });

  test('adds two directional lights to the scene', () => {
    addLighting(scene);
    const directionalLights = scene.children.filter(child => child instanceof THREE.DirectionalLight);
    expect(directionalLights.length).toBe(2);

    expect((directionalLights[0] as THREE.DirectionalLight).position.equals(new THREE.Vector3(5, 10, 5))).toBeTruthy();
    expect((directionalLights[1] as THREE.DirectionalLight).position.equals(new THREE.Vector3(-5, -10, 5))).toBeTruthy();
  });

  test('adds a point light to the scene', () => {
    addLighting(scene);
    const pointLight = scene.children.find(child => child instanceof THREE.PointLight);
    expect(pointLight).toBeDefined();
    expect((pointLight as THREE.PointLight).position.equals(new THREE.Vector3(0, 0, 5))).toBeTruthy();
  });

  test('disables shadows for all lights', () => {
    addLighting(scene);
    const lights = scene.children.filter(child =>
      child instanceof THREE.DirectionalLight || child instanceof THREE.PointLight
    );
    lights.forEach(light => {
      expect((light as THREE.Light).castShadow).toBe(false);
    });
  });
});
