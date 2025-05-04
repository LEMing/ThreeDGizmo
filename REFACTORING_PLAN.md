# ThreeDGizmo Refactoring Plan

This document outlines a plan to refactor the ThreeDGizmo codebase into a more maintainable architecture using domain-driven design principles.

## New Directory Structure

```
src/
  ├── domain/               # Business logic and models
  │   ├── gizmo/            # Core gizmo functionality
  │   │   ├── entities/     # GizmoCube, GizmoRotationArrows
  │   │   ├── factories/    # Previously in factories/
  │   │   ├── __tests__/    # Tests for domain entities
  │   │   └── types.ts      
  ├── ui/                   # UI components
  │   ├── components/       # React components
  │   │   ├── Gizmo/        # Main gizmo component
  │   │   │   └── __tests__/ # Tests for Gizmo component
  │   │   └── scenes/       # Demo scenes
  │   └── styles/           # CSS and styling
  ├── services/             # Application services
  │   ├── camera/           # Camera handling
  │   │   └── __tests__/    # Tests for camera services
  │   └── animation/        # Animation services
  │       └── __tests__/    # Tests for animation services
  ├── hooks/                # React hooks
  │   ├── __tests__/        # Tests for hooks
  │   └── useGizmoMouseEvents.ts
  ├── infrastructure/       # Technical infrastructure
  │   ├── three/            # Three.js utilities and helpers
  │   │   ├── lighting/
  │   │   ├── renderer/
  │   │   ├── controls/
  │   │   └── __tests__/    # Tests for Three.js utilities
  │   ├── utils/            # General utilities
  │   │   ├── math/
  │   │   ├── object/
  │   │   ├── __tests__/    # Tests for utilities
  │   │   └── throttle.ts
  │   └── mocks/            # Test mocks
  └── index.ts              # Main entry point
```

## File Movements

### Domain Layer
- `src/Gizmo/core/GizmoCube.ts` → `src/domain/gizmo/entities/GizmoCube.ts`
- `src/Gizmo/core/GizmoRotationArrows.ts` → `src/domain/gizmo/entities/GizmoRotationArrows.ts`
- `src/Gizmo/core/GizmoControl.ts` → `src/domain/gizmo/entities/GizmoControl.ts`
- `src/Gizmo/factories/CubePartFactory.ts` → `src/domain/gizmo/factories/CubePartFactory.ts`
- `src/Gizmo/factories/TextureFactory.ts` → `src/domain/gizmo/factories/TextureFactory.ts`
- `src/Gizmo/types.ts` → `src/domain/gizmo/types.ts`
- `src/Gizmo/constants.ts` → `src/domain/gizmo/constants.ts`
- `src/Gizmo/core/__tests__/GizmoCube.test.ts` → `src/domain/gizmo/__tests__/entities/GizmoCube.test.ts`
- `src/Gizmo/core/__tests__/GizmoRotationArrows.test.ts` → `src/domain/gizmo/__tests__/entities/GizmoRotationArrows.test.ts`
- `src/Gizmo/core/__tests__/GizmoControl.test.ts` → `src/domain/gizmo/__tests__/entities/GizmoControl.test.ts`
- `src/Gizmo/factories/__tests__/CubePartFactory.test.ts` → `src/domain/gizmo/__tests__/factories/CubePartFactory.test.ts`
- `src/Gizmo/factories/__tests__/TextureFactory.test.ts` → `src/domain/gizmo/__tests__/factories/TextureFactory.test.ts`

### UI Layer
- `src/Gizmo/components/Gizmo.tsx` → `src/ui/components/Gizmo/Gizmo.tsx`
- `src/Gizmo/Gizmo.css` → `src/ui/styles/Gizmo.css`
- `src/App.tsx` → `src/ui/App.tsx`
- `src/App.css` → `src/ui/styles/App.css`
- `src/scenes/CADLikeScene.tsx` → `src/ui/components/scenes/CADLikeScene.tsx`
- `src/scenes/GizmoOnlyScene.tsx` → `src/ui/components/scenes/GizmoOnlyScene.tsx`
- `src/scenes/MapFreeFlyScene.tsx` → `src/ui/components/scenes/MapFreeFlyScene.tsx`
- `src/SceneManager.tsx` → `src/ui/components/SceneManager.tsx`
- `src/Gizmo/components/__tests__/Gizmo.test.tsx` → `src/ui/components/Gizmo/__tests__/Gizmo.test.tsx`

### Services Layer
- `src/Gizmo/core/CameraController.ts` → `src/services/camera/CameraController.ts`
- `src/Gizmo/utils/animateCameraToPosition.ts` → `src/services/animation/animateCameraToPosition.ts`
- `src/Gizmo/core/__tests__/CameraController.test.ts` → `src/services/camera/__tests__/CameraController.test.ts`
- `src/Gizmo/utils/__tests__/animateCameraToPosition.test.ts` → `src/services/animation/__tests__/animateCameraToPosition.test.ts`

### Hooks Layer
- `src/Gizmo/hooks/useGizmoMouseEvents.ts` → `src/hooks/useGizmoMouseEvents.ts`
- `src/Gizmo/hooks/__tests__/useGizmoMouseEvents.test.ts` → `src/hooks/__tests__/useGizmoMouseEvents.test.ts`

### Infrastructure Layer
- `src/Gizmo/utils/getWebGLRenderer.ts` → `src/infrastructure/three/renderer/getWebGLRenderer.ts`
- `src/Gizmo/utils/addLighting.ts` → `src/infrastructure/three/lighting/addLighting.ts`
- `src/Gizmo/utils/createTextSprite.ts` → `src/infrastructure/three/createTextSprite.ts`
- `src/Gizmo/utils/mouseUtils.ts` → `src/infrastructure/utils/mouseUtils.ts`
- `src/Gizmo/utils/objectUtils.ts` → `src/infrastructure/utils/object/objectUtils.ts`
- `src/Gizmo/utils/throttle.ts` → `src/infrastructure/utils/throttle.ts`
- `src/__mocks__/` → `src/infrastructure/mocks/`
- `src/Gizmo/utils/__tests__/getWebGLRenderer.test.ts` → `src/infrastructure/three/__tests__/renderer/getWebGLRenderer.test.ts`
- `src/Gizmo/utils/__tests__/addLightning.test.ts` → `src/infrastructure/three/__tests__/lighting/addLightning.test.ts`
- `src/Gizmo/utils/__tests__/createTextSprite.test.ts` → `src/infrastructure/three/__tests__/createTextSprite.test.ts`
- `src/Gizmo/utils/__tests__/mouseUtils.test.ts` → `src/infrastructure/utils/__tests__/mouseUtils.test.ts`
- `src/Gizmo/utils/__tests__/throttle.test.ts` → `src/infrastructure/utils/__tests__/throttle.test.ts`

### Entry Point
- `src/index.ts` → Remains at root level, but imports from new locations
- `src/main.tsx` → Remains at root level, but imports from new UI components

## Migration Strategy

1. **Create the new directory structure** first without moving files
   ```bash
   mkdir -p src/{domain/gizmo/{entities,factories,__tests__/{entities,factories}},ui/{components/Gizmo/__tests__,styles,components/scenes},services/{camera,animation}/__tests__,hooks/__tests__,infrastructure/{three/{lighting,renderer,controls,__tests__/{lighting,renderer}},utils/{math,object,__tests__},mocks}}
   ```

2. **Move files in small batches** by related functionality:
   - Start with infrastructure/utils (least dependencies)
   - Then move domain/gizmo entities
   - Next services
   - Finally UI components

3. **Update imports incrementally** after each move, running tests

4. **Use barrel files** (index.ts) in each directory to simplify imports:
   ```typescript
   // domain/gizmo/index.ts
   export * from './entities/GizmoCube';
   export * from './entities/GizmoRotationArrows';
   ```

5. **Remove original files** after verifying that they have been successfully moved and all tests pass
   ```bash
   # Example script to run after a successful move and test
   rm -rf src/Gizmo/utils
   rm -rf src/Gizmo/core
   rm -rf src/Gizmo/factories
   rm -rf src/Gizmo/components
   rm -rf src/Gizmo/hooks
   rm -rf src/scenes
   rm -rf src/__mocks__
   ```

6. **Maintain backward compatibility** with a temporary facade pattern during transition

7. **Update tests** to reflect the new structure, ensuring the test imports match the new file locations

8. **Refine integration points** between layers after the initial move

## Architectural Principles

1. **Domain Independence**: Domain logic should not depend on UI or infrastructure
   - Domain entities should use plain TypeScript with no framework dependencies

2. **Dependency Direction**: Dependencies should flow inward
   - UI → Services → Domain
   - Infrastructure can be used by all layers

3. **Interface Segregation**: Components should only expose what's necessary
   - Use proper TypeScript interfaces to define contracts between layers

4. **Single Responsibility**: Each module should do one thing well
   - Prefer small, focused files over large multi-purpose ones

5. **Services as Coordinators**: Services should orchestrate between domain and UI
   - Handle complex operations using domain entities