/**
 * API del carrito persistente (solo usuarios con sesión en la app).
 * Invitados no deben usar estos helpers.
 */
import axios from "axios";

const API_ORIGIN =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "http://localhost:3000";

export const CART_API_URL = `${API_ORIGIN}/cart`;

/** Respuesta GET /cart/user/:id — items sin normalizar (lo parsea cartStorage). */
export async function fetchRemoteCartRaw(
  clientUserId: string
): Promise<unknown[] | null> {
  try {
    const res = await axios.get<{ items?: unknown }>(
      `${CART_API_URL}/user/${encodeURIComponent(clientUserId)}`
    );
    const arr = res.data?.items;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return null;
  }
}

export async function putRemoteCartPayload(
  clientUserId: string,
  items: Array<Record<string, unknown>>
): Promise<void> {
  await axios.put(
    `${CART_API_URL}/user/${encodeURIComponent(clientUserId)}`,
    { items }
  );
}
