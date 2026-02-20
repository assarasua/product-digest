# Product Digest

Medium-style product wiki for daily PM writing, built with Next.js + MDX.

## Programming languages used

- TypeScript (`.ts`, `.tsx`) for the Next.js app and most scripts.
- JavaScript (ESM, `.mjs`) for automation/ops scripts and backend server runtime.
- SQL (PostgreSQL) for persistence (subscribers, likes, product leaders).
- CSS for styling and design system tokens.
- MDX/Markdown for daily editorial content in `content/posts`.

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

### Auto publish + push (cron)

To publish one draft per run and push to Git automatically:

```bash
npm run publish:next-draft:push
```

Example cron (daily at 07:00 CET):

```bash
0 7 * * * cd /Users/axi/Documents/product-digest && PUBLISH_GIT_SSH_KEY=/Users/axi/.ssh/id_ed25519_assarasua_user /opt/homebrew/bin/node scripts/publish-next-draft-push.mjs >> /Users/axi/Documents/product-digest/logs/publish-cron.log 2>&1
```

## Scheduled publishing with database (recommended cloud flow)

The project uses a single production table:

- `posts`: source of truth for both scheduled and published content.
- `status`: `scheduled` or `published`.

When a row in `posts` is due (`scheduled_at <= NOW()` and `status='scheduled'`),
the publisher changes it to `published`. MDX updates are optional
(`PUBLISH_UPDATE_MDX=1`).

### Commands

```bash
DATABASE_URL="postgresql://..." npm run schedule:sync
DATABASE_URL="postgresql://..." npm run publish:scheduled
```

- `schedule:sync`: backfills scheduled MDX posts into `posts`.
- `publish:scheduled`: publishes due rows in `posts`.

### Cloud scheduler (Cloudflare recommended)

Use Cloudflare Workers Cron as the primary scheduler for production.

1. Deploy backend with:
   - `DATABASE_URL`
   - `CRON_SECRET` (new shared secret)
2. Deploy worker in `workers/scheduler`:
   - `wrangler.toml` already configured with `*/5 * * * *`
   - set secret `CRON_SECRET`
   - optional var `PUBLISH_API_URL` (default `https://api.productdigest.es`)
3. Deploy:

```bash
cd workers/scheduler
npx wrangler secret put CRON_SECRET
npx wrangler deploy
```

The worker calls:

- `POST https://api.productdigest.es/api/posts/publish-due`
- Header: `Authorization: Bearer <CRON_SECRET>`

GitHub workflow `.github/workflows/publish-scheduled.yml` is now manual-only
(`workflow_dispatch`) as a backup trigger.

### Git SSH (recommended)

Use a GitHub **Authentication key** (user key), not a repository deploy key:

```bash
git config core.sshCommand "ssh -i /Users/axi/.ssh/id_ed25519_assarasua_user -o IdentitiesOnly=yes"
```

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
- `PUBLISH_GIT_REMOTE` optional (default `origin`) for cron publish script.
- `PUBLISH_GIT_BRANCH` optional (default `main`) for cron publish script.
- `PUBLISH_GIT_SSH_KEY` optional SSH private key path for cron non-interactive push.
- `PUBLISH_GIT_USER_NAME` optional fallback git user name for cron commit.
- `PUBLISH_GIT_USER_EMAIL` optional fallback git user email for cron commit.

## Cloudflare Deploy (OpenNext)

This project uses `@opennextjs/cloudflare` for Next.js deployment on Cloudflare.
It avoids `next-on-pages` conversion issues on newer Next.js versions.

### Build

```bash
npm run cf:build
```

### Deploy

```bash
npm run cf:deploy
```

Commands:

```bash
npx @opennextjs/cloudflare build
npx @opennextjs/cloudflare deploy
```

## Railway Subscribe API (PostgreSQL)

Use this backend to store newsletter emails in Railway Postgres and connect it
to the Edge route used by the site.

Railway deploy settings (important):
- Root Directory: `backend`
- Start Command: `npm start`
- Healthcheck Path: `/healthz` (also available: `/health`, `/api/healthz`)
- Required env vars:
  - `DATABASE_URL`
  - `CRON_SECRET` (if using scheduler endpoint `/api/posts/publish-due`)

### Start backend locally

```bash
npm install pg @types/pg
DATABASE_URL="postgresql://..." npm run backend:start
```

Server endpoints:
- `GET /api/posts?status=published|scheduled|all&tag=<tag>&q=<query>&limit=20&offset=0`
- `GET /api/posts/:slug`
- `POST /api/posts` with body:
  - `slug`
  - `title`
  - `summary`
  - `contentMd`
  - `tags` (`string[]`)
  - `status` (`scheduled|published`)
  - `scheduledAt` (optional ISO)
- `PATCH /api/posts/:slug/schedule` with body `{ "scheduledAt": "<ISO>" }`
- `POST /api/posts/:slug/publish`
- `POST /api/posts/publish-due` (requires `Authorization: Bearer <CRON_SECRET>`)
- `POST /api/subscribe`
- `POST /api/subscribers`
- `GET /api/likes?slug=<post-slug>`
- `POST /api/likes` with body `{ "slug": "<post-slug>" }`
- `GET /api/product-leaders`
- `GET /api/scheduled-posts`
- `POST /api/scheduled-posts` with body:
  - `slug`
  - `markdownPath` (optional, defaults to `db://<slug>`)
  - `title` (optional if MDX path is provided)
  - `summary` (optional if MDX path is provided)
  - `contentMd` (optional if MDX path is provided)
  - `tags` (`string[]`, optional)
  - `scheduledAt` (ISO)
  - `timezone` (optional, default `Europe/Madrid`)
  - `status` (`scheduled|published`, optional)
- `GET /healthz`

### DB-first publishing flow (production)

Use PostgreSQL as source of truth:

1. Create/update a post directly in DB:

```bash
DATABASE_URL="postgresql://..." npm run new:post:db -- \
  --slug "mi-post" \
  --title "Mi post" \
  --summary "Resumen breve" \
  --scheduledAt "2026-02-21T08:00:00+01:00" \
  --tags "producto,ai" \
  --content "Contenido en markdown"
```

2. Auto-publish due posts (cron/CI):

```bash
DATABASE_URL="postgresql://..." npm run publish:scheduled
```

`publish:scheduled` publishes rows in `posts` when `scheduled_at <= NOW()`.
Set `PUBLISH_UPDATE_MDX=1` only if you also want to keep legacy MDX files
synchronized.

### Connect frontend (Cloudflare)

Set frontend API base URL:

```bash
NEXT_PUBLIC_POSTS_API_BASE_URL=https://api.productdigest.es
```

For Product Leaders wiki data:

```bash
NEXT_PUBLIC_PRODUCT_LEADERS_API_BASE_URL=https://api.productdigest.es
```
