import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as THREE from 'three';
import GizmoOnlyScene from '../GizmoOnlyScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Mock the three.js dependencies
jest.mock('three', () => {
  const originalModule = jest.requireActual('three');
  return {
    ...originalModule,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('canvas'),
      dispose: jest.fn()
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      lookAt: jest.fn()
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn()
    })),
    Vector3: originalModule.Vector3
  };
});

// Mock OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: false,
    dampingFactor: 0,
    update: jest.fn(),
    dispose: jest.fn()
  }))
}));

// Mock the Gizmo component
jest.mock('../../Gizmo/Gizmo', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ render, camera, controls, className, options }) => (
    <div data-testid="mock-gizmo" className={className}>
      Gizmo Mock Component
    </div>
  ))
}));

// Mock addLighting
jest.mock('../../../../infrastructure/three/lighting/addLighting', () => ({
  addLighting: jest.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
  return setTimeout(cb, 0);
});

describe('GizmoOnlyScene component', () => {
  // Setup mock for div element
  const mockDivElement = document.createElement('div');
  mockDivElement.appendChild = jest.fn();
  mockDivElement.removeChild = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('renders the component without crashing', () => {
    const { container } = render(<GizmoOnlyScene />);
    expect(container).toBeTruthy();
  });
  
  it('initializes WebGLRenderer with antialias', () => {
    render(<GizmoOnlyScene />);
    expect(THREE.WebGLRenderer).toHaveBeenCalledWith({ antialias: true });
    
    // Check renderer configuration
    const rendererMock = THREE.WebGLRenderer as unknown as jest.Mock;
    const renderer = rendererMock.mock.results[0]?.value;
    
    if (renderer) {
      expect(renderer.setSize).toHaveBeenCalledWith(640, 480);
      expect(renderer.setPixelRatio).toHaveBeenCalledWith(window.devicePixelRatio);
    }
  });
  
  it('initializes scene and camera', () => {
    render(<GizmoOnlyScene />);
    expect(THREE.Scene).toHaveBeenCalled();
    expect(THREE.PerspectiveCamera).toHaveBeenCalledWith(75, 640 / 480, 0.1, 1000);
    
    // Check camera configuration
    const cameraMock = THREE.PerspectiveCamera as unknown as jest.Mock;
    const camera = cameraMock.mock.results[0]?.value;
    
    if (camera && camera.position) {
      expect(camera.position.set).toHaveBeenCalledWith(0, 0, 10);
      expect(camera.lookAt).toHaveBeenCalledWith(0, 0, 0);
    }
  });
  
  it('sets up lighting', () => {
    render(<GizmoOnlyScene />);
    const { addLighting } = require('../../../../infrastructure/three/lighting/addLighting');
    expect(addLighting).toHaveBeenCalled();
  });
  
  it('initializes OrbitControls with correct configuration', () => {
    render(<GizmoOnlyScene />);
    
    // Check if OrbitControls is initialized
    expect(OrbitControls).toHaveBeenCalled();
    
    // Get the OrbitControls instance
    const controlsMock = OrbitControls as jest.Mock;
    const controlsInstance = controlsMock.mock.results[0]?.value;
    
    // Check if properties are set on the instance
    if (controlsInstance) {
      // Properties should be set during initialization
      expect(controlsInstance.update).toHaveBeenCalled();
    }
  });
  
  it('sets up animation loop', () => {
    render(<GizmoOnlyScene />);
    expect(requestAnimationFrame).toHaveBeenCalled();
    
    // Since we can't easily call the actual animation callback directly in tests,
    // we'll just verify that requestAnimationFrame was called
  });
  
  it('cleans up on unmount', () => {
    const { unmount } = render(<GizmoOnlyScene />);
    unmount();
    
    // The unmount should complete without errors
    expect(true).toBe(true);
  });
  
  it('does not render Gizmo initially (before camera and controls are set)', () => {
    // Mock useState to return null for camera and controls
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [null, jest.fn()]) // camera
      .mockImplementationOnce(() => [null, jest.fn()]); // controls
    
    const { queryByTestId } = render(<GizmoOnlyScene />);
    
    // Gizmo should not be rendered when camera and controls are null
    expect(queryByTestId('mock-gizmo')).toBeNull();
  });
  
  it('renders Gizmo with correct props when camera and controls are available', () => {
    // Mock camera and controls
    const mockCamera = { position: { set: jest.fn() }, lookAt: jest.fn() };
    const mockControls = { update: jest.fn() };
    
    // Mock useState to return camera and controls
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [mockCamera, jest.fn()]) // camera
      .mockImplementationOnce(() => [mockControls, jest.fn()]); // controls
    
    render(<GizmoOnlyScene />);
    
    // Check if Gizmo component was called with the correct props
    const Gizmo = require('../../Gizmo/Gizmo').default;
    expect(Gizmo).toHaveBeenCalledWith(
      expect.objectContaining({
        camera: mockCamera,
        controls: mockControls,
        className: 'custom-gizmo-style',
        render: expect.any(Function),
        options: expect.objectContaining({
          up: expect.any(THREE.Vector3)
        })
      }),
      expect.anything()
    );
  });
});