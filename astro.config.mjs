import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  output: 'server',
  outDir: 'dist',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [svelte()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4321'),
  },
});
