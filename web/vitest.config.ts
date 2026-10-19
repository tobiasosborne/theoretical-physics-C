import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@gen': path.resolve(import.meta.dirname, '../build/web/gen') } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
