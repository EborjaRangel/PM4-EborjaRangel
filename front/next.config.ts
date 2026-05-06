import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";

/** Carga `.env*` desde esta carpeta aunque `npm run dev` se ejecute con otro `cwd`. */
const frontRoot = path.dirname(fileURLToPath(import.meta.url));
loadEnvConfig(frontRoot);

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
