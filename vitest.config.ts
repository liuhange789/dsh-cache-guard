import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json'],
    alias: {
      '@deepseek-ai/schemastery': resolve(import.meta.dirname, 'test/mocks/schemastery.mjs'),
    },
  },
  server: {
    deps: {
      inline: [/\.ts$/],
    },
  },
  test: {
    include: ['host/src/**/*.test.ts', 'client/src/**/*.test.ts'],
    exclude: ['verify.test.ts', 'node_modules/**'],
  },
});