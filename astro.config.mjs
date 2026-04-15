import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://attestto.org',
  output: 'static',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
})
