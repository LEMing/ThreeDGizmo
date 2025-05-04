import React from 'react';
import { GizmoOnlyScene, CADLikeScene, MapFreeFlyScene } from './scenes';

interface SceneManagerProps {
  selectedExample: string;
}

const SceneManager: React.FC<SceneManagerProps> = ({ selectedExample }) => {
  switch (selectedExample) {
    case 'CAD Like':
      return <CADLikeScene />;
    case 'Map Free Fly':
      return <MapFreeFlyScene />;
    default:
      return <GizmoOnlyScene />;
  }
};

export default SceneManager;