# LendLoop

A neighborhood tool-lending app. Lenders list tools, borrowers request them for a date range, and n8n automation handles request notifications and overdue reminders — all secured with HMAC-signed webhooks.

> Built on **Next.js (App Router)** + **Convex** + **Clerk** + **n8n**.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in real values
cp .env.example .env.local

# 3. Start Convex dev (creates the deployment + generates _generated/)
npx convex dev

# 4. Start the Next.js dev server
npm run dev
```

### Bring up n8n (optional, for automation)

```bash
cp .env.example .env   # fill N8N_ENCRYPTION_KEY
docker compose up -d
# Open http://localhost:5678 and import n8n/workflows/*.json
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` across the repo |
| `npm run test` | Vitest (pure domain + security + payload tests) |
| `npm run test:watch` | Vitest in watch mode |

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Next.js | Convex deployment URL (public) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Next.js | Clerk public key (public) |
| `CLERK_SECRET_KEY` | Next.js server | Clerk server key |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex env | JWT validation |
| `ADMIN_EMAILS` | Convex env | Bootstrap first admin(s) |
| `N8N_WEBHOOK_URL` | Convex env | Request-notification webhook |
| `N8N_SIGNING_SECRET` | Convex env + n8n credential | HMAC Convex → n8n |
| `N8N_API_SECRET` | Convex env + n8n credential | n8n → Convex endpoints auth |
| `N8N_ENCRYPTION_KEY` | docker-compose env | n8n credential encryption |
| `NODE_FUNCTION_ALLOW_BUILTIN` | docker-compose env | `crypto` for HMAC verify in n8n |

## Architecture

```
UI (Next.js routes) ─► Convex queries/mutations ─► services ─► repositories ─► ctx.db
                              │                        │
                              │                        └─► domain/ (pure rules)
                              └─► integrations ─► security (HMAC) ─► n8n
```

- `domain/` — pure TypeScript, no Convex imports. Holds the loan state machine, date-range overlap, and policies. Fully unit-tested.
- `repositories/` — the **only** layer that touches `ctx.db`.
- `services/` — use cases that orchestrate repositories + domain rules.
- `security/` — access control, HMAC signing/verification, secret loading.
- `integrations/` — calls to the outside world (n8n). Data minimization happens here.
- `handlers` (top-level `convex/*.ts`) — thin; validate input, build `(ctx, actor)`, call a service.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data-flow diagrams.

## Security

- Every Convex handler checks identity + authorization before mutating (see `security/AccessControl.ts`).
- Webhooks to n8n are HMAC-signed with a timestamp window to prevent replay.
- n8n calls back to Convex over authenticated, idempotent endpoints.
- We send the minimum data needed in every payload (data minimization — `integrations/payloads.ts`).
- `scripts/check-secrets.sh` scans the repo before push.

See [docs/SECURITY.md](docs/SECURITY.md) for the threat model and signing details.

## Data minimization

- Public tool list exposes only `{ name, category }` — never owner or location.
- Notification payloads include only what's needed to act: loan id, tool name, borrower/lender display name, and the relevant dates.
- `payloads.test.ts` asserts that no extra fields leak through.

## Project layout

See the full tree and dependency rules in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the `CODE_STRUCTURE` spec.
