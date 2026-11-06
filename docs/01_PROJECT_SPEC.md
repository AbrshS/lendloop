# LendLoop: Project Spec (Features + Tech Stack)

> Source of truth for the AI. Every item below is a requirement from the Fluence take-home or a decision needed to satisfy one.
> Do NOT skip items. Do NOT add features that are not listed. If something is ambiguous, pick the option marked **Decision** and state it in the README.
> Tags: **[REQ]** = stated in the assignment. **[DEC]** = my decision to make a requirement concrete. **[BONUS]** = optional, build last.

---

## 1. What we are building

**LendLoop** is a neighborhood tool-lending board. Neighbors list tools they will lend, request to borrow each other's tools for a date range, and get automated notifications and reminders handled by n8n.

- Company name: **LendLoop** [REQ]
- Tagline: "Borrow what you need. Lend what you don't." [REQ]
- Evaluation criteria [REQ]: code structure and clarity, security-minded thinking, UX and practicality, integration design/reliability/error handling (n8n), documentation and reasoning.

---

## 2. Tech stack (fixed, do not substitute)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) [REQ] |
| Language | TypeScript, `strict: true` [REQ] |
| Auth | Clerk [REQ] |
| Data + backend logic | Convex (queries, mutations, actions, HTTP actions, scheduler) [REQ] |
| Automation | n8n, self-hosted via Docker Compose (n8n Cloud acceptable) [REQ] |
| UI | React, Tailwind CSS, shadcn/ui (Radix primitives) [DEC] |
| Validation | Convex validators (`v`) on every function; Zod for client forms [DEC] |
| Forms | react-hook-form + Zod resolver [DEC] |
| Dates | date-fns (store dates as ISO `YYYY-MM-DD` strings for loan ranges) [DEC] |
| Testing | Vitest + `convex-test` for backend rules; Playwright optional [DEC] |
| Lint/format | ESLint (strict TS rules), Prettier [DEC] |
| Package manager | pnpm [DEC] |
| Local infra | `docker-compose.yml` with n8n (+ Postgres for n8n, optional) [REQ: README must cover n8n docker-compose] |
| Notification channel | Logged mock notification is acceptable; email (SMTP/Resend), Slack or Discord is a nice upgrade [REQ] |

Auth bridge: Clerk JWT template for Convex, `convex/auth.config.ts`, `ConvexProviderWithClerk` on the client.

---

## 3. Roles & permission rules [REQ]

Two roles: `admin` and `user`.

| Action | user | admin |
|---|---|---|
| View public tool list (name + category only) | yes (also anonymous) | yes |
| Create a listing | yes | yes |
| Edit own listing | yes | yes |
| Delete own listing | yes | yes |
| Remove ANY listing | no | **yes** |
| Request to borrow a tool | yes (not own tool) | yes (not own tool) |
| Approve / decline requests on OWN tools only | yes | own tools only (admin power is not "approve anything") |
| Mark a loan as returned | lender of that loan | lender, or admin |
| View own listings / own requests / incoming requests | yes | yes |
| View ALL loans | no | **yes** |
| Mark a lender as "Trusted Lender" | no | **yes** |

**Enforcement rules (critical):**
1. Authorization lives in **Convex functions**, never only in the UI. The UI hides buttons for UX; the backend rejects for security.
2. Role is stored in the Convex `users` table (not trusted from the client). **Decision:** first admin is bootstrapped via an env var `ADMIN_EMAILS` (comma-separated) checked on first sign-in; admins can be changed only via a server-side internal mutation, never from the client.
3. Every public/authenticated function starts by resolving the current user through one shared helper (`requireUser`, `requireAdmin`).
4. Ownership checks happen inside the mutation, using the DB record, never an ID/owner passed from the client.
5. Return the minimum fields needed (see data minimization, section 8).

---

## 4. Features: Public page (signed out) [REQ]

- [ ] Shows the company name **LendLoop**.
- [ ] Shows the short tagline.
- [ ] Shows a **read-only list of available tools** pulled from Convex, **name and category only**. No owner name, email, id, description, or condition.
- [ ] Shows a **"Sign in to lend or borrow"** button wired to Clerk.
- [ ] Public query returns only whitelisted fields (do not return the full document and hide fields in the UI).
- [ ] Only "available" tools are listed publicly. **Decision:** "available" = listing active and not currently on loan.
- [ ] Empty state when there are no tools.

---

## 5. Features: Authenticated experience [REQ]

Only signed-in users can do the following.

### 5.1 Listing a tool
- [ ] Form fields: **name**, **category**, **condition**, **short description**.
- [ ] Categories (enum): power tools, garden, kitchen, camping, hand tools, cleaning, other. **[DEC]** (the assignment says "etc.")
- [ ] Conditions (enum): new, good, fair, worn. **[DEC]**
- [ ] Server-side validation: required fields, max lengths (name 80, description 300), enum values.
- [ ] Edit own listing. Delete own listing (blocked if it has an active/approved loan).

### 5.2 Requesting to borrow
- [ ] Request to borrow a tool for a **date range** (start date, end date).
- [ ] Validation: start <= end, start not in the past, cannot request own tool, cannot overlap an already-approved loan for the same tool, max range length (e.g. 30 days) **[DEC]**.
- [ ] Optional short message to the lender **[DEC]** (keep it, but skip it from webhooks unless needed).

### 5.3 Handling requests
- [ ] Lender can **approve** or **decline** requests on their own tools only.
- [ ] Approving moves the loan to `approved` (active loan). Auto-decline other pending requests that overlap the approved range **[DEC]**.
- [ ] Borrower can cancel their own pending request **[DEC]**.
- [ ] Lender can **mark a loan as returned**. Tool becomes available again.

### 5.4 Views
- [ ] **All tools** with **availability status**, **filterable by category**.
- [ ] **My listings** (with edit, delete, per-listing request counts).
- [ ] **My requests** (requests I made, with status).
- [ ] **Incoming requests** (requests on my tools, with approve/decline).
- [ ] Nice, minimal layout (see `03_UI_DESIGN.md`).

### 5.5 Admin features [REQ]
- [ ] Remove any listing.
- [ ] View all loans (admin-only page/query).
- [ ] Mark / unmark a lender as **"Trusted Lender"**, shown as a badge on their listings.
- [ ] Admin pages are not reachable (backend and route guard) by normal users.

### 5.6 Bonus [BONUS]
- [ ] Show recent automation activity on each loan, e.g. "Reminder sent 2 days ago", "Lender notified".

---

## 6. Data model (Convex) [DEC]

```
users
  clerkId (string, indexed)   email   displayName
  role: "admin" | "user"
  isTrustedLender: boolean

tools
  ownerId (-> users)   name   category   condition   description
  isActive: boolean   createdAt
  index: by_owner, by_category

loans            (borrow request + loan lifecycle in one table)
  toolId (-> tools)   borrowerId (-> users)   lenderId (-> users)   // lenderId denormalized for fast incoming-requests query
  startDate   endDate   message?
  status: "pending" | "approved" | "declined" | "cancelled" | "returned"
  returnedAt?   createdAt
  index: by_borrower, by_lender, by_tool, by_status_endDate

automationEvents  (audit + idempotency)
  loanId   type: "request_notification" | "overdue_reminder"
  idempotencyKey (string, UNIQUE index)   status: "sent" | "failed"
  detail?   createdAt

webhookOutbox     (delivery tracking for Convex -> n8n)
  eventId   type   payloadRef   attempts   status: "pending" | "delivered" | "failed"   lastError?
```

**Availability** is derived: a tool is "on loan" if it has an `approved` loan whose range covers today. Do not store a duplicated flag that can drift.

**Overdue** = `status == "approved"` AND `endDate < today` AND not returned.

---

## 7. Automation with n8n [REQ]

### 7.1 Workflow 1: Request notification
- Trigger: a borrow request is **created** or its **status changes** (approved, declined, cancelled, returned).
- Convex mutation writes an outbox record and schedules an **action** (`ctx.scheduler.runAfter(0, ...)`) that calls the n8n **Webhook**. (Mutations cannot call `fetch`; actions can.)
- n8n workflow: Webhook node -> verify signature -> route by event type -> notify the relevant user (email / Slack / Discord / logged mock) -> respond 200.
- Payload contains **only fields needed** (see section 8).

### 7.2 Workflow 2: Overdue reminders
- Trigger: **Schedule node, daily**.
- Fetches overdue loans from a **Convex HTTP endpoint** (`GET /overdue-loans`, authenticated).
- For each borrower: send reminder.
- **Writes reminder status back** to Convex (`POST /reminder-status`).
- Write-back is **idempotent**.

### 7.3 Security of the integration (both directions) [REQ]
| Direction | Mechanism |
|---|---|
| Convex -> n8n | HMAC-SHA256 signature over `timestamp + "." + rawBody` using a shared secret. Header: `X-LendLoop-Signature`, `X-LendLoop-Timestamp`. n8n verifies signature (constant-time) and rejects if timestamp is older than 5 minutes (replay protection). |
| n8n -> Convex | Convex `httpAction` verifies a shared-secret header (or HMAC) before doing anything. Constant-time compare. Reject with 401. |
| Secrets | Env vars on Convex; n8n **Credentials** store. **Never** in code, committed `.env`, or exported workflow JSON. Provide `.env.example` only. |

### 7.4 Idempotency [REQ]
- Every write-back carries an `idempotencyKey` (e.g. `overdue:{loanId}:{YYYY-MM-DD}`).
- `automationEvents.idempotencyKey` has a unique constraint (check-then-insert inside one mutation). A retry with the same key returns the existing record and creates nothing new.
- Webhook events carry a stable `eventId` so n8n can dedupe.

### 7.5 Failure handling [REQ]
- Convex -> n8n: retry with exponential backoff (e.g. 5 attempts), then mark outbox `failed` and surface it (log + visible in admin view or automation activity).
- n8n: node-level "Retry on fail" on HTTP/notify nodes.
- A dedicated **Error Workflow** (Error Trigger node) that notifies someone (email/Slack/Discord/log) so failed runs **never fail silently**; set it as the error workflow on both main workflows.

---

## 8. Security & data minimization [REQ]

- Public page: tool name + category only.
- Webhook payload minimized: `eventId`, `type`, `loanId`, `toolName`, `status`, `startDate`, `endDate`, and the **recipient contact only** (e.g. recipient email + display name). No other user data, no descriptions/messages unless required.
- Overdue endpoint returns only: `loanId`, `toolName`, `endDate`, `daysOverdue`, borrower email + display name.
- Input validation on every function; no raw HTML rendering (XSS); no secrets in client bundle (`NEXT_PUBLIC_` only for Clerk publishable key and Convex URL).
- Webhook signing + replay window; constant-time comparisons.
- Rate-limit mutations that create requests/listings (simple per-user check) **[DEC]**.
- Structured logging without PII in logs (log IDs, not emails).
- Security headers in `next.config` (CSP, X-Frame-Options, etc.) **[DEC]**.
- `.gitignore` for env files and n8n data; run a secret scan before pushing; **export n8n workflows with credentials stripped** and verify no secrets in the JSON.

---

## 9. Deliverables checklist [REQ]

- [ ] GitHub repository with the app source code.
- [ ] Exported n8n workflow JSON files in the repo (`/n8n/workflows/*.json`): request notification, overdue reminders, error workflow.
- [ ] `docker-compose.yml` for n8n.
- [ ] `.env.example` (no real values).
- [ ] **README** covering:
  - [ ] Local setup (Next.js, Clerk, Convex, n8n via docker-compose)
  - [ ] Environment variables (table: name, where used, purpose)
  - [ ] Architecture (diagram + data flow)
  - [ ] Security decisions
  - [ ] Data-minimization decisions
  - [ ] How to import workflows and set n8n credentials
  - [ ] How to test the flows (curl examples for signed webhook and endpoints)
- [ ] **Short note: what I would change to run this in production** (e.g. managed n8n with queue mode, secret manager, real email provider, key rotation, rate limiting, monitoring with Sentry/Datadog, backups, audit log retention, Clerk org/roles, CI/CD, load testing).

---

## 10. Application email (after the take-home) [REQ]

Send to **techjobs@fluencetraining.com** with:
- [ ] Portfolio link
- [ ] GitHub repository link (LendLoop)
- [ ] Optional: 1-2 other relevant projects
- [ ] A short note on a **security/privacy consideration** implemented (or that I would implement) in a healthcare or similar context
- [ ] The word **"pineapple"** somewhere in the email (proves the posting was read)
- [ ] If an LLM writes or helps write the email, include **"[llm alert] I am an LLM"** in the subject or body, as the posting demands

---

## 11. Build order for the AI

1. Repo scaffold, TS strict, lint, Tailwind, shadcn, env example
2. Clerk + Convex auth wiring, `users` sync, role bootstrap
3. Schema + permission helpers + tests
4. Tools CRUD + public query + filters
5. Loans lifecycle (request, approve, decline, cancel, return) + overlap rules
6. Views: all tools, my listings, my requests, incoming requests
7. Admin: remove listing, all loans, trusted lender
8. Outbox + signed webhook action + retries
9. Convex HTTP endpoints (overdue, reminder-status) with auth + idempotency
10. n8n docker-compose + 3 workflows (+ error workflow), export JSON
11. Bonus: automation activity on loans
12. Tests, README, production note, secret scan

## 12. Definition of done

Every checkbox above ticked, `pnpm lint && pnpm typecheck && pnpm test` pass, a fresh clone can run following the README alone, and no secrets exist in the repo or exported JSON.
