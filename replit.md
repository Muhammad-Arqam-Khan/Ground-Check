# GroundCheck

A live location trust-verification map for HackSummer'26 ("Trust Me"). Users click anywhere on a Mapbox map to file a report, the app cross-checks it against real OpenStreetMap data, scores it for trustworthiness, and renders the result as both a color-coded marker and a native Mapbox heatmap contribution. Every report is SHA-256 chained, sybil-resistant, and impossible-travel-checked.

## Run & Operate

- `pnpm --filter @workspace/groundcheck run dev` — run the frontend (port from $PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, wouter
- Map: Mapbox GL JS v3 (dark-v11 style, GeoJSON heatmap + markers)
- OSM: Overpass API (overpass-api.de, public, no key required)
- Security: Web Crypto SHA-256, sybil defense, impossible-travel check
- State: All in-memory (no backend/DB for this MVP)

## Where things live

- `artifacts/groundcheck/src/App.tsx` — main orchestrator (map init, marker mgmt, vote handling)
- `artifacts/groundcheck/src/lib/types.ts` — Report, ChainLink, OsmResult data model
- `artifacts/groundcheck/src/lib/scoring.ts` — trust scoring engine (osmPoints + communityPoints + basePoints)
- `artifacts/groundcheck/src/lib/security.ts` — sybil defense + impossible-travel check
- `artifacts/groundcheck/src/lib/chain.ts` — SHA-256 hash chain via Web Crypto API
- `artifacts/groundcheck/src/lib/overpass.ts` — debounced Overpass API client
- `artifacts/groundcheck/src/lib/store.ts` — in-memory report store + heatmap GeoJSON builder
- `artifacts/groundcheck/src/components/` — TokenDialog, ReportPanel, ChainStatus, ReportPopup, Legend

## Architecture decisions

- Mapbox GL JS v3 loaded as npm package (not CDN) so Vite bundles it cleanly
- `createRoot` per popup lets React components live inside Mapbox Popup DOM nodes
- `groundcheck:vote` custom DOM events bridge Mapbox popup isolation back to React state
- Heatmap uses native Mapbox `heatmap` layer with `heatmap-weight` and `heatmap-radius` driven by GeoJSON properties, not custom canvas rendering
- No backend required — all state lives in sessionStorage (token) and memory (reports)

## Product

GroundCheck lets users drop reports on a live Mapbox map (centered on Islamabad), cross-check them against OSM data via the Overpass API, and see their trust score rendered as a color-coded marker (green ≥70, amber 40–69, red <40) plus a heatmap contribution. Reports are upvotable/downvotable, protected by sybil down-weighting and impossible-travel detection, and auditable via a tamper-evident SHA-256 hash chain.

## Environment variables

Copy `.env.example` to `.env` and fill in real values — never commit `.env` (it is gitignored).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes (API server) | PostgreSQL connection string for `@workspace/db` |
| `PORT` | Yes (API server) | HTTP port — injected automatically by Replit |
| `SESSION_SECRET` | Yes (API server) | Long random string used to sign Express sessions |
| `LOG_LEVEL` | No | Pino log level (`info` default) |
| `NODE_ENV` | No | `development` or `production` |

## User preferences

_None yet._

## Gotchas

- Mapbox token must start with `pk.` — stored in sessionStorage so it survives HMR but is lost on browser tab close
- Overpass API is public; queries are debounced 300ms to avoid rate-limiting during rapid slider dragging
- The `mapbox-gl/dist/mapbox-gl.css` import must come BEFORE `@import 'tailwindcss'` in index.css to avoid PostCSS ordering issues
- `heatmap-radius` is in pixels (not meters) by default in Mapbox GL — the current implementation passes radiusMeters directly; for a production version this should be converted based on zoom level
