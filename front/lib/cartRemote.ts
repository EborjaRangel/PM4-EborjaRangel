/**
 * API del carrito persistente (solo usuarios con sesión en la app).
 * Invitados no deben usar estos helpers.
 */
import axios from "axios";
import { mergeApiHeaders } from "@/lib/apiRequestHeaders";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";

function cartBase(): string {
  return `${resolveApiOrigin()}/cart`;
}

/** Respuesta GET /cart/user/:id — items sin normalizar (lo parsea cartStorage). */
export async function fetchRemoteCartRaw(
  clientUserId: string,
): Promise<unknown[] | null> {
  try {
    const res = await axios.get<{ items?: unknown }>(
      `${cartBase()}/user/${encodeURIComponent(clientUserId)}`,
      { headers: mergeApiHeaders() },
    );
    const arr = res.data?.items;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return null;
  }
}

export async function putRemoteCartPayload(
  clientUserId: string,
  items: Array<Record<string, unknown>>,
): Promise<void> {
  await axios.put(
    `${cartBase()}/user/${encodeURIComponent(clientUserId)}`,
    { items },
    { headers: mergeApiHeaders() },
  );
}
