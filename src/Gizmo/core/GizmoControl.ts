// imports
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { addLighting } from "../utils/addLighting";
import { GizmoCube } from "./GizmoCube";
import { GizmoOptions } from "../types";
import { InitialCubeFace, ROTATION_ARROWS_NAME } from "../constants";

interface GizmoParams {
  gizmoDiv: HTMLDivElement;
  gizmoScene: THREE.Scene;
  gizmoRenderer: THREE.WebGLRenderer;
  gizmoCamera: THREE.PerspectiveCamera;
}

interface MainParams {
  mainCamera: THREE.Camera;
  mainControls: OrbitControls | MapControls;
  renderGizmo: () => void;
}

interface SyncFunctions {
  syncGizmoCameraWithMain: (
    gizmoCamera: THREE.Camera,
    mainCamera: THREE.Camera,
    gizmoScene: THREE.Scene,
  ) => void;
  syncMainCameraWithGizmo: (
    mainCamera: THREE.Camera,
    gizmoCamera: THREE.Camera,
    controls: OrbitControls | MapControls,
  ) => void;
}

interface GizmoControlParams {
  gizmoParams: GizmoParams;
  mainParams: MainParams;
  syncFunctions: SyncFunctions;
  options?: GizmoOptions;
}

class GizmoControl {
  private gizmoDiv: HTMLDivElement;
  private gizmoScene: THREE.Scene;
  private gizmoRenderer: THREE.WebGLRenderer;
  private gizmoCamera: THREE.PerspectiveCamera;
  private mainCamera: THREE.Camera;
  private mainControls: OrbitControls | MapControls;
  private renderGizmo: () => void;
  readonly gizmoControls: OrbitControls;
  private onChangeMainControlsListener: () => void = () => {};
  private onChangeGizmoControlsListener: () => void = () => {};
  private animationId: number = 0;
  private syncFunctions: SyncFunctions;
  private options?: GizmoOptions;

  constructor(params: GizmoControlParams) {
    const { gizmoParams, mainParams, syncFunctions, options } = params;

    this.gizmoDiv = gizmoParams.gizmoDiv;
    this.gizmoScene = gizmoParams.gizmoScene;
    this.gizmoRenderer = gizmoParams.gizmoRenderer;
    this.gizmoCamera = gizmoParams.gizmoCamera;
    this.mainCamera = mainParams.mainCamera;
    this.mainControls = mainParams.mainControls;
    this.renderGizmo = mainParams.renderGizmo;
    this.syncFunctions = syncFunctions;
    this.options = options;
    this.gizmoControls = new OrbitControls(
      this.gizmoCamera,
      this.gizmoRenderer.domElement,
    );

    this.initializeRenderer();
    this.initializeScene();
    this.initializeControls();
    this.startAnimationLoop();
  }

  private initializeRenderer() {
    this.gizmoRenderer.setPixelRatio(window.devicePixelRatio);
    this.gizmoRenderer.setSize(
      this.gizmoDiv.clientWidth,
      this.gizmoDiv.clientHeight,
    );
    this.gizmoDiv.appendChild(this.gizmoRenderer.domElement);
  }

  private initializeScene() {
    const gizmoCube = new GizmoCube({
      initialFace: this.options?.initialFace ?? InitialCubeFace.FRONT,
    }).create();
    this.gizmoScene.add(gizmoCube);
    addLighting(this.gizmoScene);
  }

  private initializeControls() {
    this.onChangeMainControlsListener = () =>
      this.syncFunctions.syncGizmoCameraWithMain(
        this.gizmoCamera,
        this.mainCamera,
        this.gizmoScene,
      );

    this.mainControls.addEventListener(
      "change",
      this.onChangeMainControlsListener,
    );

    this.gizmoControls.enableZoom = false;
    this.gizmoControls.enablePan = false;
    this.gizmoControls.rotateSpeed = 0.5;
    this.gizmoControls.update();

    this.onChangeGizmoControlsListener = () => {
      const object = this.gizmoScene.getObjectByName(ROTATION_ARROWS_NAME);
      object?.rotation.copy(this.gizmoCamera.rotation);

      this.syncFunctions.syncMainCameraWithGizmo(
        this.mainCamera,
        this.gizmoCamera,
        this.mainControls,
      );
      this.renderGizmo();
    };

    this.gizmoControls.addEventListener(
      "change",
      this.onChangeGizmoControlsListener,
    );
  }

  private startAnimationLoop() {
    const render = () => {
      this.gizmoRenderer.render(this.gizmoScene, this.gizmoCamera);
    };

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      render();
    };
    animate();
  }

  public dispose() {
    this.mainControls.removeEventListener(
      "change",
      this.onChangeMainControlsListener,
    );
    this.gizmoControls.removeEventListener(
      "change",
      this.onChangeGizmoControlsListener,
    );
    this.gizmoScene.clear();
    cancelAnimationFrame(this.animationId);
  }
}

export default GizmoControl;
