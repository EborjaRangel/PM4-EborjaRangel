/**
 * URL base del API Express.
 *
 * 1. `NEXT_PUBLIC_API_URL` si está definido (API en otro dominio / segundo ngrok directo).
 * 2. En el navegador: mismo origen + `/pulse-api-proxy` → Next reescribe al backend
 *    (`next.config.ts`), destino por defecto `http://127.0.0.1:3000`.
 * 3. Durante SSR (sin window): llamada directa a `PULSE_PROXY_TARGET` o `127.0.0.1:3000`.
 */
export function resolveApiOrigin(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "").trim()
      : "";

  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/pulse-api-proxy`;
  }

  const internal = (
    process.env.PULSE_PROXY_TARGET ||
    process.env.PULSE_BACKEND_URL ||
    "http://127.0.0.1:3000"
  )
    .replace(/\/$/, "")
    .trim();

  return internal || "http://127.0.0.1:3000";
}
