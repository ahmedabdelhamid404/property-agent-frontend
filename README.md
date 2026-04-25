# Property-Agent — Frontend

Broker + admin frontend for [Property-Agent](https://github.com/AbdelrahmanSaeed146/Property-Agent-Backend),
the multi-tenant SaaS where Egyptian real-estate brokers connect their inventory
to an AI WhatsApp bot. RTL Arabic-first, "Editorial Mercantile" aesthetic — sandstone
ledger meets contemporary fintech.

## Stack

- **Next.js 16** + React 19 (App Router)
- **TypeScript 5**, **Tailwind CSS 4**
- **react-hook-form** + **zod** for forms
- **sonner** for toasts
- **Amiri** + **EB Garamond** + **Markazi Text** via `next/font/google`

## Pages

| Route | Auth | Purpose |
|---|---|---|
| `/` | Public | Landing — masthead, three-step explainer, CTA |
| `/signup` | Public | Broker self-signup; returns API key + magic code |
| `/dashboard` | `X-Tenant-Key` (localStorage) | Stats, leads table, settings |
| `/admin` | `X-Admin-Key` (localStorage) | Tenants list + toggle, platform stats, health, failed notifications |

## Local dev

```bash
cp .env.local.example .env.local
# edit if you point at a different backend
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

All routes are static-first (prerendered); API calls happen client-side
against `process.env.NEXT_PUBLIC_API_BASE_URL`.

## Configuration

Single env var:

```
NEXT_PUBLIC_API_BASE_URL=https://property-agent-backend.onrender.com
```

Set on Vercel (or any host) under **Environment Variables**.

## Deploy to Vercel

1. Push this repo to GitHub.
2. **vercel.com → New Project → Import**.
3. Vercel auto-detects Next.js. Set the env var above. Click Deploy.
4. The frontend hits the Render-hosted backend (CORS already permits any origin).

## Architecture notes

- **All-serif** type stack on purpose — distinguishes the broker desk from
  generic SaaS UIs. The trade-off is fewer monospace fallbacks; we use
  `font-mono` only for technical strings (API keys, magic codes, phone numbers).
- **RTL by default** at the `<html dir="rtl">` level. English blocks
  (`dir="ltr" lang="en"`) opt back into LTR locally.
- **No auth provider** — the frontend stores `X-Tenant-Key` and `X-Admin-Key`
  in `localStorage`. Sign-out clears them. This is intentionally simple for
  v1; a session/JWT layer can drop in later.
- **API client** in `lib/api.ts` exposes typed `apiPublic` / `apiBroker` /
  `apiAdmin` namespaces. Each call attaches the right header automatically.

## File map

```
app/
  page.tsx                       Landing
  signup/page.tsx                Signup form + success deed
  dashboard/page.tsx             Tabs shell
  dashboard/_sections/
    StatsSection.tsx             Stat cards + recent activity
    LeadsSection.tsx             Paginated leads table + status updates
    SettingsSection.tsx          Profile form + magic-link card
  admin/page.tsx                 Admin gate (X-Admin-Key prompt)
  admin/_components/
    AdminDashboard.tsx           Health + tenants + failed notifications
  layout.tsx                     RTL root + Toaster
  globals.css                    Sandstone tokens + editorial primitives

components/
  Button, Input, Select          Form primitives
  Badge                          Status pills (subtle, outlined)
  Skeleton, EmptyState           Loading + empty states
  StatCard, Tabs                 Composite UI
  Logo, SiteHeader               Top chrome

lib/
  api.ts                         Typed fetch wrappers
  storage.ts                     localStorage helpers
  utils.ts                       Formatters (date, phone, number, %, copy)
```
