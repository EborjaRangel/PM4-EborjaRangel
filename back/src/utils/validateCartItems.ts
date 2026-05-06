import { ClientError } from "./errors";

/** Valida cada item del carrito (misma regla que compras). */
export function assertCartItemsShape(items: unknown): unknown[] {
  if (!Array.isArray(items)) {
    throw new ClientError("items debe ser un array.", 400);
  }
  for (const row of items) {
    if (!row || typeof row !== "object") {
      throw new ClientError("Formato invalido en items del carrito.", 400);
    }
    const it = row as Record<string, unknown>;
    const id = Number(it.id);
    const name = String(it.name ?? "");
    const price = Number(it.price);
    const qty = Number(it.qty);
    if (!Number.isInteger(id) || id < 1) {
      throw new ClientError("Formato invalido en items del carrito.", 400);
    }
    if (!name.trim()) {
      throw new ClientError("Formato invalido en items del carrito.", 400);
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new ClientError("Formato invalido en items del carrito.", 400);
    }
    if (!Number.isInteger(qty) || qty < 1) {
      throw new ClientError("Formato invalido en items del carrito.", 400);
    }
  }
  return items;
}
