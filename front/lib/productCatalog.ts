import axios from "axios";
import { IProduct } from "@/interfaces/product.interface";

export const PRODUCTS_API_URL = "http://localhost:3000/products";

export const CATALOG_UPDATED_EVENT = "pulse-catalog-updated";

export const MAX_PRODUCT_IMAGES = 5;

export function notifyCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
}

/** Trae el catálogo desde el backend (`GET /products`). */
export async function fetchProducts(): Promise<IProduct[]> {
  const res = await axios.get<IProduct[]>(PRODUCTS_API_URL);
  return Array.isArray(res.data) ? res.data : [];
}

/** Trae un producto por id (`GET /products/:id`). */
export async function fetchProductById(id: number): Promise<IProduct> {
  const res = await axios.get<IProduct>(`${PRODUCTS_API_URL}/${id}`);
  return res.data;
}

export type NewProductFields = Omit<IProduct, "id" | "image" | "images"> & {
  image?: string;
  images?: string[];
};

/** Crea un producto contra el backend (`POST /products`). */
export async function addAdminProduct(
  fields: NewProductFields
): Promise<{ ok: true; product: IProduct } | { ok: false; message: string }> {
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

  const cleanedImages = (fields.images ?? [])
    .map((u) => (u ?? "").toString().trim())
    .filter((u) => u.length > 0)
    .slice(0, MAX_PRODUCT_IMAGES);

  if (cleanedImages.length > MAX_PRODUCT_IMAGES) {
    return {
      ok: false,
      message: `Máximo ${MAX_PRODUCT_IMAGES} imágenes por producto.`,
    };
  }

  const cover = fields.image?.trim() || cleanedImages[0] || undefined;

  const body = {
    name,
    description,
    price: fields.price,
    stock: fields.stock,
    categoryId: fields.categoryId,
    image: cover,
    images: cleanedImages.length > 0 ? cleanedImages : undefined,
  };

  try {
    const res = await axios.post<IProduct>(PRODUCTS_API_URL, body);
    notifyCatalogUpdated();
    return { ok: true, product: res.data };
  } catch (err: unknown) {
    let message = "Error guardando producto.";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      message = data?.message ?? err.message ?? message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { ok: false, message };
  }
}
