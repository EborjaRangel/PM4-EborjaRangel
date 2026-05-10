import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";

/** Carga `.env*` desde esta carpeta aunque `npm run dev` se ejecute con otro `cwd`. */
const frontRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(frontRoot);

/** Proxy del API: rewrite de `/pulse-api-proxy/*` → backend (comportamiento original).
 *  Por defecto local: `http://127.0.0.1:3000`. En Vercel define `PULSE_BACKEND_URL`
 *  o `PULSE_PROXY_TARGET` en Environment Variables y redeploy (se lee en el build).
 */
const proxyTargetRaw =
  process.env.PULSE_PROXY_TARGET ||
  process.env.PULSE_BACKEND_URL ||
  "http://127.0.0.1:3000";
const pulseProxyDestination = `${proxyTargetRaw.replace(/\/$/, "")}/:path*`;

const nextConfig: NextConfig = {
  /** Permite HMR y recursos dev cuando entras por IP LAN (celular en la misma WiFi). */
  allowedDevOrigins: [
    "192.168.1.248",
    ...(process.env.ALLOWED_DEV_ORIGINS?.split(/[, ]+/).map((s) => s.trim()).filter(Boolean) ??
      []),
  ],
  async rewrites() {
    return [
      {
        source: "/pulse-api-proxy/:path*",
        destination: pulseProxyDestination,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
