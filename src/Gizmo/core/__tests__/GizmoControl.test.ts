import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {mockRenderer} from '../../../__mocks__/mockRenderer';
import GizmoControl from '../GizmoControl';

jest.mock('../GizmoCube');

describe('GizmoControl', () => {
  let gizmoDiv: HTMLDivElement;
  let gizmoScene: THREE.Scene;
  let gizmoRenderer: THREE.WebGLRenderer;
  let gizmoCamera: THREE.PerspectiveCamera;
  let mainCamera: THREE.PerspectiveCamera;
  let mainControls: OrbitControls;
  let renderGizmo: jest.Mock;
  let syncFunctions: {
    syncGizmoCameraWithMain: jest.Mock;
    syncMainCameraWithGizmo: jest.Mock;
  };

  beforeEach(() => {
    // Set up the DOM
    gizmoDiv = document.createElement('div');
    document.body.appendChild(gizmoDiv);
    gizmoDiv.style.width = '100px';
    gizmoDiv.style.height = '100px';

    // Set up Three.js components
    gizmoScene = new THREE.Scene();
    gizmoRenderer = mockRenderer as unknown as THREE.WebGLRenderer;
    gizmoCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    mainCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    mainControls = new OrbitControls(mainCamera, document.createElement('div'));
    renderGizmo = jest.fn();

    syncFunctions = {
      syncGizmoCameraWithMain: jest.fn(),
      syncMainCameraWithGizmo: jest.fn(),
    };
  });

  afterEach(() => {
    document.body.removeChild(gizmoDiv);
  });

  it('should initialize correctly', () => {
    const gizmoControl = new GizmoControl({
      gizmoParams: {
        gizmoDiv,
        gizmoScene,
        gizmoRenderer,
        gizmoCamera,
      },
      mainParams: {
        mainCamera,
        mainControls,
        renderGizmo,
      },
      syncFunctions,
    });

    expect(gizmoControl).toBeDefined();
    expect(gizmoRenderer.domElement.parentNode).toBe(gizmoDiv);
    expect(gizmoScene.children.length).toBeGreaterThan(0); // Check if GizmoCube and lights were added
  });

  it('should start and stop animation loop', () => {
    jest.spyOn(window, 'requestAnimationFrame');
    jest.spyOn(window, 'cancelAnimationFrame');

    const gizmoControl = new GizmoControl({
      gizmoParams: {
        gizmoDiv,
        gizmoScene,
        gizmoRenderer,
        gizmoCamera,
      },
      mainParams: {
        mainCamera,
        mainControls,
        renderGizmo,
      },
      syncFunctions,
    });

    expect(window.requestAnimationFrame).toHaveBeenCalled();

    gizmoControl.dispose();

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should dispose correctly', () => {
    const gizmoControl = new GizmoControl({
      gizmoParams: {
        gizmoDiv,
        gizmoScene,
        gizmoRenderer,
        gizmoCamera,
      },
      mainParams: {
        mainCamera,
        mainControls,
        renderGizmo,
      },
      syncFunctions,
    });

    const initialChildCount = gizmoScene.children.length;

    gizmoControl.dispose();

    expect(gizmoScene.children.length).toBe(0);
    expect(gizmoScene.children.length).toBeLessThan(initialChildCount);
  });
});
