import { describe, it, expect } from 'vitest';
import { HmacSigner } from '../security/HmacSigner';

const SECRET = 'a-very-strong-signing-secret-12345';

describe('HmacSigner', () => {
  it('verifies a signature it produced', () => {
    const signer = new HmacSigner(SECRET);
    const body = JSON.stringify({ event: 'loan.requested', loanId: 'abc' });
    const signed = signer.sign(body, 1_000_000);
    expect(signer.verify(body, signed.header, 1_000_000)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const signer = new HmacSigner(SECRET);
    const signed = signer.sign('{"loanId":"abc"}', 1_000_000);
    expect(signer.verify('{"loanId":"xyz"}', signed.header, 1_000_000)).toBe(false);
  });

  it('rejects a signature from the wrong secret', () => {
    const a = new HmacSigner(SECRET);
    const b = new HmacSigner('a-different-strong-secret-67890');
    const body = '{"event":"x"}';
    const signed = a.sign(body, 1_000_000);
    expect(b.verify(body, signed.header, 1_000_000)).toBe(false);
  });

  it('rejects a stale signature (outside the skew window)', () => {
    const signer = new HmacSigner(SECRET, 60_000); // 1 minute window
    const body = '{"event":"x"}';
    const signed = signer.sign(body, 1_000_000);
    // 2 minutes later — outside the 1-minute window
    expect(signer.verify(body, signed.header, 1_000_000 + 120_000)).toBe(false);
  });

  it('accepts a signature within the skew window', () => {
    const signer = new HmacSigner(SECRET, 60_000);
    const body = '{"event":"x"}';
    const signed = signer.sign(body, 1_000_000);
    expect(signer.verify(body, signed.header, 1_000_000 + 30_000)).toBe(true);
  });

  it('rejects a malformed header', () => {
    const signer = new HmacSigner(SECRET);
    expect(signer.verify('{"event":"x"}', 'not-a-real-signature', 1_000_000)).toBe(false);
  });

  it('rejects a null header', () => {
    const signer = new HmacSigner(SECRET);
    expect(signer.verify('{"event":"x"}', null, 1_000_000)).toBe(false);
  });

  it('refuses construction with a too-short secret', () => {
    expect(() => new HmacSigner('short')).toThrow();
  });
});
