# SmartFlow AI: testing guide (v3)

Run these in **PowerShell** from the project folder (the one containing `package.json`), e.g. `cd C:\Projects\smartflow-ai`.
Requires Node.js 20 LTS or newer.

## Commands

```powershell
node --version          # expect v20 or higher
npm run setup           # installs root, server and client dependencies (needs internet)
npm run typecheck       # TypeScript check for server and client
npm test                # server tests (vitest + supertest) then client tests (vitest + jsdom)
npm run build           # server typecheck + client production build into client\dist
npm run start:prod      # serves API + built app at http://localhost:3001
npm run dev             # development mode: app at http://localhost:5173, API at :3001
```

Run one side only:

```powershell
npm --prefix server test
npm --prefix client test
npm --prefix server run typecheck
npm --prefix client run typecheck
```

`npm run build` must be run before `npm run start:prod`. Tests use an in-memory database and never touch `server\data`
or any external API. The AI assistant tests run in demo mode only (no paid API is called).

Optional: `$env:ALLOW_REGISTRATION="false"` before `npm run start:prod` closes registration after the first (admin) account.

## What was ACTUALLY EXECUTED (in my sandbox, Claude's Linux environment)

My sandbox has no internet, so I could not `npm install`. I ran a subset of the test files against **real SQLite**
(via Node's built-in `node:sqlite`) with two small stand-ins that exist only in my sandbox and are NOT in the zip:
a `better-sqlite3` adapter and a minimal `vitest` stand-in (same `describe/it/expect` calls). Result: **24 passed, 0 failed.**

| File | Tests | Result |
|---|---|---|
| server/test/csv.test.ts (escaping, formula-injection guard, BOM/CRLF, headers) | 5 | passed |
| server/test/orders-service.test.ts (create/update/delete/filter/validation) | 7 | passed |
| server/test/reports-service.test.ts (all five reports' rules) | 6 | passed |
| server/test/seed-assistant.test.ts (seed data, every report non-empty, demo assistant, ZAR) | 4 | passed |
| client/src/format.test.ts (ZAR formatting) | 2 | passed |

Running them found and fixed one real bug: the seed script assumed supplier IDs 1-5, which crashes with a foreign-key
error if suppliers were ever deleted before a restart. It now uses the actual inserted IDs.

I also ran a partial `tsc` pass. Errors caused only by packages missing in my sandbox were filtered out; no other
errors remained. This is **not** a full type-check.

## Written but NOT executed (could not run here; please run them)

| Area | Tests | Why not run |
|---|---|---|
| server/test/auth.test.ts (register, first-user admin, cookie flags, login, 401s, logout, forged token) | 7 | needs express, supertest, bcryptjs, jsonwebtoken |
| server/test/orders-api.test.ts (CRUD, validation, SQL-looking input, CSV export) | 5 | needs express + supertest |
| server/test/suppliers-api.test.ts (CRUD, duplicates, delete rules, admin-only, CSV) | 4 | needs express + supertest |
| server/test/reports-api.test.ts (5 reports JSON + CSV, summary, assistant demo) | 3 | needs express + supertest |
| client/src/api.test.ts | 4 | needs vitest |
| client/src/components/StatCard.test.tsx, OrdersTable.test.tsx | 5 | needs jsdom + Testing Library |
| client/src/pages/Login.test.tsx | 3 | needs jsdom + Testing Library |

Also NOT verified: `npm run setup` (including whether `better-sqlite3` installs on your machine), real `npm run typecheck`,
`npm run build`, `npm run start:prod` (static serving and SPA fallback), login rate limiting, the live AI mode
(never called; it would use the paid Anthropic API), and how the screens look in a browser.

## If something fails

Copy the first error from PowerShell and send it back. Typical causes: Node older than v20; `better-sqlite3` needing
build tools (install the latest Node LTS, which normally ships a prebuilt binary); a test written against my
assumptions that needs a small adjustment.
