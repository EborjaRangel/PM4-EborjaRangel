import axios from "axios";
import type { ICartItem, ICartTotals } from "@/lib/cartStorage";
import { mergeApiHeaders } from "@/lib/apiRequestHeaders";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";

function purchasesBase(): string {
  return `${resolveApiOrigin()}/purchases`;
}

export type PurchaseStatus = "completada_simulada";

/** Dirección de envío tal como quedó al registrar la compra. */
export interface IPurchaseShippingSnapshot {
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
}

export interface IPurchaseRecord {
  id: string;
  userId: string;
  createdAt: string;
  items: ICartItem[];
  totals: ICartTotals;
  status: PurchaseStatus;
  shipping: IPurchaseShippingSnapshot | null;
}

interface ApiPurchaseRecord {
  id: string;
  clientUserId: string;
  userEmail: string;
  items: unknown[];
  totals: Record<string, unknown>;
  shipping?: unknown;
  status: string;
  createdAt: string;
}

/** Postgres/json pueden devolver montos como string; evita NaN en UI. */
function normalizeMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim().replace(",", ".");
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeItem(raw: unknown): ICartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const it = raw as Record<string, unknown>;
  const id = Number(it.id);
  if (!Number.isInteger(id) || id < 1) return null;
  return {
    id,
    name: String(it.name ?? ""),
    price: Number(it.price ?? 0),
    image: String(it.image ?? ""),
    qty: Math.max(1, Math.floor(Number(it.qty ?? 1))),
    categoryId: Number(it.categoryId ?? 0),
  };
}

function normalizeShippingFromApi(raw: unknown): IPurchaseShippingSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const address = String(o.address ?? "").trim();
  const phone = String(o.phone ?? "").trim();
  let lat: number | undefined;
  let lng: number | undefined;
  if (o.lat != null && o.lng != null) {
    const la = Number(o.lat);
    const lo = Number(o.lng);
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      lat = la;
      lng = lo;
    }
  }
  if (!address && !phone && lat === undefined) return null;
  const base: IPurchaseShippingSnapshot = { address, phone };
  if (lat !== undefined && lng !== undefined) {
    return { ...base, lat, lng };
  }
  return base;
}

function mapApiRecord(r: ApiPurchaseRecord): IPurchaseRecord | null {
  if (!r?.id || !r?.clientUserId || !r?.createdAt) return null;
  const items: ICartItem[] = [];
  if (Array.isArray(r.items)) {
    for (const row of r.items) {
      const it = normalizeItem(row);
      if (it) items.push(it);
    }
  }
  const t = r.totals ?? {};
  const totals: ICartTotals = {
    subtotal: normalizeMoney(t.subtotal),
    shipping: normalizeMoney(t.shipping),
    taxes: normalizeMoney(t.taxes),
    total: normalizeMoney(t.total),
  };
  return {
    id: r.id,
    userId: r.clientUserId,
    createdAt:
      typeof r.createdAt === "string"
        ? r.createdAt
        : new Date(r.createdAt).toISOString(),
    items,
    totals,
    shipping: normalizeShippingFromApi(r.shipping),
    status:
      r.status === "completada_simulada"
        ? "completada_simulada"
        : "completada_simulada",
  };
}

/** Historial desde Postgres (más reciente primero en el servidor). */
export async function fetchPurchasesByUserId(
  userId: string,
): Promise<IPurchaseRecord[]> {
  const res = await axios.get<ApiPurchaseRecord[]>(
    `${purchasesBase()}/user/${encodeURIComponent(userId)}`,
    { headers: mergeApiHeaders() },
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return list
    .map(mapApiRecord)
    .filter((x): x is IPurchaseRecord => x !== null);
}

/** Compra puntual por id, sin sesión (la usa la página pública /envio/[id]). */
export async function fetchPurchaseById(
  id: string,
): Promise<IPurchaseRecord | null> {
  const safeId = (id ?? "").toString().trim();
  if (!safeId) return null;
  try {
    const res = await axios.get<ApiPurchaseRecord>(
      `${purchasesBase()}/${encodeURIComponent(safeId)}`,
      { headers: mergeApiHeaders() },
    );
    return mapApiRecord(res.data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/**
 * Registra la compra en el servidor (sin datos de tarjeta).
 */
export async function recordPurchase(
  userId: string,
  userEmail: string,
  items: ICartItem[],
  totals: ICartTotals,
  shipping?: IPurchaseShippingSnapshot | null,
): Promise<IPurchaseRecord> {
  const payload: Record<string, unknown> = {
    clientUserId: userId,
    userEmail,
    items: items.map((it) => ({ ...it })),
    totals: { ...totals },
  };
  if (shipping != null) {
    payload.shipping = {
      address: shipping.address,
      phone: shipping.phone,
      ...(shipping.lat != null &&
      shipping.lng != null &&
      Number.isFinite(shipping.lat) &&
      Number.isFinite(shipping.lng)
        ? { lat: shipping.lat, lng: shipping.lng }
        : {}),
    };
  }

  const res = await axios.post<ApiPurchaseRecord>(purchasesBase(), payload, {
    headers: mergeApiHeaders(),
  });
  const mapped = mapApiRecord(res.data);
  if (!mapped) {
    throw new Error("Respuesta invalida del servidor.");
  }
  return mapped;
}
