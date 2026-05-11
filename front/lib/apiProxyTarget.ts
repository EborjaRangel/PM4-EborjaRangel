/**
 * Destino del API para proxy server-side y heurísticas del cliente.
 * Sin dependencias de React (usable desde next.config).
 */

export function publicApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "").trim();
}

export function isNgrokUrl(url: string): boolean {
  return url.length > 0 && url.toLowerCase().includes("ngrok");
}

export function isLoopbackApiUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  } catch {
    return false;
  }
}

/** Fuerza /pulse-api-proxy → :3000 aunque NEXT_PUBLIC_API_URL siga siendo ngrok (útil en .env.local). */
export function useLocalApiFirst(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_LOCAL_API === "true" ||
    process.env.NEXT_PUBLIC_USE_LOCAL_API === "1"
  );
}

/** Destino real del backend para rewrites y Route Handler pulse-backend. */
export function resolveProxyTargetForServer(): string {
  const publicApi = publicApiUrl();
  const isNgrok = isNgrokUrl(publicApi);
  const isLoopback = isLoopbackApiUrl(publicApi);

  if (useLocalApiFirst()) {
    const raw =
      process.env.PULSE_PROXY_TARGET ||
      process.env.PULSE_BACKEND_URL ||
      "http://127.0.0.1:3000";
    return raw.replace(/\/$/, "");
  }

  const raw =
    process.env.PULSE_PROXY_TARGET ||
    process.env.PULSE_BACKEND_URL ||
    (isNgrok ? publicApi : "") ||
    (isLoopback ? publicApi : "") ||
    "http://127.0.0.1:3000";
  return raw.replace(/\/$/, "");
}
