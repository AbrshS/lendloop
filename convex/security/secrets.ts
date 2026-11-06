/**
 * secrets.ts — load environment variables and fail loud if any are missing.
 *
 * Every security-sensitive value flows through here so there's a single place
 * that validates presence. A missing secret throws rather than silently
 * disabling security (e.g. unsigned webhooks).
 *
 * In Convex, env vars are read from `process.env` within actions, or passed
 * via the context for queries/mutations. We read from process.env here since
 * all secret consumers run in actions/http handlers.
 */

import { AppError } from '../domain/errors';

export interface Secrets {
  /** Convex -> n8n HMAC secret. */
  n8nSigningSecret: string;
  /** n8n -> Convex callback shared secret. */
  n8nApiSecret: string;
  /** Outbound webhook URL. */
  n8nWebhookUrl: string;
  /** Clerk JWT issuer domain. */
  clerkJwtIssuerDomain: string;
  /** Comma-separated admin emails for bootstrap. */
  adminEmails: string[];
}

/** Read a single env var, throwing a loud error if missing/empty. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new AppError(
      `Missing required environment variable: ${name}. ` +
        'Set it with `npx convex env add` or in the dashboard.',
      500,
    );
  }
  return value.trim();
}

/** Load and validate all secrets at once. */
export function loadSecrets(): Secrets {
  return {
    n8nSigningSecret: requireEnv('N8N_SIGNING_SECRET'),
    n8nApiSecret: requireEnv('N8N_API_SECRET'),
    n8nWebhookUrl: requireEnv('N8N_WEBHOOK_URL'),
    clerkJwtIssuerDomain: requireEnv('CLERK_JWT_ISSUER_DOMAIN'),
    adminEmails: (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  };
}

/** Read a single optional env var (returns '' if unset). */
export function optionalEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}
