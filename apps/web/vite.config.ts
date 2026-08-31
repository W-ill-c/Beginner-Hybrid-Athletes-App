import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Forwards /api requests to the backend (apps/server) during dev, so
    // the frontend can just call fetch('/api/...') without worrying about
    // CORS or hardcoding the server's port.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
      },
    },
  },
})
