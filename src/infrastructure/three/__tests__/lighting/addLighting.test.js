import * as THREE from 'three';
import { addLighting } from '../../lighting/addLighting';

// Mock THREE.js objects
jest.mock('three', () => {
  // Mock the add method
  const mockAdd = jest.fn();
  
  // Mock for scene
  const Scene = jest.fn().mockImplementation(() => ({
    add: mockAdd,
    children: []
  }));
  
  // Mock for lights
  const AmbientLight = jest.fn();
  const DirectionalLight = jest.fn();
  const PointLight = jest.fn();
  
  return { 
    Scene,
    AmbientLight, 
    DirectionalLight, 
    PointLight,
    // Spy helpers exposed for tests
    __mocks: {
      add: mockAdd
    }
  };
});

describe('addLighting', () => {
  // Spy on directional light position.set and pointLight position.set methods
  const mockPositionSet1 = jest.fn();
  const mockPositionSet2 = jest.fn();
  const mockPositionSet3 = jest.fn();
  
  // Mock lights for test
  let mockAmbientLight;
  let mockDirectionalLight1;
  let mockDirectionalLight2;
  let mockPointLight;
  
  // Get THREE mocks
  const THREE_MOCKS = THREE.__mocks;
  
  beforeEach(() => {
    // Reset mocks
    THREE_MOCKS.add.mockReset();
    mockPositionSet1.mockReset();
    mockPositionSet2.mockReset();
    mockPositionSet3.mockReset();
    
    // Create mocks with initial shadowing enabled
    mockAmbientLight = { type: 'AmbientLight' };
    mockDirectionalLight1 = { 
      type: 'DirectionalLight', 
      position: { set: mockPositionSet1 },
      castShadow: true
    };
    mockDirectionalLight2 = { 
      type: 'DirectionalLight', 
      position: { set: mockPositionSet2 },
      castShadow: true
    };
    mockPointLight = { 
      type: 'PointLight', 
      position: { set: mockPositionSet3 },
      castShadow: true
    };
    
    // Mock light constructors
    THREE.AmbientLight.mockReturnValue(mockAmbientLight);
    THREE.DirectionalLight
      .mockReturnValueOnce(mockDirectionalLight1)
      .mockReturnValueOnce(mockDirectionalLight2);
    THREE.PointLight.mockReturnValue(mockPointLight);
    
    // Set up scene.add to track added objects
    THREE_MOCKS.add.mockImplementation(function(obj) {
      this.children.push(obj);
      return this;
    });
  });
  
  test('adds ambient light with correct parameters', () => {
    const scene = new THREE.Scene();
    addLighting(scene);
    
    // Check AmbientLight constructor called with correct parameters
    expect(THREE.AmbientLight).toHaveBeenCalledWith(0xffffff, 1);
    
    // Check that ambient light was added to scene
    expect(THREE_MOCKS.add).toHaveBeenCalledWith(mockAmbientLight);
  });
  
  test('adds two directional lights with correct parameters', () => {
    const scene = new THREE.Scene();
    addLighting(scene);
    
    // Check DirectionalLight constructor called with correct parameters
    expect(THREE.DirectionalLight).toHaveBeenCalledTimes(2);
    expect(THREE.DirectionalLight).toHaveBeenCalledWith(0xffffff, 1);
    
    // Check that directional lights were added to scene
    expect(THREE_MOCKS.add).toHaveBeenCalledWith(mockDirectionalLight1);
    expect(THREE_MOCKS.add).toHaveBeenCalledWith(mockDirectionalLight2);
    
    // Check that the position.set was called with correct values
    expect(mockPositionSet1).toHaveBeenCalledWith(5, 10, 5);
    expect(mockPositionSet2).toHaveBeenCalledWith(-5, -10, 5);
  });
  
  test('adds point light with correct parameters', () => {
    const scene = new THREE.Scene();
    addLighting(scene);
    
    // Check PointLight constructor called with correct parameters
    expect(THREE.PointLight).toHaveBeenCalledWith(0xffffff, 1, 100);
    
    // Check that point light was added to scene
    expect(THREE_MOCKS.add).toHaveBeenCalledWith(mockPointLight);
    
    // Check that the position.set was called with correct values
    expect(mockPositionSet3).toHaveBeenCalledWith(0, 0, 5);
  });
  
  test('disables shadows for all lights', () => {
    const scene = new THREE.Scene();
    addLighting(scene);
    
    // Check that shadows were disabled
    expect(mockDirectionalLight1.castShadow).toBe(false);
    expect(mockDirectionalLight2.castShadow).toBe(false);
    expect(mockPointLight.castShadow).toBe(false);
  });
  
  test('adds a total of four lights to the scene', () => {
    const scene = new THREE.Scene();
    scene.children = [];
    addLighting(scene);
    
    // Check number of times add was called
    expect(THREE_MOCKS.add).toHaveBeenCalledTimes(4);
  });
});