// getWebGLRenderer.test.js

import * as THREE from 'three';
import getWebGLRenderer from '../getWebGLRenderer';

jest.mock('three', () => ({
  WebGLRenderer: jest.fn(),
}))

describe('getWebGLRenderer', () => {
  let originalCreateElement = document.createElement;
  let originalWebGLRenderingContext: unknown;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original functions
    originalCreateElement = document.createElement;
    originalWebGLRenderingContext = window.WebGLRenderingContext;

    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original functions
    document.createElement = originalCreateElement;
    // @ts-ignore
    window.WebGLRenderingContext = originalWebGLRenderingContext;
    consoleErrorSpy.mockRestore();
  });

  test('returns null and logs error when WebGL is not available', () => {
    // Simulate absence of WebGL support
    // @ts-ignore
    window.WebGLRenderingContext = undefined;

    // Mock canvas element with getContext method returning null
    const getContextMock = jest.fn().mockReturnValue(null);
    const canvasMock = { getContext: getContextMock };

    document.createElement = jest.fn().mockReturnValue(canvasMock);

    const renderer = getWebGLRenderer();

    expect(renderer).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('WebGL is not supported in this environment.');
  });

  test('returns a WebGLRenderer when WebGL is available', () => {
    // Mock window.WebGLRenderingContext to simulate WebGL support
    // @ts-ignore
    window.WebGLRenderingContext = function () {};

    // Create a mock WebGL context with the necessary methods and properties
    const mockWebGLContext = {
      // Mock methods and properties as needed
      getExtension: jest.fn(),
      // ... add other methods used by THREE.WebGLRenderer
    };

    // Mock canvas.getContext to return the mock WebGL context
    const getContextMock = jest.fn().mockImplementation((contextType) => {
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        return mockWebGLContext;
      }
      return null;
    });

    // Mock document.createElement to return a canvas with the mocked getContext
    // @ts-ignore
    jest.spyOn(document, 'createElement').mockImplementation((elementType) => {
      if (elementType === 'canvas') {
        return {
          getContext: getContextMock,
        };
      }
      // For other element types, use the default implementation
      return document.createElement(elementType);
    });

    const renderer = getWebGLRenderer();

    expect(renderer).toBeInstanceOf(THREE.WebGLRenderer);
    expect(getContextMock).toHaveBeenCalledWith('webgl');
  });

});
