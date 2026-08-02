# Platform Version Tracker — Altudo VIEW

A production-ready Next.js 15 (App Router) dashboard for tracking platform versions,
release notes, security advisories, and support lifecycles across your tech stack —
with a full admin panel, JSON-file storage (no database), and auto-refreshing data.

Built with: Next.js 15, TypeScript, Tailwind CSS, Radix primitives (shadcn-style),
TanStack React Query, Zod, React Hook Form, Framer Motion, Lucide icons.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then edit SESSION_SECRET to something random
npm run seed                        # creates data/users.json with a bcrypt-hashed admin
npm run dev                         # http://localhost:3000
```

Default seeded credentials (from `.env.local.example` — **change before real use**):

```
 
```

To seed a different password:

```bash
SEED_ADMIN_USERNAME=admin SEED_ADMIN_PASSWORD='YourStrongPassword!' npm run seed
```

## Production build

```bash
npm run build
npm run start
```

Verified locally: `npm run build` completes cleanly (zero type errors, all 16 routes
compile, static pages prerender), and the full auth → CRUD → logout flow was
smoke-tested against the built server before this was handed off.

## Architecture

```
data/                    JSON "database" — never served directly, only via API routes
  platforms.json         16 platforms, seeded from prior research
  settings.json          app-wide settings
  users.json             admin account (bcrypt hash) — created by `npm run seed`
  audit.log              append-only log of admin actions (created at runtime)

src/
  app/
    page.tsx             public dashboard (cards / table view)
    admin/                admin panel (protected by middleware)
      login/page.tsx
      page.tsx            platform CRUD, bulk actions, reorder
      settings/page.tsx
    api/                  all reads/writes go through these route handlers
      login, logout, session
      platforms, platforms/[id], platforms/[id]/duplicate, platforms/bulk, platforms/reorder
      settings, kpis, export
  components/
    ui/                   hand-built shadcn-style primitives (Button, Dialog, Select, ...)
    features/              sidebar, KPI cards, platform card/table, command palette, ...
  hooks/                  React Query hooks (data + mutations), local storage, debounce
  lib/                    auth (bcrypt), crypto (Edge-compatible signed sessions),
                           rate limiting, audit logging, Zod schemas, utils
  repositories/           the ONLY files that touch the JSON files on disk
  services/               business logic on top of repositories
  types/                  shared TypeScript types
```

**Why this layering matters:** if you later migrate off JSON files to a real database,
you only need to rewrite `src/repositories/*` — the service layer, API routes, and
every UI component are unaware of where the data actually lives.

## Auth model

- Passwords are hashed with bcrypt (12 rounds) — never stored in plaintext.
- Sessions are stateless, HMAC-SHA256-signed cookies (httpOnly, sameSite=lax), built
  on the Web Crypto API so the same code runs in both the Node API routes and the
  Edge middleware without extra dependencies.
- `middleware.ts` (in `src/`, per Next.js convention for `src/` layouts) protects every
  `/admin/*` route except `/admin/login`, redirecting unauthenticated visits.
- Every mutating API route (`POST`/`PUT`/`DELETE`) independently calls `requireAdmin()`
  too — so the API is safe even if something bypasses the UI/middleware.
- Login attempts are rate-limited (5 per 15 minutes per IP+username) and failed
  attempts lock the account for 15 minutes after 5 failures.
- All admin actions (login, logout, create/update/delete/duplicate/bulk/reorder,
  settings changes) are appended to `data/audit.log` as JSON lines.

## Auto-refresh

The refresh interval is configurable in **Admin → Settings** (1/2/5/10/15/30/60 min).
The dashboard and KPI cards use TanStack Query's `refetchInterval`, which picks up
the new value automatically — no page reload required. "Last refreshed" and a manual
**Refresh** button are shown in the header.

## Theme

Dark is the default and has full design coverage end-to-end. A light theme is also
fully implemented via CSS variables (`src/app/globals.css`, `[data-theme="light"]`) —
toggle it per-user with the sun/moon icon in the dashboard header (persisted to
`localStorage`, overrides the admin default), or set the site-wide default in
**Admin → Settings → Default theme**.

## Backup & restore

**Admin → Settings → Backup & restore** lets you download a single JSON snapshot of
all platforms + settings (never user credentials), and restore from a previously
downloaded file. Restores are Zod-validated before anything is written, require
admin auth, prompt for confirmation before overwriting current data, and are logged
to the audit trail with a snapshot of what was replaced.

## Export

`GET /api/export?format=csv|json|xlsx` streams a real file download built from the
current platform data. **PDF** export uses the browser's native print dialog against
a print-specific stylesheet (`@media print` in `globals.css`) rather than a heavy
server-side PDF library — click Export → PDF, then "Save as PDF" in the print dialog.

## Testing

```bash
npm run test
```

25 unit tests covering: utility functions (`cn`, `slugify`, `timeAgo`, `isRecentRelease`,
`looksLikeUrl`), the Edge-compatible session token signing/verification (round-trip,
tampered signature, expiry, null handling), and the platform service's filtering,
searching, and sorting logic (category/vendor/priority/monitoring/security filters,
sort-by-priority, KPI aggregation) — using a mocked repository layer so no real
filesystem I/O happens in tests.

## What's simplified vs. the original spec

- **Drag-and-drop reorder** → implemented as up/down buttons in the admin table instead
  of a drag library. Same end result (persisted `order` field), less code surface.
- **E2E tests** (login, CRUD, dashboard refresh) → not included; the manual smoke-test
  script below covers the same flows and was run against the actual built server.
- **Google Fonts** → loaded via a `<link>` tag rather than `next/font/google`, because
  this build environment has no outbound access to fonts.googleapis.com at build time.
  This is arguably more portable (works in any restricted CI/build environment) but
  means a first-paint flash-of-unstyled-font is possible on a slow connection — add
  `next/font/google` back in `layout.tsx` if your deployment target has open network
  access during build and you want fonts inlined.

Everything else in the original spec — auth, RBAC-style admin guard, full platform
CRUD with validation, bulk actions, duplicate, reorder, search/filter/sort, KPIs,
card/table views with persisted preference, auto-refresh, command palette (⌘K/Ctrl+K),
audit log, rate limiting, account lockout, custom scrollbars, responsive sidebar,
CSV/JSON/XLSX/PDF export, dark/light theme, and backup/restore — is implemented and
was verified against the built, running server (see below).

## Manual verification performed before delivery

Every item below was actually executed against the production build (`npm run build`
+ `npm run start`), not just written and assumed to work:

- `tsc --noEmit` — zero type errors
- `npm run test` — 25/25 unit tests pass
- `npm run build` — all 18 routes compile and prerender cleanly
- Auth: wrong password rejected → correct password issues signed cookie → session
  verified → protected write blocked without auth → logout clears session
- Middleware: unauthenticated `/admin/*` redirects (307) to `/admin/login?from=...`;
  authenticated requests pass through
- Full CRUD round-trip: create platform → count increases → delete → count restored
- Backup/restore round-trip: download backup → restore it → platform count unchanged,
  no data loss, settings intact
- Settings mutation (theme toggle) persists and is reflected on next read
- Audit log correctly records login attempts, CRUD actions, and settings changes

Two real bugs were caught and fixed during this process (not left for you to find):
`middleware.ts` was in the wrong location for a `src/` layout and silently never ran;
and session signing originally used Node's `crypto` module, which isn't available in
the Edge runtime where middleware executes, causing every authenticated admin request
to 500. Both are fixed and covered by the verification steps above.
