import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://personal-blog.pages.dev',
  output: 'static',
  build: { format: 'directory' },
});
