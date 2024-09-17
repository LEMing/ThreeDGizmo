import * as THREE from 'three';
import './App.css';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Gizmo from './Gizmo/Gizmo';

function App() {
  const camera = new THREE.Camera();
  const controls = new OrbitControls(camera, document.createElement('div'));
  return (
    <>
      <Gizmo render={() => console.log('render')} camera={camera} controls={controls} className="custom-gizmo-style"/>
    </>
  )
}

export default App
