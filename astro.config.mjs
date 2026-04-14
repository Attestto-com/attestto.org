import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://attestto.org',
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
})
