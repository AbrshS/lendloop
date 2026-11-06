# LendLoop: Coding Rules (OOP, structure, security, quality)

> Rules the AI must follow on every file it writes. If a rule conflicts with the spec in `01_PROJECT_SPEC.md`, the spec wins on behavior and this file wins on code style.

---

## 0. How the AI must work

1. Read `01_PROJECT_SPEC.md` and `03_UI_DESIGN.md` before writing code.
2. Work in small steps following the build order. One concern per change.
3. Never invent requirements. If something is unclear, choose the safe option, note it in `docs/DECISIONS.md`, and continue.
4. Never output placeholder code like `// TODO implement` for required features.
5. After each step: it must compile (`pnpm typecheck`), lint clean, tests pass.
6. Never put secrets, tokens, or real emails in code, tests, fixtures, or workflow JSON.
7. Prefer deleting code over adding code. No dead code, no unused exports.

---

## 1. Language & compiler

- TypeScript `strict: true`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`.
- **No `any`**. Use `unknown` and narrow. No `@ts-ignore` (use `@ts-expect-error` with a reason only if unavoidable).
- No non-null assertions (`!`) except in tests.
- Prefer `readonly`, `as const`, and discriminated unions.
- Named exports only (default export only where Next.js requires it: `page.tsx`, `layout.tsx`).
- ES modules, no CommonJS.

---

## 2. OOP principles (applied pragmatically)

Convex functions are exported handlers, so use OOP **behind** them: handlers stay thin, classes hold the logic.

### 2.1 Layering (backend)

```
convex/
  schema.ts
  auth.config.ts
  http.ts                    # httpAction routes only, delegate to services
  tools.ts  loans.ts  admin.ts  users.ts  automation.ts   # thin handlers (validate args -> call service)
  domain/                    # PURE logic, no Convex imports, easy to unit test
    DateRange.ts             # value object
    LoanPolicy.ts            # state machine + overlap rules
    ToolPolicy.ts
    errors.ts                # AppError hierarchy
  services/                  # use cases, take ctx via constructor
    ToolService.ts
    LoanService.ts
    AdminService.ts
    UserService.ts
    AutomationService.ts
  repositories/              # all db access, one per table
    ToolRepository.ts
    LoanRepository.ts
    UserRepository.ts
    AutomationEventRepository.ts
  security/
    AccessControl.ts         # requireUser / requireAdmin / assertOwner
    HmacSigner.ts            # sign + verify (constant-time)
    secrets.ts               # reads env, fails fast if missing
  integrations/
    N8nWebhookClient.ts      # builds minimized payload, signs, sends
    payloads.ts              # payload builders (data minimization lives here)
```

**Handler shape (always):**
```ts
export const approve = mutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const actor = await AccessControl.requireUser(ctx);
    return new LoanService(ctx, actor).approve(loanId);
  },
});
```
No business logic in handlers. No db calls in handlers.

### 2.2 SOLID

- **S**: one class, one reason to change. Repositories only talk to the db. Services only orchestrate. Policies only decide.
- **O**: add behavior by adding classes/strategies (e.g. a `Notifier` interface with `MockNotifier`, `EmailNotifier`), not by growing `if` chains.
- **L**: subclasses and implementations must honor the base contract.
- **I**: small interfaces (`LoanReader`, `LoanWriter`) over god-interfaces.
- **D**: services depend on interfaces/abstractions injected via constructor, not on concrete globals.

### 2.3 Other OOP rules

- **Encapsulation**: private fields with `private readonly`; expose behavior, not mutable state.
- **Value objects** for concepts with rules: `DateRange` (validates start <= end, `overlaps()`, `contains()`), `Category`, `Condition`. Immutable.
- **State machine** for loan status in `LoanPolicy` (`canTransition(from, to, actor)`); invalid transitions throw `ConflictError`. No ad-hoc status strings scattered around.
- **Composition over inheritance**. Inheritance only for the error hierarchy.
- **Dependency injection** through constructors. No hidden singletons. No static mutable state.
- **Tell, don't ask**: `loan.approve(actor)` style behavior in domain/services, not callers poking at fields.
- Keep classes small: target < 150 lines, methods < 30 lines, max 4 params (use an options object beyond that).

### 2.4 Errors

```ts
class AppError extends Error { constructor(readonly code: string, message: string) { super(message); } }
class UnauthenticatedError extends AppError {}
class ForbiddenError extends AppError {}
class NotFoundError extends AppError {}
class ValidationError extends AppError {}
class ConflictError extends AppError {}
```
- Throw typed errors from services. Never throw raw strings.
- Error messages are user-safe: no stack traces, ids of other users, or internals.
- Do not leak existence: when a user lacks access to a record, throw `NotFoundError` where revealing existence is a risk.
- No empty `catch`. Either handle, rethrow, or log with context.

---

## 3. Security rules (non-negotiable)

1. **Backend enforces everything.** UI checks are UX only.
2. Every Convex function: validate args with `v.*`, resolve actor via `AccessControl`, check ownership/role against the **db record**, then act.
3. Never accept `ownerId`, `lenderId`, `role`, or `isTrustedLender` from client args. Derive from the authenticated actor and db.
4. Public queries return an explicit whitelist projection (`{ name, category }`). Never return a full document and strip it client-side.
5. Use `internalMutation` / `internalQuery` / `internalAction` for anything not called by the client (outbox, scheduler, idempotent writes).
6. HMAC verification uses constant-time comparison; reject stale timestamps (> 5 min); reject missing/invalid with generic 401.
7. Secrets only via `process.env` (Convex env) read through `security/secrets.ts` which throws on missing values. Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CONVEX_URL` are public.
8. No PII in logs. Log ids and event types, never emails or messages.
9. Sanitize/escape any user text rendered; never use `dangerouslySetInnerHTML`.
10. Idempotency on every write-back; unique key enforced in a single mutation.
11. Least privilege: n8n only gets the two endpoints it needs and a dedicated secret.
12. Dependencies: pin versions, no unnecessary packages, run `pnpm audit` before submit.

---

## 4. Frontend rules (Next.js App Router)

- Server Components by default; add `"use client"` only where hooks/interactivity are needed.
- Feature-based structure:
```
src/
  app/                       # routes only (thin)
    (public)/page.tsx
    (app)/tools/page.tsx  my-listings/  my-requests/  incoming/
    (admin)/admin/loans/page.tsx
    layout.tsx  middleware.ts   # Clerk middleware protects (app) and (admin)
  features/
    tools/   { components/ hooks/ schemas/ types.ts }
    loans/   { ... }
    admin/   { ... }
  components/ui/             # shadcn primitives
  components/layout/         # shell, nav, page header
  lib/                       # utils, formatters, constants
```
- No fetching logic inside presentational components; use hooks (`useTools`, `useMyLoans`) wrapping Convex `useQuery`/`useMutation`.
- Every async UI handles **loading, empty, error, and success** states.
- Forms: react-hook-form + Zod; mirror (not replace) server validation. Show field-level errors.
- Destructive actions (delete, remove, decline) require a confirm dialog.
- Optimistic UI only where safe; always reconcile with server result.
- Accessibility: semantic HTML, labels for inputs, focus states, keyboard navigable dialogs, `aria-live` for toasts, color is never the only status signal.
- Role-based UI uses a single `useCurrentUser()` hook and `<RoleGate role="admin">` component. The route guard is a convenience; the backend is the real guard.

---

## 5. Naming & style

| Thing | Convention | Example |
|---|---|---|
| Classes / types / interfaces | PascalCase | `LoanService`, `DateRange` |
| Interfaces | no `I` prefix | `Notifier` |
| Functions / variables | camelCase, verb-first functions | `approveLoan`, `isOverdue` |
| Booleans | `is/has/can/should` | `isTrustedLender` |
| Constants | UPPER_SNAKE | `MAX_LOAN_DAYS` |
| Files | PascalCase for classes, camelCase for modules, kebab-case for routes | `LoanService.ts`, `formatDate.ts` |
| Convex tables | camelCase plural | `loans` |

- No abbreviations except common ones (`id`, `url`, `ctx`).
- No magic numbers or strings: put them in `lib/constants.ts` / `domain/constants.ts` (statuses, categories, limits).
- Prettier defaults, 100 col, single source of truth for formatting. ESLint errors = build fails.
- Comments explain **why**, not what. Public classes get a one-line doc comment. Security-relevant code gets a short rationale comment.

---

## 6. Convex-specific rules

- Define indexes for every query path; never `.filter()` over whole tables for hot paths.
- Mutations are transactional: do check + write together (overlap check and insert in the same mutation) to avoid race conditions.
- Mutations can't `fetch`: use outbox + `ctx.scheduler.runAfter` -> `internalAction`.
- Actions retry with backoff and record attempts; never loop forever; cap attempts.
- Keep functions small and typed with `v` validators; return typed, minimal objects.
- Dates: loan ranges as `YYYY-MM-DD` strings; "today" computed in one helper (`today()`), injectable for tests.

---

## 7. n8n rules

- Workflows exported to `n8n/workflows/*.json` with **credentials stripped**; grep the JSON for secrets before commit.
- Name nodes clearly (`Verify signature`, `Fetch overdue loans`, `Write back status`).
- No hardcoded URLs or secrets in nodes: use env vars / credentials.
- First step of the webhook workflow verifies signature + timestamp; invalid -> respond 401 and stop.
- HTTP nodes: retry on fail enabled; error workflow assigned on every workflow.
- Docker image tag pinned (no `latest`). Needed env: `N8N_ENCRYPTION_KEY`, `NODE_FUNCTION_ALLOW_BUILTIN=crypto`, webhook URL settings.

---

## 8. Testing rules

- **Unit tests** (pure): `DateRange`, `LoanPolicy` transitions and overlap, payload builders (assert no extra fields), `HmacSigner` (valid, tampered, stale, wrong secret).
- **Convex tests** (`convex-test`): permission matrix. For every function, test: anonymous rejected, wrong user rejected, owner allowed, admin allowed/denied per spec.
- **Idempotency test**: same write-back key twice -> one record.
- **Public query test**: result has only `name` and `category`.
- Tests are deterministic (inject clock), independent, named `should <behavior> when <condition>`.
- Target: all security and state-machine logic covered.

---

## 9. Git & repo hygiene

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Small commits following the build order. No giant "initial" commit.
- `.gitignore`: `.env*` (except `.env.example`), `node_modules`, `.next`, n8n data volume.
- Run a secret scan (e.g. gitleaks or grep) before every push.
- `README.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCTION_NOTES.md` kept in sync with code.

---

## 10. Definition of done (per change)

- [ ] Matches a requirement in `01_PROJECT_SPEC.md`
- [ ] Authorization enforced in Convex + tested
- [ ] Inputs validated server-side
- [ ] Minimal data returned
- [ ] Loading / empty / error states handled in UI
- [ ] Typecheck, lint, tests pass
- [ ] No secrets, no PII in logs
- [ ] Docs updated if behavior or config changed

## 11. Forbidden

`any`, `@ts-ignore`, `dangerouslySetInnerHTML`, secrets in code/JSON, client-supplied owner/role, UI-only authorization, business logic in handlers or components, silent `catch`, `console.log` of user data, floating promises, unpinned `latest` images, copy-pasted duplicate logic.
