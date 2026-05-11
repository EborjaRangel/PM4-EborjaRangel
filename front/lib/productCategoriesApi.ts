import axios from "axios";
import { mergeApiHeaders } from "@/lib/apiRequestHeaders";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";
import { ICategory } from "@/interfaces/category.interface";

function categoriesBase(): string {
  return `${resolveApiOrigin()}/products/categories`;
}

function categoriesHeaders(): Record<string, string> {
  return mergeApiHeaders({
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Content-Type": "application/json",
  });
}

export async function fetchProductCategories(): Promise<ICategory[]> {
  const res = await axios.get<ICategory[]>(categoriesBase(), {
    headers: categoriesHeaders(),
    params: { _: Date.now() },
    timeout: 30_000,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createProductCategory(
  name: string
): Promise<{ ok: true; category: ICategory } | { ok: false; message: string }> {
  const normalized = name.trim();
  if (!normalized) {
    return { ok: false, message: "El nombre de la categoría es obligatorio." };
  }
  try {
    const res = await axios.post<ICategory>(
      categoriesBase(),
      { name: normalized },
      { headers: categoriesHeaders() }
    );
    return { ok: true, category: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      return { ok: false, message: data?.message ?? err.message };
    }
    return { ok: false, message: "No se pudo crear la categoría." };
  }
}

export async function updateProductCategory(
  id: number,
  name: string
): Promise<{ ok: true; category: ICategory } | { ok: false; message: string }> {
  const normalized = name.trim();
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, message: "ID de categoría inválido." };
  }
  if (!normalized) {
    return { ok: false, message: "El nombre de la categoría es obligatorio." };
  }
  try {
    const res = await axios.put<ICategory>(
      `${categoriesBase()}/${id}`,
      { name: normalized },
      { headers: categoriesHeaders() }
    );
    return { ok: true, category: res.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      return { ok: false, message: data?.message ?? err.message };
    }
    return { ok: false, message: "No se pudo actualizar la categoría." };
  }
}

export async function deleteProductCategory(
  id: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, message: "ID de categoría inválido." };
  }
  try {
    await axios.delete(`${categoriesBase()}/${id}`, {
      headers: categoriesHeaders(),
    });
    return { ok: true };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { message?: string } | undefined;
      return { ok: false, message: data?.message ?? err.message };
    }
    return { ok: false, message: "No se pudo eliminar la categoría." };
  }
}
