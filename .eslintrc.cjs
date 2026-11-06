/**
 * ESLint config for LendLoop.
 * Extends Next.js defaults; keeps the codebase clean and consistent.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Prefer explicit return types on exported functions (matches our "thin handler" style)
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Allow dev-only console in server code; warn otherwise
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Enforce that hooks depend on the right values
    'react-hooks/exhaustive-deps': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'convex/_generated/',
    'n8n_data/',
  ],
};
