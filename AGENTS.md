# Indicoder Bridge — Project Context for AI Coding Agent

## What this project is

This is a **second, independent instance of OpenAlgo** (open-source algo trading
platform, Python/Flask backend + HTML/JS frontend), running locally at
`D:\Indicoder\Indicoder bridge`, separate from another OpenAlgo instance
elsewhere on this machine. Broker: AliceBlue. Purpose: rebrand this instance
as **"Indicoder"** and extend it with custom features on top of the existing
OpenAlgo feature set — this is NOT a from-scratch build, it's a fork-and-extend
of a working, production-grade codebase.

## Hard constraint — read this before touching any code

**Do not modify core backend architecture.** This includes:
- Broker abstraction / plugin system (`broker/` directory and its adapters)
- Authentication flow, session handling, auth token logic
- Database schema and models (SQLite tables, SQLAlchemy models)
- Core order routing, order management, and execution logic
- WebSocket server / ZMQ message bus internals
- API route contracts (`/api/v1/...` endpoints) — do not rename, remove, or
  change the request/response shape of existing endpoints

The only backend changes allowed are ones required to support new
*additive* features (see Phase 3 below) — and even then, prefer adding new
files/routes over editing existing core files. If a change to core logic
seems unavoidable, stop and flag it for confirmation before proceeding —
don't just make it.

Frontend templates, static assets (CSS/JS/images), branding strings, and
page-level UI composition are all safe and expected to change freely.

## Priority order — work through phases in this order, not in parallel

### Phase 1 (current priority): Rebranding
- Find every occurrence of the "OpenAlgo" name/logo across:
  - `templates/` (HTML — page titles, headers, footers, nav bars)
  - `static/` (logo images, favicons, any branded assets)
  - Any config file that sets an app display name
- Replace with **"Indicoder"** branding: name, logo, favicon, color accents
  as appropriate.
- Do a full grep pass first and produce a list of every file touched before
  making changes, so the scope is visible up front.

### Phase 2: UI design refresh
- Refresh visual design/theme (colors, layout polish, typography) on top of
  the rebranded shell.
- Do not restructure page navigation or remove existing feature pages
  (Dashboard, Orderbook, Tradebook, Positions, Platforms, Strategies, Logs,
  Tools) — visual refresh only, not information-architecture changes.

### Phase 3: New features (build only after Phase 1 and 2 are done)
These are additive features, built as new modules/pages that consume the
existing OpenAlgo API rather than modifying it:

1. **Option Buyer Radar** — a bias/signal dashboard for Indian index option
   buying, modeled on a related existing project ("Option Buyer Edge" /
   "OptiPulse" bias engine). Six-factor weighted composite scoring:
   Spot vs Max Pain (25%), Aggressive Writer Short Covering (20%),
   PCR (20%), ATM Gamma Surge (15%), Theta Decay Hazard (10%),
   Institutional OI Flow Imbalance (10%). Known OpenAlgo API quirks to
   account for: `optionchain` endpoint requires `underlying` param (not
   `symbol`), and expiry dates need `DDMMMYY` format while
   `/api/v1/expiry` returns `DD-MMM-YY` — conversion needed.
2. **RMS (Risk Management System) features:**
   - Daily profit target and stop-loss level enforcement (auto-flag or
     auto-flatten positions once a configured daily P&L threshold is hit)
   - Kill switch — a manual/automatic emergency stop that immediately halts
     all strategy activity and optionally squares off open positions

Do not start Phase 3 work until explicitly told to — Phase 1 (branding) is
the current task.

## Working style
- Confirm scope (list of files to change) before making bulk edits.
- Keep changes additive and reversible — this instance will keep evolving.
- If something looks like it belongs to core backend architecture and a
  requested feature seems to require touching it, pause and ask rather than
  proceeding.
