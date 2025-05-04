# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Run all tests: `npm test`
- Run a single test: `npx jest path/to/your-test.test.ts`
- Run tests with coverage: `npx jest --coverage`

## Code Style Guidelines
- **TypeScript**: Strict mode enabled with ES2018 target
- **Imports**: Group imports by external libraries first, then internal modules
- **Formatting**: Use consistent indentation (2 spaces) and trailing semicolons
- **Naming**: 
  - PascalCase for components, interfaces, and types (e.g., `GizmoControl`)
  - camelCase for variables, functions, and methods (e.g., `createTextSprite`)
- **React**: Use functional components with hooks pattern (e.g., `useGizmoMouseEvents`)
- **Type Safety**: Explicit return types on functions, avoid `any` type
- **Testing**: Jest with React Testing Library, mock required Three.js components
- **Error Handling**: Use typed errors and explicit error boundaries

This project is a Three.js-based 3D gizmo component for React applications with TypeScript support.