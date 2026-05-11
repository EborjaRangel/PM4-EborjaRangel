"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import {
  BUILT_IN_ADMIN_EMAIL,
  BUILT_IN_ADMIN_PASSWORD,
  getCurrentUser,
} from "@/lib/authStorage";
import { addAdminProduct, fetchProducts, MAX_PRODUCT_IMAGES } from "@/lib/productCatalog";
import { IProduct } from "@/interfaces/product.interface";
import { fetchProductCategories } from "@/lib/productCategoriesApi";
import { ICategory } from "@/interfaces/category.interface";

const EMPTY_IMAGES: string[] = Array.from({ length: MAX_PRODUCT_IMAGES }, () => "");

export default function AdminProductsAltaPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryId, setCategoryId] = useState("1");
  const [images, setImages] = useState<string[]>(EMPTY_IMAGES);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionAdds, setSessionAdds] = useState<IProduct[]>([]);
  const [catalogCount, setCatalogCount] = useState<number | null>(null);

  const firstCategoryId = categories[0]?.id ?? 1;

  function updateImageAt(index: number, value: string) {
    setImages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function reloadCatalogCount() {
    try {
      const list = await fetchProducts();
      setCatalogCount(list.length);
    } catch {
      setCatalogCount(0);
    }
  }

  async function reloadCategories() {
    try {
      const list = await fetchProductCategories();
      setCategories(list);
      if (list.length > 0) {
        setCategoryId((prev) => {
          const n = Number.parseInt(prev, 10);
          if (list.some((c) => c.id === n)) return prev;
          return String(list[0].id);
        });
      }
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);

    void reloadCatalogCount();
    void reloadCategories();
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (categories.length === 0) {
      setError("Primero crea una categoría para poder dar de alta productos.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);

    const priceNum = Number(price);
    const stockNum = Number.parseInt(stock, 10);
    const catNum = Number.parseInt(categoryId, 10);

    const cleanImages = images
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const result = await addAdminProduct({
      name,
      description,
      price: priceNum,
      stock: stockNum,
      categoryId: catNum,
      image: cleanImages[0] || undefined,
      images: cleanImages.length > 0 ? cleanImages : undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(`Producto #${result.product.id} guardado en la base de datos.`);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId(String(firstCategoryId));
    setImages(EMPTY_IMAGES);
    setSessionAdds((prev) => [...prev, result.product]);
    void reloadCatalogCount();
  }

  if (!allowed) {
    return (
      <PageShell>
        <p className="text-sm text-[#65676B]">Comprobando acceso…</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-10`}>
        <p className={PULSE.kicker}>ADMINISTRACIÓN · PRODUCTOS</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Alta de productos</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Los productos se guardan en la base de datos a través de{" "}
          <code className="rounded bg-[#F0F2F5] px-1.5 py-0.5 text-xs">
            POST http://localhost:3000/products
          </code>
          .
        </p>

        <p className="mt-3 text-sm text-[#65676B]">
          Catálogo visible en Shop:{" "}
          <strong className="text-[#1C1E21]">
            {catalogCount === null ? "…" : catalogCount}
          </strong>{" "}
          productos ·{" "}
          <Link href="/home" className={PULSE.link}>
            Ver tienda
          </Link>
        </p>

        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Cuenta administrador (PostgreSQL seed):</strong>{" "}
          {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD} — se crea al iniciar la API si aun no
          existe. Úsala para iniciar sesión antes de llegar aquí.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Nombre
            </span>
            <input
              className={PULSE.input}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Ej. Auriculares Pulse Pro"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Descripción
            </span>
            <textarea
              className={`${PULSE.input} min-h-[100px] resize-y`}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              placeholder="Descripción breve del producto"
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Precio (USD)
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={PULSE.input}
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                placeholder="99.99"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
                Stock (unidades)
              </span>
              <input
                type="number"
                min={0}
                step={1}
                className={PULSE.input}
                value={stock}
                onChange={(ev) => setStock(ev.target.value)}
                placeholder="10"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Categoría
            </span>
            <select
              className={PULSE.input}
              value={categoryId}
              onChange={(ev) => setCategoryId(ev.target.value)}
              disabled={categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 ? (
              <p className="mt-2 text-xs text-[#65676B]">
                No hay categorías disponibles. Crea una en{" "}
                <Link href="/admin/products/categorias" className={PULSE.link}>
                  Categorías
                </Link>
                .
              </p>
            ) : null}
          </label>

          <fieldset className="block space-y-3">
            <legend className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Imagenes del producto (hasta {MAX_PRODUCT_IMAGES})
            </legend>
            <p className="text-xs text-[#65676B]">
              La primera URL se usa como portada. Si dejas todo vacio, se asigna una imagen automatica.
            </p>
            <div className="space-y-2">
              {images.map((value, idx) => {
                const isCover = idx === 0;
                return (
                  <input
                    key={idx}
                    type="url"
                    className={PULSE.input}
                    value={value}
                    onChange={(ev) => updateImageAt(idx, ev.target.value)}
                    placeholder={
                      isCover
                        ? "Foto 1 (portada) — https://…"
                        : `Foto ${idx + 1} (opcional) — https://…`
                    }
                    aria-label={
                      isCover
                        ? "URL de la imagen de portada"
                        : `URL de la imagen ${idx + 1}`
                    }
                  />
                );
              })}
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            className={`${PULSE.btnPrimaryBlock} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={submitting || categories.length === 0}
          >
            {submitting ? "Guardando..." : "Guardar producto"}
          </button>
        </form>

        <p className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#65676B]">
          <Link href="/admin/products" className={PULSE.link}>
            ← Admin productos
          </Link>
          <span aria-hidden className="text-[#DADDE1]">
            ·
          </span>
          <Link href="/admin/products/editar" className={PULSE.link}>
            Editar productos
          </Link>
          <span aria-hidden className="text-[#DADDE1]">
            ·
          </span>
          <Link href="/admin/products/categorias" className={PULSE.link}>
            Categorías
          </Link>
          <span aria-hidden className="text-[#DADDE1]">
            ·
          </span>
          <Link href="/admin/products/baja" className={PULSE.link}>
            Baja de productos
          </Link>
        </p>
      </section>

      <section className={`mt-10 ${PULSE.card} p-6 sm:p-10`}>
        <h2 className={PULSE.h2}>Productos dados de alta en esta sesión</h2>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Lista de los productos creados desde este formulario en la sesión actual (ya guardados en la base de datos).
        </p>
        {sessionAdds.length === 0 ? (
          <p className="mt-4 text-sm text-[#65676B]">Aún no hay altas en esta sesión.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#DADDE1] rounded-xl border border-[#DADDE1] bg-white">
            {sessionAdds.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-semibold text-[#1C1E21]">{p.name}</span>
                  <span className="ml-2 text-xs text-[#65676B]">ID {p.id}</span>
                </div>
                <div className="text-sm text-[#65676B]">
                  ${p.price.toFixed(2)} · Stock {p.stock}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
