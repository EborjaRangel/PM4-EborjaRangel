import axios from "axios";
import { mockProducts } from "@/data/mockProducts";
import { IProduct } from "@/interfaces/product.interface";
import { mergeApiHeaders } from "@/lib/apiRequestHeaders";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";

function productsBase(): string {
  return `${resolveApiOrigin()}/products`;
}

/**
 * Catálogo real: siempre desde el API (PostgreSQL vía backend).
 * El mock solo si activas explícitamente demos sin API:
 * NEXT_PUBLIC_FALLBACK_MOCK_CATALOG=true
 */
function allowMockCatalogFallback(): boolean {
  return process.env.NEXT_PUBLIC_FALLBACK_MOCK_CATALOG === "true";
}

function mockCatalogSorted(): IProduct[] {
  return [...mockProducts].sort((a, b) => a.id - b.id);
}

function catalogHeaders(): Record<string, string> {
  return mergeApiHeaders({
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  });
}

export const CATALOG_UPDATED_EVENT = "pulse-catalog-updated";

export const MAX_PRODUCT_IMAGES = 5;

/** Evita dos POST /products a la vez (doble envío → duplicado). */
let productsWriteChain: Promise<unknown> = Promise.resolve();

function withProductsWriteLock<T>(run: () => Promise<T>): Promise<T> {
  const done = productsWriteChain.then(
    () => run(),
    () => run(),
  );
  productsWriteChain = done.then(
    () => undefined,
    () => undefined,
  );
  return done;
}

export function notifyCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CATALOG_UPDATED_EVENT));
  }
}

/** Trae el catálogo desde el backend (`GET /products`). */
export async function fetchProducts(): Promise<IProduct[]> {
  try {
    const res = await axios.get<IProduct[]>(productsBase(), {
      headers: catalogHeaders(),
      params: { _: Date.now() },
      timeout: 30_000,
    });
    const data = Array.isArray(res.data) ? res.data : [];
    if (data.length === 0 && allowMockCatalogFallback()) {
      console.warn(
        "[pulse] El API devolvió 0 productos; usando catálogo mock (NEXT_PUBLIC_FALLBACK_MOCK_CATALOG=true).",
      );
      return mockCatalogSorted();
    }
    return data;
  } catch (err: unknown) {
    if (allowMockCatalogFallback()) {
      console.warn(
        "[pulse] No se pudo cargar /products; usando catálogo mock (NEXT_PUBLIC_FALLBACK_MOCK_CATALOG=true).",
        err,
      );
      return mockCatalogSorted();
    }
    throw err;
  }
}

/** Trae un producto por id (`GET /products/:id`). */
export async function fetchProductById(id: number): Promise<IProduct> {
  try {
    const res = await axios.get<IProduct>(`${productsBase()}/${id}`, {
      headers: catalogHeaders(),
      params: { _: Date.now() },
      timeout: 30_000,
    });
    return res.data;
  } catch (err: unknown) {
    if (allowMockCatalogFallback()) {
      const fromMock = mockProducts.find((p) => p.id === id);
      if (fromMock) {
        console.warn(
          `[pulse] Producto ${id} no disponible por API; usando mock (NEXT_PUBLIC_FALLBACK_MOCK_CATALOG=true).`,
          err,
        );
        return fromMock;
      }
    }
    throw err;
  }
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
    const res = await withProductsWriteLock(() =>
      axios.post<IProduct>(productsBase(), body, {
        headers: {
          ...catalogHeaders(),
          "Content-Type": "application/json",
          "X-Pulse-Product-Op": "create",
        },
      }),
    );
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

/** Actualiza con el mismo `POST /products` que el alta; el id va en `pulseUpdateId` dentro del JSON. */
export async function updateAdminProduct(
  id: number,
  fields: NewProductFields
): Promise<{ ok: true; product: IProduct } | { ok: false; message: string }> {
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, message: "ID de producto inválido." };
  }

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
    pulseUpdateId: id,
    name,
    description,
    price: fields.price,
    stock: fields.stock,
    categoryId: fields.categoryId,
    image: cover,
    images: cleanedImages.length > 0 ? cleanedImages : undefined,
  };

  try {
    const res = await withProductsWriteLock(() =>
      axios.post<IProduct>(productsBase(), body, {
        headers: {
          ...catalogHeaders(),
          "Content-Type": "application/json",
          "X-Pulse-Product-Op": "update",
        },
      }),
    );
    notifyCatalogUpdated();
    return { ok: true, product: res.data };
  } catch (err: unknown) {
    let message = "Error actualizando producto.";
    if (axios.isAxiosError(err)) {
      const raw = err.response?.data;
      const data =
        raw && typeof raw === "object" && "message" in raw
          ? (raw as { message?: string })
          : undefined;
      message = data?.message ?? err.message ?? message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { ok: false, message };
  }
}

/** Elimina un producto (`DELETE /products/:id`). */
export async function deleteAdminProduct(
  id: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, message: "ID de producto inválido." };
  }
  try {
    await axios.delete(`${productsBase()}/${id}`, {
      headers: catalogHeaders(),
      validateStatus: (status) =>
        status === 204 || status === 200 || status === 404,
    });
    notifyCatalogUpdated();
    return { ok: true };
  } catch (err: unknown) {
    let message = "No se pudo eliminar el producto.";
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      message = data?.message ?? err.message ?? message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { ok: false, message };
  }
}
