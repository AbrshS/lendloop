/**
 * send-test-webhook.mjs — Real dummy HMAC-signed webhook sender.
 *
 * Usage:
 *   node n8n/send-test-webhook.mjs [webhookUrl] [signingSecret]
 *
 * Defaults:
 *   webhookUrl    = http://localhost:5678/webhook/lendloop-request-events
 *   signingSecret = dev_signing_secret_12345678
 */

import crypto from 'node:crypto';

const webhookUrl = process.argv[2] || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/lendloop-request-events';
const secret = process.argv[3] || process.env.N8N_SIGNING_SECRET || 'dev_signing_secret_12345678';

const payload = {
  type: 'request.created',
  eventId: `evt_${Date.now()}`,
  loanId: 'jh7c46g3249j4r1w02z3fxr7px74a4x8',
  toolName: 'DeWalt DWS779 12-inch Sliding Miter Saw',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
  actorName: 'Marcus Thompson',
  recipient: {
    email: 'marcus.t@lendloop.local',
    displayName: 'Marcus Thompson',
  },
};

const rawBody = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000);
const timestampMs = timestamp * 1000;

// Compute HMAC-SHA256
const signature = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');

const headerSignature = `t=${timestampMs},v1=${signature}`;

console.log('--- Sending Signed Webhook ---');
console.log('Target URL:        ', webhookUrl);
console.log('Timestamp (s):     ', timestamp);
console.log('x-lendloop-sig:    ', headerSignature);
console.log('Payload:           ', rawBody);

try {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lendloop-signature': headerSignature,
      'x-lendloop-timestamp': String(timestamp),
    },
    body: rawBody,
  });

  const responseText = await res.text();
  console.log('\n--- Webhook Response ---');
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log('Body:  ', responseText);
} catch (err) {
  console.log('\n--- Webhook Request Failed ---');
  console.log(err.message);
  console.log('Tip: Ensure n8n is running and the "Webhook" node is listening or activated.');
}

