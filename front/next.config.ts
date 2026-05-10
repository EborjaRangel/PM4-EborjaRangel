import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";

/** Carga `.env*` desde esta carpeta aunque `npm run dev` se ejecute con otro `cwd`. */
const frontRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(frontRoot);

/** El proxy `/pulse-api-proxy/*` lo gestiona `app/pulse-api-proxy/[[...path]]/route.ts`
 *  para leer `PULSE_BACKEND_URL` en tiempo de ejecucion (Vercel). Los rewrites aqui
 *  solo aplicarian en build y podian quedar apuntando a 127.0.0.1 si faltaba la env.
 */
const nextConfig: NextConfig = {
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
