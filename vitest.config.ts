import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Vitest config for LendLoop.
 *
 * The Convex domain/security/payload tests are pure TypeScript and don't need
 * a Convex deployment, so they run anywhere. Path alias mirrors tsconfig.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['convex/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['convex/domain/**/*.ts', 'convex/security/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
