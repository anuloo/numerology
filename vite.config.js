import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true, // 👈 REQUIRED
    port: 5173,

    allowedHosts: [
      'hall-sorry-along-highlights.trycloudflare.com'
    ],

    hmr: {
      clientPort: 443
    }
  },

  preview: {
    host: true,
    port: 4173
  }
});
