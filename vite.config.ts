import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/__mocks__/**/*'],
      insertTypesEntry: true,
    }),
    cssInjectedByJsPlugin(),
  ],
  server: {
    watch: {
      ignored: ['!**/*.ts', '!**/*.tsx'],
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ThreeDGizmo',
      formats: ['es', 'umd'],
      fileName: (format) => `three-d-gizmo.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'three'],
      output: {
        globals: {
          react: 'React',
          three: 'THREE'
        }
      }
    }
  }
})
