import { render } from '@testing-library/react';
import Gizmo from '../Gizmo';
import * as THREE from 'three';
import { jest } from '@jest/globals'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


describe('Gizmo component', () => {
  it('sets the up vector on the gizmoCamera when options.up is provided', () => {
    // Create a real camera and controls
    const camera = new THREE.PerspectiveCamera();
    const controls = new OrbitControls(camera, document.createElement('div'));

    // Define the options with a specific up vector
    const options = {
      up: new THREE.Vector3(0, 1, 0),
    };

    // Render the Gizmo component with the provided options
    render(
      <Gizmo
        camera={camera}
        controls={controls}
        render={jest.fn()}
        options={options}
      />
    );

    // Ensure that the camera's up vector has been set to the expected value
    expect(camera.up.equals(options.up)).toBe(true);
  });
});
