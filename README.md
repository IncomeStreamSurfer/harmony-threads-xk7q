# Harbor Astro Starter

Minimal Astro 5 starter — cloned by Harbor Build to skip scaffold-time
boilerplate. Ships the mechanical setup that the skills don't own:

- `astro.config.mjs` — vercel adapter, tailwind v4, sitemap,
  **`security: { checkOrigin: false }`** (fixes "Cross-site POST forbidden")
- `package.json` — pinned `astro@^5.14.1` + `@astrojs/vercel@^8.2.8`
  + tailwind v4 + `@supabase/supabase-js` + `stripe` + `@astrojs/sitemap`
- `tsconfig.json` — strict mode, `~/*` path alias
- `.gitignore` — excludes `.env`, `node_modules`, `.astro`, `dist`, `.vercel`
- `.env.example` — documents the env vars the site expects

Everything else (SEOHead, Base layout, supabase client, rate-limit,
sanitize, middleware, robots.txt, favicon, global.css) is governed by
the Harbor skills and written per-build. The template intentionally
DOES NOT ship those — having the template stub them in caused agents
to overwrite-from-skill, doubling output tokens for zero benefit.

Only `src/pages/index.astro` ships as a minimal "Brewing…" placeholder
so Astro doesn't error before the first hero write.

Not intended for general use.
