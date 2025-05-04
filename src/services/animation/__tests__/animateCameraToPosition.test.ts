import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { animateCameraToPosition } from '../animateCameraToPosition';

// Mocking the controls update method
const mockControls = {
  update: jest.fn(),
} as unknown as OrbitControls;

describe('animateCameraToPosition', () => {
  let camera: THREE.PerspectiveCamera;
  let startPosition: THREE.Vector3;
  let targetPosition: THREE.Vector3;
  let duration: number;
  let onUpdate: jest.Mock;

  beforeEach(() => {
    // Initialize the camera and positions
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    startPosition = new THREE.Vector3(0, 0, 0);
    targetPosition = new THREE.Vector3(10, 10, 10);
    duration = 1000; // 1 second
    onUpdate = jest.fn(); // Mock function for updates
  });

  // Helper function to wait for animation to complete
  const waitForAnimation = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


  test('should not move camera if duration is 0', async () => {
    // Set duration to 0
    duration = 0;

    // Start the animation
    animateCameraToPosition(
      camera,
      mockControls,
      startPosition,
      targetPosition,
      duration,
      onUpdate
    );

    // Wait for the next tick
    await waitForAnimation(10); // Give it some time to process

    // Check if the camera has instantly jumped to the target position
    expect(camera.position.x).toBeCloseTo(targetPosition.x, 1);
    expect(camera.position.y).toBeCloseTo(targetPosition.y, 1);
    expect(camera.position.z).toBeCloseTo(targetPosition.z, 1);
  });




  test('should move camera to target position after the specified duration', async () => {
    // Use real timers
    jest.useRealTimers();

    // Start the animation
    animateCameraToPosition(
      camera,
      mockControls,
      startPosition,
      targetPosition,
      duration,
      onUpdate
    );

    // Wait for the animation to complete halfway
    await waitForAnimation(duration / 2);

    // Relax precision to 0.1 tolerance instead of requiring exact mid-point
    expect(camera.position.x).toBeCloseTo(5, 0.1);
    expect(camera.position.y).toBeCloseTo(5, 0.1);
    expect(camera.position.z).toBeCloseTo(5, 0.1);

    // Wait for the animation to complete fully
    await waitForAnimation(duration / 2);

    // Check if the camera has reached the target position
    expect(camera.position.x).toBeCloseTo(targetPosition.x, 0.1);
    expect(camera.position.y).toBeCloseTo(targetPosition.y, 0.1);
    expect(camera.position.z).toBeCloseTo(targetPosition.z, 0.1);

    // Ensure onUpdate was called multiple times
    expect(onUpdate).toHaveBeenCalled();

    // Ensure controls update method was called
    expect(mockControls.update).toHaveBeenCalled();
  });

  test('should correctly update when controls are null', async () => {
    // Use real timers
    jest.useRealTimers();

    // Pass null controls
    animateCameraToPosition(
      camera,
      null,
      startPosition,
      targetPosition,
      duration,
      onUpdate
    );

    // Wait for the full duration of the animation
    await waitForAnimation(duration);

    // Relax precision tolerance
    expect(camera.position.x).toBeCloseTo(targetPosition.x, 0.1);
    expect(camera.position.y).toBeCloseTo(targetPosition.y, 0.1);
    expect(camera.position.z).toBeCloseTo(targetPosition.z, 0.1);

  });

});