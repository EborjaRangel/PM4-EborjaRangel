import { PurchaseRecord } from "../entities/PurchaseRecord";
import { PurchaseRecordRepository } from "../repositories/purchaseRecord.repository";
import { ClientError } from "../utils/errors";
import {
  CreatePurchaseRecordDto,
  PurchaseShippingDto,
} from "../dtos/createPurchaseRecord.dto";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCartItem(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const it = raw as Record<string, unknown>;
  const id = Number(it.id);
  const name = String(it.name ?? "");
  const price = Number(it.price);
  const qty = Number(it.qty);
  if (!Number.isInteger(id) || id < 1) return false;
  if (!name.trim()) return false;
  if (!Number.isFinite(price) || price < 0) return false;
  if (!Number.isInteger(qty) || qty < 1) return false;
  return true;
}

function normalizeShipping(
  raw: PurchaseShippingDto | null | undefined,
):
  | {
      address: string;
      phone: string;
      lat?: number;
      lng?: number;
    }
  | null {
  if (raw === null || raw === undefined) return null;
  if (!raw || typeof raw !== "object") return null;

  const address = String(raw.address ?? "").trim();
  const phone = String(raw.phone ?? "").trim();
  let lat: number | undefined;
  let lng: number | undefined;
  if (raw.lat != null && raw.lng != null) {
    const la = Number(raw.lat);
    const lo = Number(raw.lng);
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      lat = la;
      lng = lo;
    }
  }

  if (!address && !phone && lat === undefined) return null;

  const base = { address, phone };
  return lat !== undefined && lng !== undefined
    ? { ...base, lat, lng }
    : base;
}

export const createPurchaseRecordService = async (
  dto: CreatePurchaseRecordDto
): Promise<PurchaseRecord> => {
  const clientUserId = (dto?.clientUserId ?? "").toString().trim();
  const userEmail = (dto?.userEmail ?? "").toString().trim().toLowerCase();

  if (!clientUserId) {
    throw new ClientError("clientUserId es obligatorio.", 400);
  }
  if (!userEmail || !isValidEmail(userEmail)) {
    throw new ClientError("userEmail no es válido.", 400);
  }

  const items = Array.isArray(dto?.items) ? dto.items : [];
  if (items.length === 0) {
    throw new ClientError("La compra debe incluir al menos un articulo.", 400);
  }
  for (const row of items) {
    if (!normalizeCartItem(row)) {
      throw new ClientError("Formato inválido en artículos del carrito.", 400);
    }
  }

  const t = dto?.totals;
  if (!t || typeof t !== "object") {
    throw new ClientError("totals es obligatorio.", 400);
  }
  const subtotal = Number(t.subtotal);
  const shipping = Number(t.shipping);
  const taxes = Number(t.taxes);
  const total = Number(t.total);
  if (
    !Number.isFinite(subtotal) ||
    !Number.isFinite(shipping) ||
    !Number.isFinite(taxes) ||
    !Number.isFinite(total)
  ) {
    throw new ClientError("totals deben ser números válidos.", 400);
  }

  const record = PurchaseRecordRepository.create({
    clientUserId,
    userEmail,
    items,
    totals: { subtotal, shipping, taxes, total },
    shipping: normalizeShipping(dto.shipping),
    status: "completada_simulada",
  });

  return await PurchaseRecordRepository.save(record);
};

export const getPurchasesByClientUserIdService = async (
  clientUserId: string
): Promise<PurchaseRecord[]> => {
  const id = (clientUserId ?? "").toString().trim();
  if (!id) {
    throw new ClientError("clientUserId es obligatorio.", 400);
  }

  return await PurchaseRecordRepository.find({
    where: { clientUserId: id },
    order: { createdAt: "DESC" },
  });
};

export const getPurchaseByIdService = async (
  id: string
): Promise<PurchaseRecord> => {
  const purchaseId = (id ?? "").toString().trim();
  if (!purchaseId) {
    throw new ClientError("id de compra es obligatorio.", 400);
  }
  const record = await PurchaseRecordRepository.findOneBy({ id: purchaseId });
  if (!record) {
    throw new ClientError("Compra no encontrada.", 404);
  }
  return record;
};
