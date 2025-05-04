import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SceneManager from '../SceneManager';

// Mock the scene components
jest.mock('../scenes', () => ({
  GizmoOnlyScene: jest.fn().mockImplementation(() => <div data-testid="gizmo-only-scene">Gizmo Only Scene</div>),
  CADLikeScene: jest.fn().mockImplementation(() => <div data-testid="cad-like-scene">CAD Like Scene</div>),
  MapFreeFlyScene: jest.fn().mockImplementation(() => <div data-testid="map-free-fly-scene">Map Free Fly Scene</div>),
}));

describe('SceneManager component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders GizmoOnlyScene by default when no selection is provided', () => {
    const { getByTestId } = render(<SceneManager selectedExample="" />);
    expect(getByTestId('gizmo-only-scene')).toBeInTheDocument();
  });

  it('renders GizmoOnlyScene by default when unknown selection is provided', () => {
    const { getByTestId } = render(<SceneManager selectedExample="Unknown Example" />);
    expect(getByTestId('gizmo-only-scene')).toBeInTheDocument();
  });

  it('renders CADLikeScene when "CAD Like" is selected', () => {
    const { getByTestId } = render(<SceneManager selectedExample="CAD Like" />);
    expect(getByTestId('cad-like-scene')).toBeInTheDocument();
  });

  it('renders MapFreeFlyScene when "Map Free Fly" is selected', () => {
    const { getByTestId } = render(<SceneManager selectedExample="Map Free Fly" />);
    expect(getByTestId('map-free-fly-scene')).toBeInTheDocument();
  });
});