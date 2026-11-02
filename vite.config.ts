import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_'],
  build: {
    cssTarget: 'esnext',
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  plugins: [
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@esri/calcite-components/dist/cdn/assets/**/*',
          dest: 'calcite/assets',
          rename: { stripBase: 6 },
        },
      ],
    }),
  ],
})
