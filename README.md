# ThreeDGizmo

A React component for integrating a 3D Gizmo control with Three.js scenes, supporting both `OrbitControls` and `MapControls`.
It's a "clone" of "Fusion 360" gizmo control in the sense of using the same approach with active corners, edges and faces for better navigation.
This control will align the camera with the appropriate "direction" vector by click at the active area.
The "direction" vector is a vector from the center of the cube to the center of the active area.

![ThreeDGizmo Preview](https://github.com/LEMing/ThreeDGizmo/raw/main/src/assets/cover.png)
![Map Controls Preview](https://github.com/LEMing/ThreeDGizmo/raw/main/src/assets/map-controls.png)
![Orbit Controls Preview](https://github.com/LEMing/ThreeDGizmo/raw/main/src/assets/orbit-controls.png)

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
    - [Basic Setup](#basic-setup)
    - [Using with MapControls](#using-with-mapcontrols)
- [API](#api)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

You can install the package via npm:

```bash
npm install threedgizmo three react react-dom
```

Or with yarn:

```bash
yarn add threedgizmo three react react-dom
```

**Note**: This library has peer dependencies on `three`, `react`, and `react-dom`. Ensure they are installed in your project.

## Features

- Integrates a 3D Gizmo control into your Three.js scene.
- Supports both `OrbitControls` and `MapControls`.
- Synchronizes the Gizmo with your main camera and controls.
- Written in TypeScript for type safety and IntelliSense support.

## Usage

### Basic Setup

Here's a basic example of how to use the `Gizmo` component in your React application.

```jsx
import React, { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import Gizmo from 'threedgizmo';

const ThreeDViewer = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);

  const renderScene = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!mountRef.current) return;

    // Initialize renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Initialize scene
    sceneRef.current = new THREE.Scene();

    // Initialize camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    // Initialize controls
    controlsRef.current = new MapControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controlsRef.current.update();

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current.update();
      renderScene();
    };
    animate();

    // Cleanup on unmount
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [renderScene]);

  return (
    <>
      <Gizmo
        camera={cameraRef.current}
        controls={controlsRef.current}
        render={renderScene}
      />
      <div ref={mountRef} />
    </>
  );
};

export default ThreeDViewer;
```

### Using with MapControls

The `Gizmo` component supports `MapControls` out of the box. Ensure you import and use `MapControls` when initializing your controls.

```jsx
import { MapControls } from 'three/examples/jsm/controls/MapControls';

// ... inside your component initialization
controlsRef.current = new MapControls(
  cameraRef.current,
  rendererRef.current.domElement
);
```

## API

### Gizmo Props

| Prop | Type | Description |
|------|------|-------------|
| `camera` | `THREE.Camera \| null` | The main camera of your scene. |
| `controls` | `MapControls \| OrbitControls \| null` | The controls used in your scene (`MapControls` or `OrbitControls`). |
| `render` | `() => void` | A function that triggers the rendering of your main scene. |
| `className` | `string` | Optional CSS class for styling the Gizmo container. |

## Examples

You can find a working example in the `examples` directory of the repository.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

To set up the project locally:

1. Clone the repository:

```bash
git clone https://github.com/LEMing/ThreeDGizmo.git
```

2. Install dependencies:

```bash
cd ThreeDGizmo
npm install
```

3. Run the development server:

```bash
npm run dev
```

## License

This project is licensed under the MIT License.
