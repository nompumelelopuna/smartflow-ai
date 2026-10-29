# SmartFlow AI (v3)

Business operations app: supplier orders, deliveries, exception reports, supplier management, AI assistant.
Stack: React + TypeScript + Tailwind (client/), Node + Express + SQLite/better-sqlite3 (server/). All money is ZAR.

## Run (Windows)
Needs Node.js 20 LTS+ (nodejs.org).

    npm run setup
    npm run dev

Open http://localhost:5173 and **register**: the first account becomes admin.
Sample data is fictional and seeded on first start.

**Upgrading from v1:** your existing database is migrated automatically, but old sample prices stay as they were.
To get the new ZAR sample data, stop the app and delete the `server\data` folder, then start again.

## Features
- Auth: register/login, bcrypt-hashed passwords (min 10 chars), JWT in httpOnly SameSite=Strict cookie, login rate limiting, all /api routes protected.
- Orders: create/edit/delete/search, business unit, placed flag, tracking, POD.
- Suppliers: create/edit/list; delete is admin-only and blocked if orders exist.
- Reports (rules in `server/src/services/reports.ts` - **assumed definitions, edit to match your process**):
  - Not Placed: status pending and not placed with supplier
  - No Tracking: placed, open order, no tracking number
  - No Business Unit: non-cancelled order with no business unit
  - Over ETA: open order with ETA before today
  - No POD: delivered order with POD not received
- CSV exports: orders, suppliers, and each report (formula-injection safe, Excel-friendly UTF-8).
- AI assistant: **demo mode** by default (keyword rules over your data, no external calls). Live mode uses the Anthropic API
  if `ANTHROPIC_API_KEY` is set in the server environment (PowerShell: `$env:ANTHROPIC_API_KEY="..."` before `npm run dev`).
  Live mode sends a compact snapshot of order data to Anthropic.

## Testing and production
See **TESTING.md** for exact Windows commands (`npm run typecheck`, `npm test`, `npm run build`, `npm run start:prod`)
and an honest list of which tests were executed versus not run.
`npm run build` then `npm run start:prod` serves the built app and API together on http://localhost:3001.
Set `ALLOW_REGISTRATION=false` to close registration after the first admin account.

## Structure
server/src: db.ts, seed.ts, routes/ (auth, orders, suppliers, reports, assistant), services/ (auth, orders, reports, csv, assistant)
client/src: pages/, components/, api.ts, types.ts

## Production notes
Set JWT_SECRET, run behind HTTPS (cookies become Secure when NODE_ENV=production), add tests, password reset, and
set ALLOW_REGISTRATION=false once your team has accounts.
