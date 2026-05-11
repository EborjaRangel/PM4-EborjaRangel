import axios from "axios";
import { AUTH_TOKEN_LS_KEY } from "@/lib/authConstants";
import { mergeApiHeaders } from "@/lib/apiRequestHeaders";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";
import type { IAddress, IAddressInput } from "@/interfaces/address.interface";

function bearerHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem(AUTH_TOKEN_LS_KEY);
  return t?.trim() ? { Authorization: `Bearer ${t.trim()}` } : {};
}

function addressesBase(): string {
  return `${resolveApiOrigin()}/addresses`;
}

function normalizeAddress(raw: unknown): IAddress | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = Number(o.id);
  const userId = Number(o.userId);
  if (!Number.isInteger(id) || !Number.isInteger(userId)) return null;
  return {
    id,
    userId,
    label: String(o.label ?? ""),
    address: String(o.address ?? ""),
    phone: String(o.phone ?? ""),
    lat:
      o.lat === null || o.lat === undefined
        ? null
        : Number.isFinite(Number(o.lat))
          ? Number(o.lat)
          : null,
    lng:
      o.lng === null || o.lng === undefined
        ? null
        : Number.isFinite(Number(o.lng))
          ? Number(o.lng)
          : null,
    isDefault: Boolean(o.isDefault),
    createdAt:
      typeof o.createdAt === "string"
        ? o.createdAt
        : new Date().toISOString(),
  };
}

export async function listMyAddresses(): Promise<IAddress[]> {
  const res = await axios.get<unknown[]>(addressesBase(), {
    headers: mergeApiHeaders(bearerHeaders()),
  });
  const list = Array.isArray(res.data) ? res.data : [];
  return list
    .map(normalizeAddress)
    .filter((x): x is IAddress => x !== null);
}

export async function createMyAddress(
  input: IAddressInput,
): Promise<{ ok: true; address: IAddress } | { ok: false; message: string }> {
  try {
    const res = await axios.post<unknown>(addressesBase(), input, {
      headers: mergeApiHeaders(bearerHeaders()),
    });
    const norm = normalizeAddress(res.data);
    if (!norm) return { ok: false, message: "Respuesta inválida del servidor." };
    return { ok: true, address: norm };
  } catch (err: unknown) {
    return { ok: false, message: extractAxiosMessage(err) };
  }
}

export async function updateMyAddress(
  id: number,
  input: Partial<IAddressInput>,
): Promise<{ ok: true; address: IAddress } | { ok: false; message: string }> {
  try {
    const res = await axios.put<unknown>(`${addressesBase()}/${id}`, input, {
      headers: mergeApiHeaders(bearerHeaders()),
    });
    const norm = normalizeAddress(res.data);
    if (!norm) return { ok: false, message: "Respuesta inválida del servidor." };
    return { ok: true, address: norm };
  } catch (err: unknown) {
    return { ok: false, message: extractAxiosMessage(err) };
  }
}

export async function deleteMyAddress(
  id: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await axios.delete(`${addressesBase()}/${id}`, {
      headers: mergeApiHeaders(bearerHeaders()),
    });
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, message: extractAxiosMessage(err) };
  }
}

export async function markAddressDefault(
  id: number,
): Promise<{ ok: true; address: IAddress } | { ok: false; message: string }> {
  try {
    const res = await axios.post<unknown>(
      `${addressesBase()}/${id}/default`,
      {},
      { headers: mergeApiHeaders(bearerHeaders()) },
    );
    const norm = normalizeAddress(res.data);
    if (!norm) return { ok: false, message: "Respuesta inválida del servidor." };
    return { ok: true, address: norm };
  } catch (err: unknown) {
    return { ok: false, message: extractAxiosMessage(err) };
  }
}

function extractAxiosMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? "Error en el servidor.";
  }
  if (err instanceof Error) return err.message;
  return "Error desconocido.";
}
