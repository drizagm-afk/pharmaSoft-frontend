import { relative } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'relative-test-paths',
      enforce: 'post',
      configResolved(config) {
        // Absolute paths containing parentheses are interpreted as glob patterns.
        const test = (config as typeof config & { test?: { include?: string[] } }).test;
        if (test?.include) {
          test.include = test.include.map((path) =>
            relative(config.root, path).replaceAll('\\', '/'),
          );
        }
      },
    },
  ],
});
