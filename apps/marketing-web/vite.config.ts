import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ command }) => {
  const rawPort = process.env.PORT ?? "4173";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return {
    base: "/",

    plugins: [
      react(),
      tailwindcss(),
      ...(command === "serve" ? [runtimeErrorOverlay()] : []),

      ...(command === "serve" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
      dedupe: ["react", "react-dom"],
    },

    root: path.resolve(import.meta.dirname),

    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,

      fs: {
        strict: true,
        deny: ["**/.*"],
      },

      // ✅ FIXED PROXY (CRITICAL)
      proxy: {
        "/api": {
          target:
            process.env.VITE_API_PROXY_TARGET ??
            process.env.API_BASE_URL ??
            "http://127.0.0.1:3001",
          changeOrigin: true,
          secure: false,

          // 🔥 IMPORTANT: ensures cookies + auth headers behave correctly
          cookieDomainRewrite: "localhost",

          // keep path clean
          rewrite: (path) => path,
        },
      },
    },

    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      modulePreload: {
        polyfill: false,
      },
    },

    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target:
            process.env.VITE_API_PROXY_TARGET ??
            process.env.API_BASE_URL ??
            "http://127.0.0.1:3001",
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
        },
      },
    },
  };
});
