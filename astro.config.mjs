import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL || 'https://harmony-threads-xk7q.vercel.app',
  security: { checkOrigin: false },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
