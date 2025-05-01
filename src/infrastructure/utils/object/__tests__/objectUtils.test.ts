import * as THREE from 'three';
import { isCubeRotated } from '../objectUtils';

describe('isCubeRotated', () => {
  it('should return false for vertical rotation', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.y = Math.PI / 2;
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for horizontal rotation', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.x = Math.PI;
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return true for neither vertical nor horizontal rotation', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.x = Math.PI / 4;
    camera.rotation.y = Math.PI / 4;
    expect(isCubeRotated(camera)).toBe(true);
  });

  it('should return false for vertical rotation with epsilon tolerance', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.y = Math.PI / 2 + 0.01;
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for vertical rotation with negative angle', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.y = -Math.PI / 2;
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for horizontal rotation with epsilon tolerance', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.x = Math.PI + 0.01;
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for rotation with both x and y near 0', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.rotation.set(0.005, 0.005, 0);
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for rotation with both x and y near π', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.rotation.set(Math.PI - 0.01, Math.PI + 0.01, 0);
    expect(isCubeRotated(camera)).toBe(false);
  });

  it('should return false for rotation with x near π/2 and y near 0', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.rotation.x = Math.PI / 2 - 0.01;
    camera.rotation.y = 0;
    expect(isCubeRotated(camera)).toBe(false);
  });
});
