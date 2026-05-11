/**
 * URL base del API Express (navegador vs SSR).
 *
 * - Sin `NEXT_PUBLIC_API_URL`: mismo origen + `/pulse-api-proxy` → :3000.
 * - `NEXT_PUBLIC_API_URL` en localhost/127.0.0.1: mismo origen + `/pulse-api-proxy` (evita CORS).
 * - Ngrok: `/api/pulse-backend` (servidor reenvía con cabecera ngrok).
 * - Otro dominio: petición directa (CORS en el API).
 *
 * Si el API local en :3000 funciona pero sigues teniendo ngrok en `.env`, define
 * `NEXT_PUBLIC_USE_LOCAL_API=true` para forzar el proxy a :3000.
 */
import {
  isLoopbackApiUrl,
  isNgrokUrl,
  publicApiUrl,
  useLocalApiFirst,
} from "@/lib/apiProxyTarget";

export function resolveApiOrigin(): string {
  const fromEnv = typeof process !== "undefined" ? publicApiUrl() : "";
  const ngrok = isNgrokUrl(fromEnv);
  const loopback = isLoopbackApiUrl(fromEnv);

  if (typeof window !== "undefined") {
    if (useLocalApiFirst()) {
      return `${window.location.origin}/pulse-api-proxy`;
    }
    if (ngrok) {
      return `${window.location.origin}/api/pulse-backend`;
    }
    if (loopback) {
      return `${window.location.origin}/pulse-api-proxy`;
    }
    if (process.env.NEXT_PUBLIC_FORCE_API_PROXY === "true") {
      return `${window.location.origin}/pulse-api-proxy`;
    }
    if (fromEnv) return fromEnv;
    return `${window.location.origin}/pulse-api-proxy`;
  }

  if (useLocalApiFirst()) {
    return (
      process.env.PULSE_PROXY_TARGET ||
      process.env.PULSE_BACKEND_URL ||
      "http://127.0.0.1:3000"
    )
      .replace(/\/$/, "")
      .trim();
  }

  if (fromEnv) return fromEnv;

  const internal = (
    process.env.PULSE_PROXY_TARGET ||
    process.env.PULSE_BACKEND_URL ||
    "http://127.0.0.1:3000"
  )
    .replace(/\/$/, "")
    .trim();

  return internal || "http://127.0.0.1:3000";
}
