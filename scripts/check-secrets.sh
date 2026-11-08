#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# check-secrets.sh — Pre-push security scan for LendLoop.
# Fails if any real secrets or credentials leaked into code or exported JSON.
# ─────────────────────────────────────────────────────────────

set -e

echo "🔍 Scanning LendLoop repository for potential secrets..."

PATTERNS=(
  "ghp_[0-9a-zA-Z]{36}"
  "sk_live_[0-9a-zA-Z]+"
  "pk_live_[0-9a-zA-Z]+"
  "BEGIN PRIVATE KEY"
  "BEGIN RSA PRIVATE KEY"
  "AKIA[0-9A-Z]{16}"
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(git grep -E "$pattern" -- ':(exclude).env.example' || true)
  if [ -n "$MATCHES" ]; then
    echo "❌ Potential secret detected matching pattern '$pattern':"
    echo "$MATCHES"
    FOUND=1
  fi
done

# Scan n8n exported workflows to ensure no embedded credentials
if [ -d "n8n/workflows" ]; then
  if grep -ri '"credentials"' n8n/workflows/ 2>/dev/null; then
    echo "❌ Found credentials object in n8n/workflows/*.json!"
    FOUND=1
  fi
fi

if [ $FOUND -eq 0 ]; then
  echo "✅ No leaked secrets detected. Clean!"
  exit 0
else
  echo "🚨 Secrets check failed. Please remove secrets before pushing."
  exit 1
fi

