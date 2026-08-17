import { defineConfig } from "vitest/config";

export default defineConfig({
  // Inline (empty) postcss config so Vite doesn't walk up to the parent
  // Next.js repo's postcss.config.mjs, which needs deps this server doesn't install.
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "node",
    env: {
      STRIPE_SECRET_KEY: "sk_test_dummy",
      STRIPE_WEBHOOK_SECRET: "whsec_test_dummy",
      DATABASE_PATH: ":memory:",
    },
  },
});
