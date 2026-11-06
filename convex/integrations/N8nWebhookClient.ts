/**
 * N8nWebhookClient — sign an outbound payload and POST it to n8n, with retry.
 *
 * This is the ONLY place in the codebase that calls `fetch`. It signs the
 * exact serialized body with HmacSigner and retries transient failures with
 * exponential backoff. Non-2xx responses (after retries) are reported as a
 * failed DeliveryResult, which the outbox can sweep later.
 */
import { HmacSigner, SIGNATURE_HEADER } from '../security/HmacSigner';
import type { Clock } from '../domain/Clock';
import type { AnyPayload } from './payloads';
import type { DeliveryResult } from './Notifier';

/** Maximum delivery attempts before giving up. */
const MAX_ATTEMPTS = 3;

/** Base backoff in ms (doubles each attempt). */
const BASE_BACKOFF_MS = 500;

export class N8nWebhookClient {
  constructor(
    private readonly webhookUrl: string,
    private readonly signer: HmacSigner,
    private readonly clock: Clock,
  ) {}

  /**
   * Deliver a payload. Returns a DeliveryResult; never throws on HTTP errors
   * (those become ok:false so the outbox can retry later).
   */
  async deliver(payload: AnyPayload): Promise<DeliveryResult> {
    const body = JSON.stringify(payload);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const signed = this.signer.sign(body, this.clock.now());
      try {
        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [SIGNATURE_HEADER]: signed.header,
          },
          body,
        });

        if (res.ok) {
          return { ok: true };
        }
        // 4xx (except 429) won't get better with retries — stop early.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return {
            ok: false,
            error: `n8n rejected with ${res.status}`,
          };
        }
        // 5xx / 429: retry.
      } catch (err) {
        // Network error: retry.
        if (attempt === MAX_ATTEMPTS) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : 'network error',
          };
        }
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }

    return { ok: false, error: 'exceeded retry attempts' };
  }
}

/** Testable sleep helper. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
