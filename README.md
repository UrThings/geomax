# Geomax — Personal Product Catalog

A single-owner product catalog with a Mongolian-language public storefront and a private admin dashboard. Built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7, and Neon PostgreSQL, deployed on Vercel.

## Features

- Public pages: home, all products with search/filter/sort/pagination, product detail with gallery, category pages, about, contact, 404/error screens, sitemap + robots.
- Admin dashboard (`/admin`): login, stats, full product CRUD with image management, category CRUD, site settings, password change.
- Image uploads via `POST /api/upload` (admin-only, JPEG/PNG/WebP/GIF/AVIF, max 5 MB) → Vercel Blob when configured, otherwise local `public/uploads/` in dev.
- JWT-session auth (httpOnly cookie, `jose`) enforced by `proxy.ts` and server actions.
- Server-rendered + dynamic pages (DB-free build: `force-dynamic`).

## Tech Stack

- Next.js 16.3 (Turbopack), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Prisma 7 (driver adapter, `@prisma/adapter-pg`) + Neon PostgreSQL
- Vercel Blob for image storage
- Auth with `jose` + `bcryptjs`, validation with `zod` v4 + `react-hook-form`

## Getting Started

Requirements: Node 20+, npm.

```bash
npm install
```

Copy the environment template and fill it in:

```bash
cp .env.example .env
```

Required variables (see `.env.example` for details):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection string (runtime) — Neon `-pooler` host |
| `DIRECT_URL` | Direct connection string (Prisma CLI / migrations / seed) |
| `AUTH_SECRET` | Signing secret for the admin session JWT — `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Your public base URL (canonical/OG/sitemap) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin account inserted by the seed |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (image uploads) — optional for local dev |

Set up the database (`DIRECT_URL` must point at a real Neon database):

```bash
npx prisma migrate dev
npm run db:seed      # categories, settings, admin user, ~29 sample products
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin (login with `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

> The production build does not touch the database (`next build` stays green before a DB is configured), but all data-driven pages — including the home page — need a seeded database at runtime.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Run the seed script |
| `npm run db:studio` | Open Prisma Studio |

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js).
2. Create a Neon Postgres database and a Vercel Blob store; copy the connection strings/tokens.
3. Set all variables from `.env.example` as Environment Variables in Vercel (use the pooled `DATABASE_URL` for runtime, `DIRECT_URL` for the CLI/migrations).
4. In a local terminal with the same env vars, run `npm run db:deploy && npm run db:seed` once to create and fill the schema, or use a Vercel Postgres/Neon integration so the schema is created by the first `build` step.
5. Deploy. Anything that needs the DB (seed data, Blob token, `AUTH_SECRET`) must be configured before a production visit.

Notes:

- **Neon**: `DATABASE_URL` should use the `-pooler` host (connection pooling) for the app runtime; `DIRECT_URL` is the plain host used by Prisma CLI and migrations.
- **Storage**: real photos are uploaded to Vercel Blob. Without a `BLOB_READ_WRITE_TOKEN`, local dev saves uploads to `public/uploads/` (gitignored) instead, so image uploads work out of the box. On Vercel: unlinked
  `BLOB_READ_WRITE_TOKEN` make the upload endpoint fail until the store is connected. Set it up via
  **Vercel Dashboard → Storage → Create → Blob**, connect it to your project (this auto-injects the token for
  deployed environments), and copy the same token from **Storage → Blob → Settings** into your local `.env` if you
  want to upload from a non-Vercel server. The seed product images use `picsum.photos` URLs, which are placeholders only.

## Project Structure

```
app/
  (public)/            # home + shared public layout (navbar/footer)
  products/            # listing + detail
  category/[slug]/     # category listing
  about/ contact/      # static pages
  admin/               # login + dashboard (products, categories, settings)
  api/upload/          # Vercel Blob upload endpoint
  sitemap.ts robots.ts # SEO
components/
  ui/                  # shadcn/ui primitives
  layout/              # navbar, footer
  products/            # grid, filters, gallery, contact buttons, pagination
  admin/               # forms, tables, image uploader, dialogs
lib/
  actions/admin.ts     # server actions (CRUD, auth, settings)
  data.ts site.ts      # data access
  auth.ts validations/ # auth helpers + zod v4 schemas
proxy.ts               # middleware (auth + security headers)
prisma/                # schema, migrations, seed
```

## Admin

- URL: `/admin` (dashboard), `/admin/login` (sign in).
- Public routes are cookie-protected: `proxy.ts` verifies the `admin_session` JWT and redirects unauthenticated visitors to the login page; `assertAdmin()` re-checks every server action.
- The first admin is created by the seed script. Change the password from **Тохиргоо** after your first login.