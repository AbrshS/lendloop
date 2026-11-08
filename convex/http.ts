/**
 * http.ts — HTTP routes n8n calls back into Convex.
 *
 * Both routes are guarded by a shared API secret (N8N_API_SECRET) sent in either:
 *   - `x-lendloop-api-secret: <secret>` header
 *   - `Authorization: Bearer <secret>` header
 *
 * Routes:
 *   GET  /overdue-loans      -> list overdue loans ({ loans: [...] }) for the reminder sweep
 *   POST /reminder-status    -> record a sent reminder idempotently
 *   POST /automation-events  -> record an automation activity event idempotently
 *
 * @see docs/SECURITY.md for the auth scheme.
 */
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { loadSecrets } from './security/secrets';

const API_SECRET_HEADER = 'x-lendloop-api-secret';

/** Verify the inbound shared secret; returns true if either header matches. */
function authorize(request: Request): boolean {
  const secrets = loadSecrets();
  const providedCustom = request.headers.get(API_SECRET_HEADER);
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;

  return !!(
    (providedCustom && providedCustom === secrets.n8nApiSecret) ||
    (bearerToken && bearerToken === secrets.n8nApiSecret)
  );
}

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}

/** GET /overdue-loans — minimized list of overdue loans for n8n to remind. */
const overdueLoans = httpAction(async (ctx, request) => {
  if (!authorize(request)) return unauthorized();
  const entries = await ctx.runQuery(internal.automation.listOverdueLoans, {});
  // Return both 'loans' (for standard splitOut) and 'overdue' (backwards compat)
  return Response.json({ loans: entries, overdue: entries });
});

/** POST /automation-events & /reminder-status — idempotently record activity / reminder. */
const recordAutomationEvent = httpAction(async (ctx, request) => {
  if (!authorize(request)) return unauthorized();

  let body: {
    loanId?: string;
    idempotencyKey?: string;
    type?: string;
    status?: string;
    detail?: string;
    eventId?: string;
    payload?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.loanId || !body.idempotencyKey || !body.type) {
    return Response.json(
      { error: 'loanId, idempotencyKey, and type are required' },
      { status: 400 },
    );
  }

  const payload =
    body.payload !== undefined
      ? body.payload
      : {
          status: body.status,
          detail: body.detail,
          eventId: body.eventId,
        };

  const recorded = await ctx.runMutation(internal.automation.recordReminder, {
    loanId: body.loanId as any,
    idempotencyKey: body.idempotencyKey,
    type: body.type,
    payload,
  });

  return Response.json({ ok: true, recorded });
});

// Register routes under the default http path prefix.
const http = httpRouter();
http.route({
  path: '/overdue-loans',
  method: 'GET',
  handler: overdueLoans,
});
http.route({
  path: '/reminder-status',
  method: 'POST',
  handler: recordAutomationEvent,
});
http.route({
  path: '/automation-events',
  method: 'POST',
  handler: recordAutomationEvent,
});

export default http;
