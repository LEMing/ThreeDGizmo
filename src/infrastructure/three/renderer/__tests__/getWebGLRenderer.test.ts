import * as THREE from 'three';
import getWebGLRenderer from '../getWebGLRenderer';

// Mock the THREE.WebGLRenderer constructor
jest.mock('three', () => {
  const originalModule = jest.requireActual('three');
  return {
    ...originalModule,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      isWebGLRenderer: true
    }))
  };
});

describe('getWebGLRenderer', () => {
  // Save original methods to restore later
  let originalCreateElement: typeof document.createElement;
  let originalConsoleError: typeof console.error;
  let originalWebGLContext: boolean;
  
  beforeEach(() => {
    // Mock console.error
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Reset the THREE.WebGLRenderer mock call count before each test
    (THREE.WebGLRenderer as jest.Mock).mockClear();
    
    // Store original functions
    originalCreateElement = document.createElement;
    
    // Store WebGLRenderingContext existence state
    originalWebGLContext = 'WebGLRenderingContext' in window;
  });
  
  afterEach(() => {
    // Restore original methods
    document.createElement = originalCreateElement;
    console.error = originalConsoleError;
    
    // Clean up mocks
    jest.restoreAllMocks();
  });
  
  test('returns WebGLRenderer when WebGL is available', () => {
    // Mock WebGL context
    const mockContext = {};
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext)
    };
    
    // Mock document.createElement to return our mock canvas
    document.createElement = jest.fn().mockReturnValue(mockCanvas as unknown as HTMLElement);
    
    // Mock global WebGLRenderingContext
    Object.defineProperty(window, 'WebGLRenderingContext', {
      value: function() {},
      writable: true,
      configurable: true
    });
    
    // Call the function
    const renderer = getWebGLRenderer();
    
    // Verify
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
    expect(THREE.WebGLRenderer).toHaveBeenCalledWith({ alpha: true, antialias: false });
    expect(renderer).toEqual(expect.objectContaining({ isWebGLRenderer: true }));
    expect(console.error).not.toHaveBeenCalled();
  });
  
  test('falls back to experimental-webgl when regular webgl is not available', () => {
    // Mock WebGL context with fallback
    const mockContext = {};
    const mockCanvas = {
      getContext: jest.fn().mockImplementation((contextId: string) => {
        if (contextId === 'webgl') return null;
        if (contextId === 'experimental-webgl') return mockContext;
        return null;
      })
    };
    
    // Mock document.createElement to return our mock canvas
    document.createElement = jest.fn().mockReturnValue(mockCanvas as unknown as HTMLElement);
    
    // Mock global WebGLRenderingContext
    Object.defineProperty(window, 'WebGLRenderingContext', {
      value: function() {},
      writable: true,
      configurable: true
    });
    
    // Call the function
    const renderer = getWebGLRenderer();
    
    // Verify
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('experimental-webgl');
    expect(THREE.WebGLRenderer).toHaveBeenCalledWith({ alpha: true, antialias: false });
    expect(renderer).toEqual(expect.objectContaining({ isWebGLRenderer: true }));
    expect(console.error).not.toHaveBeenCalled();
  });
  
  test('returns null and logs error when WebGL is not available', () => {
    // Simulate WebGLRenderingContext not being supported
    Object.defineProperty(window, 'WebGLRenderingContext', {
      value: undefined,
      writable: true,
      configurable: true
    });
    
    // Call the function
    const renderer = getWebGLRenderer();
    
    // Verify
    expect(renderer).toBeNull();
    expect(console.error).toHaveBeenCalledWith('WebGL is not supported in this environment.');
    expect(THREE.WebGLRenderer).not.toHaveBeenCalled();
  });
  
  test('returns null and logs error when canvas.getContext returns null', () => {
    // Mock WebGL context returning null
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(null)
    };
    
    // Mock document.createElement
    document.createElement = jest.fn().mockReturnValue(mockCanvas as unknown as HTMLElement);
    
    // Mock global WebGLRenderingContext
    Object.defineProperty(window, 'WebGLRenderingContext', {
      value: function() {},
      writable: true,
      configurable: true
    });
    
    // Call the function
    const renderer = getWebGLRenderer();
    
    // Verify
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalled();
    expect(renderer).toBeNull();
    expect(console.error).toHaveBeenCalledWith('WebGL is not supported in this environment.');
    expect(THREE.WebGLRenderer).not.toHaveBeenCalled();
  });
  
  test('returns null and logs error when WebGL detection throws error', () => {
    // Mock document.createElement throwing an error
    document.createElement = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // Call the function
    const renderer = getWebGLRenderer();
    
    // Verify
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(renderer).toBeNull();
    expect(console.error).toHaveBeenCalledWith('WebGL is not supported in this environment.');
    expect(THREE.WebGLRenderer).not.toHaveBeenCalled();
  });
});