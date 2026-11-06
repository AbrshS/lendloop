# Production Notes

> What I'd change before running LendLoop in production. This is a
> neighborhood-scale demo; the shortcuts below are intentional and called out.

## Secrets & infra

- **Rotate `N8N_SIGNING_SECRET` and `N8N_API_SECRET`.** They're long-lived shared
  secrets. In production, store them in a secrets manager (AWS Secrets Manager,
  Doppler, Vault) and rotate periodically.
- **Don't self-host n8n on the same host.** Run it on managed infra or its own
  node with backups. The docker-compose here is for local dev only.
- **Lock down the n8n UI.** Enable n8n's built-in auth, restrict network access,
  and put it behind a reverse proxy with TLS. The compose file exposes `5678`
  without auth.
- **CSP `unsafe-inline`/`unsafe-eval`.** Next.js dev needs these; tighten in
  production builds with hashed nonces once you move off dev scripts.

## Reliability

- **Outbox retry sweep.** `crons.ts` is a sketch; production needs backoff,
  a max-attempts cap, and alerting when a webhook can't be delivered.
- **Dead-letter for n8n.** The error-workflow alerts on failure, but a real
  system needs a durable dead-letter queue for undeliverable notifications.
- **Rate limiting.** Add per-user request limits on loan creation to prevent
  abuse; Convex doesn't rate-limit by default.

## Data & privacy

- **Store only what you need.** We minimize payloads, but audit the schema for
  any PII you don't actually use (e.g., do you need `name` or just a handle?).
- **Data retention.** Decide how long completed/cancelled loans are kept and
  add a scheduled cleanup. Right now rows live forever.
- **Real email provider.** The Notifier interface is a mock; wire a real
  provider (SES, Postmark) and verify email ownership before sending.
- **Right-to-delete.** Add a path to anonymize/delete a user's data on request.

## Auth

- **Admin bootstrap is env-only.** Move to a proper invite/role management flow
  once more than one operator is involved; env var bootstrapping doesn't scale.
- **JWT issuer rotation.** Clerk can rotate keys; ensure
  `CLERK_JWT_ISSUER_DOMAIN` updates are handled without downtime.

## Testing

- **Domain tests are solid; integration tests are thin.** Add Convex end-to-end
  tests (the convex testing harness) for the full loan lifecycle and webhook
  round-trips before going live.
- **Permission matrix tests run against pure logic.** Mirror them with real
  Convex mutations impersonating different users.

## Observability

- **Structured logging.** Convex logs are basic; pipe to a log aggregator and
  add correlation ids across the Convex → n8n → Convex round trip.
- **Metrics + alerting.** Track webhook delivery success rate, overdue counts,
  and p95 notification latency.
