/**
 * http.ts — HTTP routes n8n calls back into Convex.
 *
 * Both routes are guarded by a shared API secret (N8N_API_SECRET) sent in the
 * `X-LendLoop-Api-Secret` header. They never touch ctx.db directly — HTTP
 * actions can't — so they delegate to internal query/mutation handlers.
 *
 * Routes:
 *   GET  /overdue-loans    -> list overdue loans (minimized) for the reminder sweep
 *   POST /reminder-status  -> record a sent reminder idempotently
 *
 * @see docs/SECURITY.md for the auth scheme.
 */
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { loadSecrets } from './security/secrets';

const API_SECRET_HEADER = 'x-lendloop-api-secret';

/** Verify the inbound shared secret; returns 401 JSON on mismatch. */
function authorize(request: Request): boolean {
  const secrets = loadSecrets();
  const provided = request.headers.get(API_SECRET_HEADER);
  return !!provided && provided === secrets.n8nApiSecret;
}

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}

/** GET /overdue-loans — minimized list of overdue loans for n8n to remind. */
const overdueLoans = httpAction(async (ctx, request) => {
  if (!authorize(request)) return unauthorized();
  const entries = await ctx.runQuery(internal.automation.listOverdueLoans, {});
  return Response.json({ overdue: entries });
});

/** POST /reminder-status — idempotently record a sent reminder. */
const reminderStatus = httpAction(async (ctx, request) => {
  if (!authorize(request)) return unauthorized();

  let body: {
    loanId: string;
    idempotencyKey: string;
    type: string;
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

  const recorded = await ctx.runMutation(internal.automation.recordReminder, {
    loanId: body.loanId as any,
    idempotencyKey: body.idempotencyKey,
    type: body.type,
    payload: body.payload ?? null,
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
  handler: reminderStatus,
});

export default http;
