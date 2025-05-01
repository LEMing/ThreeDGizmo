import * as THREE from 'three';
import { addLighting } from '../../lighting/addLighting';

// Instead of mocking Three.js, we'll use real Three.js objects and verify behavior
describe('addLighting', () => {
  let scene: THREE.Scene;
  
  beforeEach(() => {
    // Create a fresh scene for each test
    scene = new THREE.Scene();
  });
  
  test('adds correct number of lights to scene', () => {
    // The scene should initially be empty
    expect(scene.children.length).toBe(0);
    
    // Add lighting to the scene
    addLighting(scene);
    
    // Should add 4 lights (1 ambient, 2 directional, 1 point)
    expect(scene.children.length).toBe(4);
    
    // Check types of lights added
    const ambientLights = scene.children.filter(child => child instanceof THREE.AmbientLight);
    const directionalLights = scene.children.filter(child => child instanceof THREE.DirectionalLight);
    const pointLights = scene.children.filter(child => child instanceof THREE.PointLight);
    
    expect(ambientLights.length).toBe(1);
    expect(directionalLights.length).toBe(2);
    expect(pointLights.length).toBe(1);
  });
  
  test('configures ambient light correctly', () => {
    addLighting(scene);
    
    // Find the ambient light
    const ambientLight = scene.children.find(
      child => child instanceof THREE.AmbientLight
    ) as THREE.AmbientLight;
    
    // Check properties
    expect(ambientLight).toBeInstanceOf(THREE.AmbientLight);
    expect(ambientLight.color.getHex()).toBe(0xffffff);
    expect(ambientLight.intensity).toBe(1);
  });
  
  test('configures directional lights correctly', () => {
    addLighting(scene);
    
    // Find the directional lights
    const directionalLights = scene.children.filter(
      child => child instanceof THREE.DirectionalLight
    ) as THREE.DirectionalLight[];
    
    // Check that we have two directional lights
    expect(directionalLights.length).toBe(2);
    
    // Check first directional light (from above)
    const directionalLight1 = directionalLights[0];
    expect(directionalLight1.color.getHex()).toBe(0xffffff);
    expect(directionalLight1.intensity).toBe(1);
    expect(directionalLight1.position.x).toBe(5);
    expect(directionalLight1.position.y).toBe(10);
    expect(directionalLight1.position.z).toBe(5);
    expect(directionalLight1.castShadow).toBe(false);
    
    // Check second directional light (from below and side)
    const directionalLight2 = directionalLights[1];
    expect(directionalLight2.color.getHex()).toBe(0xffffff);
    expect(directionalLight2.intensity).toBe(1);
    expect(directionalLight2.position.x).toBe(-5);
    expect(directionalLight2.position.y).toBe(-10);
    expect(directionalLight2.position.z).toBe(5);
    expect(directionalLight2.castShadow).toBe(false);
  });
  
  test('configures point light correctly', () => {
    addLighting(scene);
    
    // Find the point light
    const pointLight = scene.children.find(
      child => child instanceof THREE.PointLight
    ) as THREE.PointLight;
    
    // Check properties
    expect(pointLight).toBeInstanceOf(THREE.PointLight);
    expect(pointLight.color.getHex()).toBe(0xffffff);
    expect(pointLight.intensity).toBe(1);
    expect(pointLight.distance).toBe(100);
    expect(pointLight.position.x).toBe(0);
    expect(pointLight.position.y).toBe(0);
    expect(pointLight.position.z).toBe(5);
    expect(pointLight.castShadow).toBe(false);
  });
  
  test('disables shadows for all lights', () => {
    addLighting(scene);
    
    // Check if all lights have castShadow set to false
    scene.children.forEach(child => {
      if (child instanceof THREE.Light && 'castShadow' in child) {
        expect(child.castShadow).toBe(false);
      }
    });
  });
});