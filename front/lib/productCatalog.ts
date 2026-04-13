import { IProduct } from "@/interfaces/product.interface";
import { mockProducts, productImageUrlForId } from "@/data/mockProducts";

const EXTRA_PRODUCTS_KEY = "pulse_admin_products";

export const CATALOG_UPDATED_EVENT = "pulse-catalog-updated";

export function notifyCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readExtraProducts(): IProduct[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(EXTRA_PRODUCTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as IProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExtraProducts(products: IProduct[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(EXTRA_PRODUCTS_KEY, JSON.stringify(products));
}

/** Catálogo base (semilla) + productos dados de alta por el administrador en este navegador. */
export function getCatalogProducts(): IProduct[] {
  const extras = readExtraProducts();
  const map = new Map<number, IProduct>();
  for (const p of mockProducts) map.set(p.id, p);
  for (const p of extras) map.set(p.id, p);
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function getNextProductId(): number {
  const all = getCatalogProducts();
  if (!all.length) return 1;
  return Math.max(...all.map((p) => p.id)) + 1;
}

export type NewProductFields = Omit<IProduct, "id" | "image"> & {
  image?: string;
};

export function addAdminProduct(fields: NewProductFields): { ok: true; product: IProduct } | { ok: false; message: string } {
  const name = fields.name.trim();
  const description = fields.description.trim();
  if (!name) return { ok: false, message: "El nombre es obligatorio." };
  if (!description) return { ok: false, message: "La descripción es obligatoria." };
  if (!Number.isFinite(fields.price) || fields.price < 0) {
    return { ok: false, message: "El precio debe ser un número mayor o igual a 0." };
  }
  if (!Number.isInteger(fields.stock) || fields.stock < 0) {
    return { ok: false, message: "El stock debe ser un entero mayor o igual a 0." };
  }
  if (!Number.isInteger(fields.categoryId) || fields.categoryId < 1) {
    return { ok: false, message: "Selecciona una categoría válida." };
  }

  const id = getNextProductId();
  const imageRaw = fields.image?.trim() ?? "";
  const image = imageRaw || productImageUrlForId(id);

  const product: IProduct = {
    id,
    name,
    description,
    price: fields.price,
    stock: fields.stock,
    categoryId: fields.categoryId,
    image,
  };

  const extras = readExtraProducts();
  extras.push(product);
  saveExtraProducts(extras);
  notifyCatalogUpdated();
  return { ok: true, product };
}

export function getAdminOnlyProducts(): IProduct[] {
  return readExtraProducts();
}
