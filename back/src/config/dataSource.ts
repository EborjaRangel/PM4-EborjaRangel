import { DataSource, type DataSourceOptions } from "typeorm";
import {
  DATABASE_URL,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./envs";
import { User } from "../entities/User";
import { Credential } from "../entities/Credential";
import { Order } from "../entities/Order";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import { PurchaseRecord } from "../entities/PurchaseRecord";
import { SavedCart } from "../entities/SavedCart";

const entities = [
  User,
  Credential,
  Order,
  Product,
  Category,
  PurchaseRecord,
  SavedCart,
];

/**
 * Postgres en la nube (Neon, Supabase…) suele exigir TLS.
 * Local (localhost sin cloud): suele ir sin TLS.
 *
 * DB_SSL=require | true  → fuerza TLS
 * DB_SSL=false           → desactiva TLS (útil si DATABASE_URL apunta a localhost)
 */
export function postgresSslOption():
  | false
  | { rejectUnauthorized: boolean } {
  const flag = (process.env.DB_SSL || "").trim().toLowerCase();
  if (flag === "false" || flag === "off" || flag === "0") return false;
  if (flag === "true" || flag === "require") {
    return {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    };
  }

  const url = DATABASE_URL.toLowerCase();
  if (DATABASE_URL && /localhost|127\.0\.0\.1/.test(url)) return false;
  if (DATABASE_URL) {
    return { rejectUnauthorized: false };
  }

  const hostLc = DB_HOST.trim().toLowerCase();
  if (hostLc === "localhost" || hostLc === "127.0.0.1") return false;

  return false;
}

const common: Pick<
  DataSourceOptions,
  "type" | "synchronize" | "logging" | "entities"
> = {
  type: "postgres",
  synchronize: true,
  logging: process.env.DB_LOGGING === "true",
  entities,
};

export const AppDataSource = DATABASE_URL
  ? new DataSource({
      ...common,
      url: DATABASE_URL,
      ssl: postgresSslOption() || undefined,
    } as DataSourceOptions)
  : new DataSource({
      ...common,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: postgresSslOption() || undefined,
    } as DataSourceOptions);
