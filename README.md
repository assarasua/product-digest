# Product Digest

Medium-style product wiki for daily PM writing, built with Next.js + MDX.

## Quick start

```bash
nvm use 22 # if you use nvm
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Daily publishing workflow

Create a new post scaffold:

```bash
npm run new:post -- "Your post title"
```

Posts are stored in `content/posts` as `YYYY-MM-DD-slug.mdx`.

## Build outputs

- Search index: `public/search-index.json` (generated in `prebuild`)
- RSS feed: `/rss.xml`
- Sitemap: `/sitemap.xml`

## Build and validation commands

- `npm run build:local`: fast local build (lint disabled)
- `npm run build:ci`: strict release/CI build path
- `npm run build:debug`: verbose build diagnostics
- `npm run check:runtime`: fails fast if Node is not 22.x
- `npm run check:types`: TypeScript validation
- `npm run check:types:debug`: TypeScript check with runtime timing output
- `npm run check:content`: frontmatter/content validation
- `npm run check:lint`: lint checks (currently intended as non-blocking in CI)
- `npm run doctor`: environment + content guardrail checks
- `npm run kill:next`: terminate stale Next/npm processes
- `npm run clean:next`: remove `.next` build/cache directory

## Quick Recovery (build hangs)

When build/check commands freeze, run these steps in order:

```bash
npm run kill:next
npm run clean:next
npm run doctor
```

Then retry:

```bash
npm run build:local
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL` for canonical URLs and feed/sitemap links.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to enable Plausible outbound-links analytics.

## Cloudflare Pages (without Vercel)

Use Cloudflare Pages build/deploy flow, not `wrangler deploy`.

### Build settings in Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run cf:build`
- Build output directory: `.vercel/output/static`
- Node.js version: `22`

### Local deploy command (optional)

```bash
npm run cf:deploy
```

### Important

- Do not use `wrangler deploy` for this project.
- If you use Wrangler directly, use `wrangler pages deploy ...` instead.
