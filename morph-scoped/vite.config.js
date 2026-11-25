import { defineConfig } from "vite"

export default defineConfig({
  base: "/frameworks/keyed/morph-scoped/dist/",
  // @jon49/web is linked from a sibling checkout (file:../../../../jon49-web).
  server: { fs: { allow: ["../../..", "../../../../jon49-web"] } },
})
