import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ROTATION_ARROWS_NAME } from "../../domain/gizmo/constants";

type CameraControls = OrbitControls | MapControls;

interface CameraSystem {
  camera: THREE.Camera;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  up: THREE.Vector3;
}

const CAMERA_SETTINGS = {
  GIZMO_DISTANCE: 8,
  DEFAULT_UP: new THREE.Vector3(0, 1, 0),
  FORWARD: new THREE.Vector3(0, 0, -1),
};

const getForwardDirection = (quaternion: THREE.Quaternion): THREE.Vector3 =>
  CAMERA_SETTINGS.FORWARD.clone().applyQuaternion(quaternion);

const calculateCameraPosition = (
  direction: THREE.Vector3,
  distance: number,
  target: THREE.Vector3 = new THREE.Vector3(),
): THREE.Vector3 => target.clone().add(direction.multiplyScalar(-distance));

class CameraSynchronizer {
  constructor(
    private readonly gizmoScene: THREE.Scene,
    private readonly gizmoArrowsName: string = ROTATION_ARROWS_NAME,
  ) {}

  syncGizmoWithMain(gizmo: CameraSystem, main: CameraSystem): void {
    // Sync full orientation from main camera
    gizmo.quaternion.copy(main.quaternion);
    gizmo.up.copy(main.up);

    // Calculate and set position based on orientation
    // This places the camera behind the origin relative to its forward direction
    const direction = getForwardDirection(gizmo.quaternion).normalize();
    gizmo.position.copy(
      calculateCameraPosition(direction, CAMERA_SETTINGS.GIZMO_DISTANCE),
    );

    // Update world matrix (don't use lookAt as it would overwrite the quaternion)
    gizmo.camera.updateMatrixWorld(true);

    // Update rotation arrows if they exist
    const arrows = this.gizmoScene.getObjectByName(this.gizmoArrowsName);
    if (arrows) {
      arrows.rotation.copy(gizmo.camera.rotation);
    }
  }

  syncMainWithGizmo(
    main: CameraSystem,
    gizmo: CameraSystem,
    controls: CameraControls,
  ): void {
    const target = controls.target.clone();
    const currentDistance = main.position.distanceTo(target);

    // Use orbit controls sync for perspective cameras (allows full rotation)
    // Use map controls sync for orthographic cameras (restricts to horizontal rotation)
    const isPerspectiveCamera = main.camera instanceof THREE.PerspectiveCamera;
    if (controls instanceof MapControls && !isPerspectiveCamera) {
      this.syncMapControls(main, gizmo, target, currentDistance);
    } else {
      this.syncOrbitControls(main, gizmo, target, currentDistance);
    }

    // Finalize updates
    main.camera.updateMatrix();
    main.camera.updateMatrixWorld(true);
    controls.update();
  }

  private syncMapControls(
    main: CameraSystem,
    gizmo: CameraSystem,
    target: THREE.Vector3,
    distance: number,
  ): void {
    const currentHeight = main.position.y - target.y;

    const forward = getForwardDirection(gizmo.quaternion);
    forward.y = 0;
    forward.normalize();

    const newPosition = target.clone();
    newPosition.y += currentHeight;
    newPosition.add(forward.multiplyScalar(-distance));

    main.position.copy(newPosition);
    main.up.copy(CAMERA_SETTINGS.DEFAULT_UP);
    main.camera.lookAt(target);
  }

  private syncOrbitControls(
    main: CameraSystem,
    gizmo: CameraSystem,
    target: THREE.Vector3,
    distance: number,
  ): void {
    const forward = getForwardDirection(gizmo.quaternion);
    const up = CAMERA_SETTINGS.DEFAULT_UP.clone().applyQuaternion(
      gizmo.quaternion,
    );

    const newPosition = calculateCameraPosition(forward, distance, target);

    main.position.copy(newPosition);
    main.up.copy(up);
    main.camera.lookAt(target);
  }
}

// Exported for testing purposes
export const createCameraSynchronizer = (
  gizmoScene: THREE.Scene,
): CameraSynchronizer => new CameraSynchronizer(gizmoScene);

export const syncGizmoCameraWithMain = (
  gizmoCamera: THREE.Camera,
  mainCamera: THREE.Camera,
  gizmoScene: THREE.Scene,
): void => {
  const synchronizer = createCameraSynchronizer(gizmoScene);
  synchronizer.syncGizmoWithMain(
    {
      camera: gizmoCamera,
      position: gizmoCamera.position,
      quaternion: gizmoCamera.quaternion,
      up: gizmoCamera.up,
    },
    {
      camera: mainCamera,
      position: mainCamera.position,
      quaternion: mainCamera.quaternion,
      up: mainCamera.up,
    },
  );
};

export const syncMainCameraWithGizmo = (
  mainCamera: THREE.Camera,
  gizmoCamera: THREE.Camera,
  controls: CameraControls,
): void => {
  const synchronizer = createCameraSynchronizer(gizmoCamera.userData.scene);
  synchronizer.syncMainWithGizmo(
    {
      camera: mainCamera,
      position: mainCamera.position,
      quaternion: mainCamera.quaternion,
      up: mainCamera.up,
    },
    {
      camera: gizmoCamera,
      position: gizmoCamera.position,
      quaternion: gizmoCamera.quaternion,
      up: gizmoCamera.up,
    },
    controls,
  );
};