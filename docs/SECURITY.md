# Security

> Threat notes, signing scheme, secrets handling, and data minimization for LendLoop.

## Threat model

| Threat | Mitigation |
| --- | --- |
| **Forged webhook** to n8n/Convex endpoint | HMAC-SHA256 signature (outbound) + shared API secret (inbound). Verified with constant-time comparison. |
| **Replay** of a captured webhook | Outbound signature includes a timestamp; `HmacSigner.verify` rejects anything older than the window (default 5 min). |
| **Anonymous reading private data** | Public query returns only `{ name, category }`; all mutations require an authenticated Clerk user. |
| **User acting on someone else's data** | `AccessControl.assertOwner` checks resource ownership before every mutating loan/tool operation. |
| **Non-admin using admin features** | `requireAdmin` checks the `role` field; admin routes also guarded in middleware (UX), backend is the real guard. |
| **Secrets in the repo** | `.gitignore` blocks `.env*`; `scripts/check-secrets.sh` greps the repo + n8n JSON pre-push. |
| **Privilege escalation after bootstrap** | Admin role set only during `syncCurrentUser` when email ∈ `ADMIN_EMAILS`; never via a public mutation. |

## Signing scheme (Convex → n8n)

`HmacSigner.sign(payload)` produces a header:

```
X-LendLoop-Signature: t=<unix-ms>,v1=<hex-hmac-sha256>
```

- `payload` = raw request body bytes (the exact JSON string).
- The HMAC is computed over `${timestamp}.${body}`.
- n8n recomputes the same and compares with `crypto.timingSafeEqual`.

### Timestamp window

`verify` rejects signatures whose timestamp is more than `MAX_SKEW_MS`
(default 5 minutes) from the receiver's clock, preventing replay of old
signatures.

## Inbound auth (n8n → Convex)

`http.ts` endpoints (`/overdue-loans`, `/reminder-status`) require an
`X-LendLoop-Api-Secret` header equal to `N8N_API_SECRET`. A missing or
mismatched secret returns `401` without performing any work.

## Secrets handling

- `security/secrets.ts` reads env vars and **throws** if a required one is
  missing, failing loud rather than silently disabling security.
- Secrets never appear in client bundles — none are prefixed with
  `NEXT_PUBLIC_`.
- The n8n encryption key encrypts stored credentials in the n8n container; it
  is provided via docker-compose env, never committed.

## Data minimization

- Public tool browse: `{ name, category }` only.
- Request-notification payload: `loanId`, `toolName`, `event`, `requesterName`,
  relevant dates. No addresses, no emails unless the channel needs them.
- Overdue payload: `loanId`, `toolName`, `borrowerName`, `dueDate`.
- `payloads.test.ts` and `publicQuery.test.ts` assert these shapes so an
  accidental leak fails the build.

## Reporting / next steps for production

See [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md).
