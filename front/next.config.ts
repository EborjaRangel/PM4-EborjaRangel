import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";
import { resolveProxyTargetForServer } from "./lib/apiProxyTarget";

/** Carga `.env*` desde esta carpeta aunque `npm run dev` se ejecute con otro `cwd`. */
const frontRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(frontRoot);

/** Proxy: `/pulse-api-proxy/*` → backend (ver `lib/apiProxyTarget.ts`). */
const pulseProxyDestination = `${resolveProxyTargetForServer()}/:path*`;

const nextConfig: NextConfig = {
  /** HMR / webpack en dev: LAN, ngrok y hosts extra vía ALLOWED_DEV_ORIGINS (sin https://). */
  allowedDevOrigins: [
    "192.168.1.248",
    "tasty-massager-fleshed.ngrok-free.dev",
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
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
    ],
  },
};

export default nextConfig;
