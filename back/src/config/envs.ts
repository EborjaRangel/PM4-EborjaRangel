import path from "path";
import dotenv from "dotenv";

/** Carpeta `back/` siempre, aunque `npm run dev` se ejecute con otro `cwd` (raíz del monorepo). */
const backRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(backRoot, ".env") });
dotenv.config({ path: path.join(backRoot, ".env.local"), override: true });

/** Conexión: usa `DATABASE_URL` si existe (Neon/Supabase/Railway/etc.); si no, host/usuario/password. */
export const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
export const PORT: number = Number(process.env.PORT) || 3000;
export const HOST: string =
  typeof process.env.HOST === "string" && process.env.HOST.trim()
    ? process.env.HOST.trim()
    : "0.0.0.0";
export const DB_NAME: string = process.env.DB_NAME || "proyecto_m4_front";
export const DB_USER: string = process.env.DB_USER || "postgres";
export const DB_PASSWORD: string = process.env.DB_PASSWORD || "admin";
export const DB_HOST: string = process.env.DB_HOST || "localhost";
export const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";
