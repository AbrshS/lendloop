/**
 * AutomationService — enqueue outbox events and record reminders idempotently.
 *
 * Two responsibilities:
 *  1. enqueueEvent: write a `webhookOutbox` row and schedule `deliverWebhook`
 *     (an action) to sign + POST it to n8n. This is the "outbox" pattern — the
 *     loan mutation writes a row in the same transaction, then the action
 *     delivers it out of band.
 *  2. recordReminder: idempotently log a reminder (n8n may retry; the
 *     idempotencyKey dedupes). See idempotency.test.ts.
 *
 * System-level service: it takes ctx and an optional actor (the reminder path
 * is triggered by n8n, not a user). A `deliverRef` (the generated action
 * reference) is passed in so the service stays free of generated imports.
 */
import type { FunctionReference } from 'convex/server';
import type {
  MutationCtx,
  QueryCtx,
  ActionCtx,
} from '../_generated/server';
import type { Doc } from '../_generated/dataModel';
import {
  AutomationEventRepository,
  type AutomationEventDoc,
  type IAutomationEventRepository,
} from '../repositories/AutomationEventRepository';
import type { Actor } from '../security/AccessControl';
import type { AnyPayload } from '../integrations/payloads';
import { N8nWebhookClient } from '../integrations/N8nWebhookClient';
import { HmacSigner } from '../security/HmacSigner';
import { loadSecrets } from '../security/secrets';
import { systemClock } from '../domain/Clock';

export interface OutboxRow {
  _id: string;
  event: string;
  payload: unknown;
  status: string;
  attempts: number;
}

export class AutomationService {
  private events: IAutomationEventRepository;

  constructor(
    private readonly ctx: MutationCtx | QueryCtx,
    private readonly actor: Actor | null = null,
    /** Generated reference to the deliverWebhook action; passed by the handler. */
    private readonly deliverRef: FunctionReference<'action', 'public' | 'internal'> | null = null,
  ) {
    this.events = new AutomationEventRepository(ctx);
  }

  /**
   * Enqueue a webhook delivery: insert an outbox row and schedule the action.
   * Called from within loan mutations (same ctx/transaction).
   */
  async enqueueEvent(input: {
    event: string;
    payload: AnyPayload;
    loanId?: string;
  }): Promise<string> {
    const id = await (this.ctx as MutationCtx).db.insert('webhookOutbox', {
      loanId: input.loanId ? (input.loanId as any) : undefined,
      event: input.event,
      payload: input.payload,
      status: 'pending',
      attempts: BigInt(0),
      createdAt: BigInt(Date.now()),
    });

    if (this.deliverRef) {
      (this.ctx as MutationCtx).scheduler.runAfter(
        0,
        this.deliverRef,
        { outboxId: id },
      );
    }
    return id as unknown as string;
  }

  /**
   * Record a reminder idempotently. The same idempotencyKey twice yields one
   * row (the second call returns the first). Used by the /reminder-status endpoint.
   */
  async recordReminder(input: {
    loanId: string;
    idempotencyKey: string;
    type: string;
    payload: unknown;
  }): Promise<AutomationEventDoc> {
    return this.events.recordIdempotent({
      loanId: input.loanId,
      type: input.type,
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
    });
  }

  /** Append-only activity log for a loan (shown in the bonus activity UI). */
  async listActivityForLoan(loanId: string): Promise<AutomationEventDoc[]> {
    return this.events.listActivityForLoan(loanId);
  }

  /** Read an outbox row (used by the deliverWebhook action via an internal query). */
  async getOutboxRow(outboxId: string): Promise<OutboxRow | null> {
    const row = (await this.ctx.db.get(outboxId as any)) as Doc<'webhookOutbox'> | null;
    if (!row) return null;
    return {
      _id: row._id as string,
      event: row.event,
      payload: row.payload,
      status: row.status,
      attempts: Number(row.attempts),
    };
  }

  /** Mark an outbox row delivered/failed (used by the deliverWebhook action). */
  async markDelivered(
    outboxId: string,
    ok: boolean,
    error?: string,
  ): Promise<void> {
    const patch: Record<string, unknown> = {
      status: ok ? 'delivered' : 'failed',
      deliveredAt: ok ? BigInt(Date.now()) : undefined,
      lastError: error,
    };
    await (this.ctx as MutationCtx).db.patch(outboxId as any, patch);
  }

  /**
   * The actual delivery: read the row, sign + POST to n8n, mark the result.
   * Run as an action (the only place that uses fetch, via N8nWebhookClient).
   */
  static async deliver(ctx: ActionCtx, outboxId: string): Promise<void> {
    const secrets = loadSecrets();
    const service = new AutomationService(ctx as unknown as MutationCtx);
    const row = await service.getOutboxRow(outboxId);
    if (!row || row.status === 'delivered') return;

    const signer = new HmacSigner(secrets.n8nSigningSecret);
    const client = new N8nWebhookClient(secrets.n8nWebhookUrl, signer, systemClock);
    const result = await client.deliver(row.payload as AnyPayload);

    await service.markDelivered(outboxId, result.ok, result.error);
    if (!result.ok) {
      // Bump attempts; the cron sweep will retry.
      await (ctx as unknown as MutationCtx).db.patch(outboxId as any, {
        attempts: BigInt(row.attempts + 1),
      });
    }
  }
}
