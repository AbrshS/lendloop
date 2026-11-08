# LendLoop

> **"Borrow what you need. Lend what you don’t."**  
> A trusted neighborhood tool-lending community platform built on **Next.js 14 (App Router)**, **Convex backend**, **Clerk Authentication**, and automated with **n8n**.

---

## Deliverables & Repository Structure

* **App Source Code**: Complete responsive Next.js frontend with artisanal Rowe editorial landing page, full-bleed physical tool bench, and type-safe reactive Convex database functions.
* **Exported n8n Workflows**: Standalone, production-ready workflow JSONs located in [`n8n/workflows/`](n8n/workflows/):
  * `request-notification.json` — HMAC-signed webhook notification pipeline.
  * `overdue-reminders.json` — Scheduled sweep with daily borrower reminders and idempotent status write-backs.
  * `error-workflow.json` — Centralized error trigger and alerting workflow.
* **Test Payloads & CLI Helper**: Real JSON test fixtures in [`n8n/test-payloads.json`](n8n/test-payloads.json) and runner [`n8n/send-test-webhook.mjs`](n8n/send-test-webhook.mjs).

---

## Architecture Overview

LendLoop separates concerns cleanly across four distinct layers to ensure high reliability, maintainability, and data security:

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Client                   │
│   (Rowe Editorial Landing, Tool Bench, Admin Desk)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Authenticated queries & mutations
                           ▼
┌────────────────────────────────────────────────────────┐
│                Convex Reactive Platform                │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │   Handlers    │─►│   Services    │─►│ Repo Layer │  │
│  └───────────────┘  └───────┬───────┘  └─────┬──────┘  │
│                             │                ▼         │
│                             │          Database Tables │
│                             ▼                          │
│                     Domain Rules (Pure)                │
└──────────────┬───────────────────────────▲─────────────┘
               │ Signed Webhook (HMAC)     │ Idempotent Write-Back
               ▼                           │ (/automation-events)
┌──────────────────────────────────────────┴─────────────┐
│                 n8n Automation Engine                  │
│   (Event Verification, Notification Delivery, Sweeps)  │
└────────────────────────────────────────────────────────┘
```

1. **Presentation Layer (`src/`)**: Next.js App Router with Tailwind CSS, Radix UI / shadcn components, Lucide icons, and Sonner notifications.
2. **Convex Backend (`convex/`)**:
   * **Domain Layer (`convex/domain/`)**: Pure business logic (loan duration policies, state machines, date ranges) completely decoupled from database mechanics and 100% unit-tested.
   * **Repository Layer (`convex/repositories/`)**: Encapsulates all direct database operations and data-minimization projections.
   * **Service Layer (`convex/services/`)**: Orchestrates business transactions, multi-document mutations, and event scheduling.
   * **Security Boundary (`convex/security/`)**: Enforces server-side Role-Based Access Control (`AccessControl`), cryptographic HMAC-SHA256 signatures (`HmacSigner`), and secret management.
3. **Automation Engine (`n8n/`)**: Autonomous workflows handling time-sensitive neighbor notifications and periodic return sweeps.

---

## Security & Data-Minimization Decisions

LendLoop is engineered with defense-in-depth and strict privacy principles:

### 1. Data Minimization (Zero PII Leaks)
* **Public Bench Browsing**: When unauthenticated visitors view tools, Convex serves `api.tools.listPublic`, which projects only `{ _id, name, category }`. Owner identities, street addresses, and contact coordinates are never sent across the network to anonymous clients.
* **Webhook Event Scoping**: Event payloads dispatched to n8n contain strictly the minimal fields required for notifications (tool name, date range, borrower first name). Full account profiles and internal user IDs are excluded at the builder boundary (`convex/integrations/payloads.ts`).

### 2. Cryptographic Webhook Security (Convex $\rightarrow$ n8n)
* **HMAC-SHA256 Signature**: Outbound webhooks include an `x-lendloop-signature` header containing a cryptographic digest (`t=<timestamp>,v1=<hmac>`).
* **Replay Attack Mitigation**: The n8n verification node enforces a strict 300-second freshness window. Expired or duplicate timestamps are discarded immediately.
* **Constant-Time Verification**: Verification employs constant-time buffer comparisons (`crypto.timingSafeEqual`) to eliminate timing side-channel attacks.

### 3. Server-Enforced RBAC
* Role and ownership checks are executed in Convex backend functions, never trusted to UI state.
* **Members**: Can only edit or remove their own tool listings, and approve/decline/return requests directly associated with their own tools.
* **Admins**: Can remove any inappropriate listing, view organization-wide loan history, and grant "Trusted Lender" community credentials.

### 4. Idempotent Inbound API Write-Backs (n8n $\rightarrow$ Convex)
* Callbacks to `POST /automation-events` and `GET /overdue-loans` are guarded by a shared secret (`x-lendloop-api-secret` or `Authorization: Bearer <token>`).
* Write-backs enforce unique idempotency keys (e.g., `overdue:<loanId>:<YYYY-MM-DD>`). Retries from network timeouts return the canonical existing log row without generating duplicate notifications.

---

## Local Setup & Development

### Prerequisites
* Node.js 18+ and npm
* Docker & Docker Compose (for self-hosting n8n)
* Free accounts on [Clerk](https://clerk.com) and [Convex](https://convex.dev)

### Step 1: Clone and Install
```bash
git clone <your-repo-url>
cd lendloop
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

| Variable | Environment | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CONVEX_URL` | App Client | Convex deployment URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | App Client | Clerk public authentication key |
| `CLERK_SECRET_KEY` | App Server | Clerk private backend key |
| `CLERK_JWT_ISSUER_DOMAIN` | Convex Env | Clerk JWT Issuer (`https://<id>.clerk.accounts.dev`) |
| `ADMIN_EMAILS` | Convex Env | Comma-separated admin email addresses for role bootstrap |
| `N8N_WEBHOOK_URL` | Convex Env | Outbound n8n webhook destination URL |
| `N8N_SIGNING_SECRET` | Convex & n8n | Shared cryptographic HMAC signing secret (min 16 chars) |
| `N8N_API_SECRET` | Convex & n8n | Secret protecting inbound `/overdue-loans` and write-backs |
| `N8N_ENCRYPTION_KEY` | Docker / n8n | Key used by n8n to encrypt internal workflow credentials |
| `CONVEX_SITE_URL` | n8n Env | Convex HTTP action domain (`https://<name>.convex.site`) |

Push backend secrets to your Convex deployment:
```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-tenant>.clerk.accounts.dev
npx convex env set N8N_SIGNING_SECRET dev_signing_secret_12345678
npx convex env set N8N_API_SECRET dev_api_secret_12345678
npx convex env set N8N_WEBHOOK_URL http://localhost:5678/webhook/lendloop-request-events
```

### Step 3: Start Convex and Next.js
In terminal 1:
```bash
npx convex dev
```

In terminal 2:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to browse the editorial landing page and live tool board.

### Step 4: Run n8n with Docker Compose
```bash
docker compose up -d
```
1. Open n8n at **[http://localhost:5678](http://localhost:5678)**.
2. In the n8n UI, navigate to **Workflows** $\rightarrow$ **Import from file** and import:
   * `n8n/workflows/request-notification.json`
   * `n8n/workflows/overdue-reminders.json`
   * `n8n/workflows/error-workflow.json`
3. Toggle the workflows to **Active**.

---

## Verification & Testing

Run the comprehensive unit test suite, type-checker, and linter:
```bash
# 1. Run domain, security, and payload isolation tests (81 unit tests)
npm test

# 2. Verify TypeScript strict type-checking
npm run typecheck

# 3. Lint code standards
npm run lint

# 4. Trigger test signed webhook into n8n
node n8n/send-test-webhook.mjs
```

---

## Production Readiness Note

To transition LendLoop from a verified neighborhood pilot to a multi-community production deployment, the following organizational and operational evolutions are recommended:

* **Enterprise Communication Delivery**: Transition the mock notification nodes in n8n to enterprise email and messaging infrastructure (such as Postmark, Amazon SES, or SendGrid) equipped with verified sender domains, DKIM/SPF alignment, and unsubscribed preference management.
* **Managed Automation Infrastructure**: Transition n8n from standalone local containers to high-availability managed infrastructure (e.g., n8n Cloud or a dedicated Kubernetes cluster backed by PostgreSQL and Redis) with automated offsite backups.
* **Centralized Key Management**: Manage long-lived cryptographic secrets (`N8N_SIGNING_SECRET`, `N8N_API_SECRET`) through dedicated cloud key managers (AWS Secrets Manager or HashiCorp Vault) supporting seamless zero-downtime key rotation.
* **Privacy & Data Governance**: Establish formal data retention and automated account closure workflows to ensure complete compliance with regional privacy regulations (GDPR/CCPA "Right to be Forgotten").
* **Proactive System Observability**: Implement centralized application monitoring and operational dashboards tracking webhook delivery rates, active loan volumes, and turnaround times to ensure dependable neighborhood service.
