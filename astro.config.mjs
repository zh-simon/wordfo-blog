import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wordfo.pages.dev',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
