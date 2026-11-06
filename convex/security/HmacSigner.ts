/**
 * HmacSigner — sign and verify HMAC-SHA256 webhook payloads.
 *
 * Outbound (Convex -> n8n) requests are signed so n8n can prove authenticity.
 * The signature covers `${timestamp}.${body}` and is sent as a header:
 *
 *   X-LendLoop-Signature: t=<unix-ms>,v1=<hex-hmac>
 *
 * `verify` is constant-time and rejects replays older than the skew window.
 *
 * Uses node:crypto so it works both in Convex actions and in Vitest (node).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from '../domain/errors';

/** Maximum allowed age of a signature, in milliseconds (default 5 minutes). */
export const DEFAULT_MAX_SKEW_MS = 5 * 60 * 1000;

/** Header name carrying the signature, both directions. */
export const SIGNATURE_HEADER = 'x-lendloop-signature';

export interface SignedPayload {
  /** The header value to set: `t=<unix-ms>,v1=<hex>`. */
  header: string;
  /** The unix-ms timestamp used. */
  timestamp: number;
  /** The hex signature. */
  signature: string;
}

export class HmacSigner {
  constructor(
    private readonly secret: string,
    private readonly maxSkewMs: number = DEFAULT_MAX_SKEW_MS,
  ) {
    if (!secret || secret.length < 16) {
      throw new AppError(
        'Signing secret must be at least 16 characters.',
        500,
      );
    }
  }

  /**
   * Sign a raw request body. The body must be the *exact* bytes that will be
   * sent (i.e. the serialized JSON string), or the receiver's recomputation
   * won't match.
   */
  sign(body: string, timestamp: number = Date.now()): SignedPayload {
    const sig = this.compute(body, timestamp);
    return {
      header: `t=${timestamp},v1=${sig}`,
      timestamp,
      signature: sig,
    };
  }

  /**
   * Verify a received header against a body.
   *
   * @param body   raw request body string
   * @param header  the `X-LendLoop-Signature` header value
   * @param now     current time (injectable for tests); defaults to Date.now()
   * @returns true if the signature is valid and within the skew window
   */
  verify(body: string, header: string | null, now: number = Date.now()): boolean {
    if (!header) return false;
    const parsed = this.parseHeader(header);
    if (!parsed) return false;

    // Reject stale timestamps (replay protection).
    if (Math.abs(now - parsed.timestamp) > this.maxSkewMs) {
      return false;
    }

    const expected = this.compute(body, parsed.timestamp);
    // Constant-time comparison of the hex strings.
    return safeEqualHex(expected, parsed.signature);
  }

  /** Compute the hex HMAC for a body + timestamp. */
  private compute(body: string, timestamp: number): string {
    return createHmac('sha256', this.secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');
  }

  /** Parse `t=<n>,v1=<hex>` into its parts, or null if malformed. */
  private parseHeader(header: string): { timestamp: number; signature: string } | null {
    const parts = header.split(',');
    const tPart = parts.find((p) => p.startsWith('t='));
    const vPart = parts.find((p) => p.startsWith('v1='));
    if (!tPart || !vPart) return null;
    const timestamp = Number(tPart.slice(2));
    const signature = vPart.slice(3);
    if (!Number.isFinite(timestamp) || !signature) return null;
    return { timestamp, signature };
  }
}

/** Constant-time comparison of two hex strings of equal length. */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}
