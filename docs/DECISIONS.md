# Decisions

> Every decision `[DEC-##]` made while building LendLoop, with the reason.

## [DEC-01] Convex for backend + database

**Decision:** Use Convex for the data layer and server functions.

**Reason:** A neighborhood lending app has modest scale and strongly relational,
event-driven behavior (status changes, webhooks). Convex gives typed
queries/mutations/actions, a schema, and an HTTP layer for external (n8n)
callbacks without standing up a separate server.

## [DEC-02] Clerk for authentication

**Decision:** Clerk handles sign-in/sign-up; Convex validates Clerk JWTs.

**Reason:** Clerk removes the burden of building and securing auth flows
(sessions, password reset, OAuth). Convex verifies the JWT issuer using
`CLERK_JWT_ISSUER_DOMAIN`, so identity is trustworthy at the edge.

## [DEC-03] n8n for automation, self-hosted via docker-compose

**Decision:** Request notifications and overdue reminders run in n8n, not in
Convex crons.

**Reason:** Notifications are pluggable (email today, mock/slack tomorrow).
n8n isolates the integration so the delivery channel can change without
touching the core. Self-hosting keeps data local; pinning the image version
keeps behavior reproducible.

## [DEC-04] HMAC-signed webhooks both directions

**Decision:** Convex → n8n requests are HMAC-signed; n8n → Convex callbacks
carry a shared API secret.

**Reason:** Webhook URLs are public endpoints. An attacker who discovers the
URL shouldn't be able to forge an overdue reminder. A signature + timestamp
window (replay protection) on outbound, and a shared secret on inbound,
gives us integrity without a heavier mTLS setup.

## [DEC-05] Data minimization in payloads

**Decision:** Notification payloads contain only what's needed to act.

**Reason:** Tools can be personally identifiable (an address-adjacent item).
We never send owner location to n8n — only display names, tool name, dates.
`payloads.test.ts` asserts the shape, so a careless field addition is caught.

## [DEC-06] Pure domain layer, no Convex imports

**Decision:** `domain/` is plain TypeScript with no `convex/values` or
`ctx.db` usage.

**Reason:** The loan state machine, date-range overlap, and policy rules are
the riskiest logic. Keeping them pure makes them fast to unit-test in
isolation and easy to reason about. `Clock` is injected so tests control "today".

## [DEC-07] Repositories are the only layer touching ctx.db

**Decision:** All `ctx.db` access goes through `repositories/`.

**Reason:** A single seam for data access means queries are consistent,
testable, and replaceable. Services stay focused on orchestration.

## [DEC-08] Thin handlers, fat services

**Decision:** Top-level `convex/*.ts` handlers validate input, build a
service with `(ctx, actor)`, and delegate.

**Reason:** Handlers are the Convex boundary; they should stay boring.
Putting logic in services keeps it reusable and testable.

## [DEC-09] Admin bootstrap via ADMIN_EMAILS

**Decision:** The first admin(s) are seeded from `ADMIN_EMAILS` env var
during `syncCurrentUser`.

**Reason:** No admin UI can be reached until an admin exists, so we need a
trusted bootstrap mechanism. Env vars are set by the operator and auditable.

## [DEC-10] Overlap auto-decline on new request

**Decision:** When a borrower requests a tool for a range that overlaps an
existing *pending* request, the conflicting pending request is auto-declined.

**Reason:** A lender can only honor one loan at a time. Rather than leave
stale pending requests, we resolve conflicts deterministically when a new,
non-overlapping request is accepted — keeping the lender's queue clean.

## [DEC-11] Idempotent reminder recording

**Decision:** Reminder callbacks are deduplicated by `idempotencyKey`.

**Reason:** n8n retries on transient failure. Without idempotency a user
could get duplicate "you're overdue" records and confusing activity. The
key is stable per (loan, reminderDate).

## [DEC-12] Public tool list returns only { name, category }

**Decision:** Anonymous users see tool names and categories, nothing else.

**Reason:** Browsing should be possible without an account, but exposing
owners or location to anonymous users is a privacy risk. The UI guard is
cosmetic; the real guard is the query returning only those fields.
`publicQuery.test.ts` enforces this.
