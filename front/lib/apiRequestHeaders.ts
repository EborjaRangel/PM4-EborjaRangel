import { resolveApiOrigin } from "@/lib/resolveApiOrigin";

/**
 * Cabeceras comunes para peticiones al API desde el navegador.
 * Ngrok (dominios ngrok-free.*, etc.) puede mostrar una página intersticial;
 * sin esta cabecera, el cliente a veces falla con "Network Error".
 */
export function mergeApiHeaders(
  base?: Record<string, string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (base) {
    for (const [k, v] of Object.entries(base)) {
      if (v !== undefined && v !== "") {
        out[k] = v;
      }
    }
  }
  try {
    if (resolveApiOrigin().toLowerCase().includes("ngrok")) {
      out["ngrok-skip-browser-warning"] = "true";
    }
  } catch {
    /* resolveApiOrigin inválido */
  }
  return out;
}
