// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// export default defineConfig({
//   plugins: [
//     react(),
//     runtimeErrorOverlay(),
//     ...(process.env.NODE_ENV !== "production" &&
//     process.env.REPL_ID !== undefined
//       ? [
//           await import("@replit/vite-plugin-cartographer").then((m) =>
//             m.cartographer(),
//           ),
//         ]
//       : []),
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(import.meta.dirname, "client", "src"),
//       "@shared": path.resolve(import.meta.dirname, "shared"),
//       "@assets": path.resolve(import.meta.dirname, "attached_assets"),
//     },
//   },
//   root: path.resolve(import.meta.dirname, "client"),
//   build: {
//     outDir: path.resolve(import.meta.dirname, "dist/public"),
//     emptyOutDir: true,
//   },
//   server: {
//     fs: {
//       strict: true,
//       deny: ["**/.*"],
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "3d61ba72-a7bf-41bf-b237-bafba3967140-00-20ji2dkshksqv.picard.replit.dev",
    ],
    fs: {
      strict: false,
      allow: [".."],
    },
  },
});
