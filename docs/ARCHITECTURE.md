# Architecture

> How LendLoop is layered and how requests flow end to end.

## Layering

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js UI                                                  │
│  routes ─► features (components/hooks) ─► convex api        │
└──────────────────────────┬──────────────────────────────────┘
                           │  query/mutation/action
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex handlers  (convex/*.ts)                              │
│  thin: validate input → build (ctx, actor) → call service    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  services/  — use cases: ToolService, LoanService, ...      │
│  constructed with (ctx, actor); orchestrate rules + repos   │
└─────────────┬───────────────────────────────┬───────────────┘
              ▼                               ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│  repositories/          │        │  domain/  (pure TS)      │
│  ONLY layer using ctx.db│        │  LoanPolicy, DateRange,   │
│                         │        │  ToolPolicy, Clock, ...   │
└─────────────────────────┘        └──────────────────────────┘
              │
              ▼
        ┌─────────────────────────────────────────┐
        │  integrations/  (only layer using fetch)│
        │  N8nWebhookClient, payloads, Notifier    │
        └──────────────┬──────────────────────────┘
                       ▼
                ┌──────────────┐
                │  security/    │
                │  HmacSigner   │
                └──────┬───────┘
                       ▼
                    ┌──────┐
                    │  n8n │
                    └──────┘
```

### Dependency rules (never reverse)

- `domain/` imports nothing from Convex.
- Only `repositories/` call `ctx.db`.
- Only `integrations/` call `fetch`.
- UI contains no business rules — it calls hooks; hooks call Convex.
- `services` → `repositories` → `ctx.db` and `services` → `domain`.

## Request notification flow

```
Borrower clicks "Request" in UI
   │
   ▼
LoanService.request()
   ├─ validates date range (DateRange) + overlap check (LoanRepository)
   ├─ auto-declines any overlapping pending requests for the same tool
   ├─ inserts the loan with status = "pending"
   └─ AutomationService.enqueueEvent("loan.requested")
         ├─ writes webhookOutbox row
         └─ N8nWebhookClient posts signed payload to N8N_WEBHOOK_URL
               (HMAC-SHA256 signature + timestamp)
                          │
                          ▼
n8n: request-notification workflow
   ├─ verifies HMAC signature (crypto timingSafeEqual)
   ├─ routes by event type → notify lender (email/mock/slack)
   └─ optionally POSTs back to Convex /reminder-status (auth + idempotent)
```

## Overdue reminder flow

```
n8n: overdue-reminders workflow (scheduled, e.g. daily 09:00)
   ├─ GET Convex /overdue-loans (authed with N8N_API_SECRET)
   │     Convex returns minimized list: loanId, tool name, borrower name, due date
   ├─ for each overdue loan → send reminder
   └─ POST Convex /reminder-status (auth + idempotency key)
         ├─ records "reminder" automationEvent (idempotent — same key twice = one row)
         └─ optionally updates loan.overdueNotifiedAt
```

## Idempotency

- n8n may retry; every callback carries an `idempotencyKey`.
- `AutomationEventRepository` looks up by key first; if present, returns the existing record instead of duplicating.
- See `__tests__/idempotency.test.ts`.

## Outbox

- `webhookOutbox` table holds pending deliveries. `AutomationService.enqueueEvent` inserts a row; `deliverWebhook` action signs + posts + marks delivered.
- `crons.ts` optionally sweeps stuck/failed rows for retry.
