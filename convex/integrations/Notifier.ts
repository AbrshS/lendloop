/**
 * Notifier — the delivery interface the n8n side (and tests) implement.
 *
 * The Convex side never sends notifications directly; it enqueues a webhook
 * and n8n does the delivery. This interface lets us swap the channel (mock,
 * email, Slack) without touching the core. It's here as a contract; the real
 * implementations live in n8n workflows.
 */

import type { AnyPayload } from './payloads';

/** Result of a delivery attempt. */
export interface DeliveryResult {
  ok: boolean;
  /** Channel-specific message id (n8n execution id, email message id, ...). */
  messageId?: string;
  /** Error detail if ok is false. */
  error?: string;
}

/**
 * A notifier takes a minimized payload and delivers it through some channel.
 * Implementations must be idempotent on their own side (n8n handles this via
 * the idempotency key echoed back to Convex).
 */
export interface Notifier {
  send(payload: AnyPayload): Promise<DeliveryResult>;
}

/**
 * A no-op notifier used when automation is disabled (e.g. tests or local dev
 * without n8n). It "succeeds" without sending anything.
 */
export const silentNotifier: Notifier = {
  async send() {
    return { ok: true, messageId: 'silent' };
  },
};
