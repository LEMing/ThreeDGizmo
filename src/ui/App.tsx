import React, { useState } from 'react';
import SceneManager from './components/SceneManager';
import './styles/App.css';

// Define the available examples
const examples = {
  GIZMO_ONLY: 'Gizmo Only',
  CAD_LIKE: 'CAD Like',
  MAP_FREE_FLY: 'Map Free Fly',
};

const App: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>(examples.GIZMO_ONLY);

  return (
    <div className="content">

      <h1>...::THREEDGIZMO::...</h1>
      <select
        className="example-select"
        value={selectedExample}
        onChange={(e) => setSelectedExample(e.target.value)}
      >
        <option value={examples.GIZMO_ONLY}>Gizmo Only</option>
        <option value={examples.CAD_LIKE}>CAD Like</option>
        <option value={examples.MAP_FREE_FLY}>Map Free Fly</option>
      </select>


      <div className="example-container">
        <SceneManager selectedExample={selectedExample} />
      </div>
    </div>
  );
};

export default App;