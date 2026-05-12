"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import {
  BUILT_IN_ADMIN_EMAIL,
  BUILT_IN_ADMIN_PASSWORD,
  getCurrentUser,
} from "@/lib/authStorage";
import {
  fetchProductById,
  fetchProducts,
  MAX_PRODUCT_IMAGES,
  updateAdminProduct,
} from "@/lib/productCatalog";
import { IProduct } from "@/interfaces/product.interface";
import { fetchProductCategories } from "@/lib/productCategoriesApi";
import { ICategory } from "@/interfaces/category.interface";
import { formatPrice } from "@/lib/formatPrice";

const EMPTY_IMAGES: string[] = Array.from({ length: MAX_PRODUCT_IMAGES }, () => "");

function productImagesToSlots(p: IProduct): string[] {
  const slots = [...EMPTY_IMAGES];
  const list =
    p.images && p.images.length > 0
      ? p.images
      : p.image
        ? [p.image]
        : [];
  list.slice(0, MAX_PRODUCT_IMAGES).forEach((u, i) => {
    slots[i] = u ?? "";
  });
  return slots;
}

export default function EditarProductosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);
  const [catalog, setCatalog] = useState<IProduct[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);
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
  const [appliedQueryId, setAppliedQueryId] = useState(false);
  const saveInFlight = useRef(false);
  const firstCategoryId = categories[0]?.id ?? 1;

  function updateImageAt(index: number, value: string) {
    setImages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function loadCatalog() {
    setCatalogError("");
    try {
      const list = await fetchProducts();
      setCatalog([...list].sort((a, b) => a.id - b.id));
    } catch {
      setCatalog([]);
      setCatalogError("No se pudo cargar el catálogo. Revisa que la API esté activa.");
    }
  }

  async function loadCategories() {
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
    void loadCatalog();
    void loadCategories();
  }, [router]);

  useEffect(() => {
    const raw = searchParams.get("id");
    if (!raw || appliedQueryId || catalog.length === 0) return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isInteger(n) || n < 1) return;
    const exists = catalog.some((p) => p.id === n);
    if (exists) {
      setSelectedId(String(n));
      setAppliedQueryId(true);
    }
  }, [searchParams, catalog, appliedQueryId]);

  useEffect(() => {
    if (!selectedId) {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId(String(firstCategoryId));
      setImages(EMPTY_IMAGES);
      return;
    }

    const idNum = Number.parseInt(selectedId, 10);
    if (!Number.isInteger(idNum) || idNum < 1) return;

    let cancelled = false;
    setLoadingProduct(true);
    setError("");
    setSuccess("");

    void (async () => {
      try {
        const p = await fetchProductById(idNum);
        if (cancelled) return;
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setStock(String(p.stock));
        setCategoryId(String(p.categoryId));
        setImages(productImagesToSlots(p));
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar ese producto.");
          setName("");
          setDescription("");
          setPrice("");
          setStock("");
          setImages(EMPTY_IMAGES);
        }
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, firstCategoryId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saveInFlight.current) return;
    if (categories.length === 0) {
      setError("Primero crea una categoría para poder editar productos.");
      return;
    }
    setError("");
    setSuccess("");

    const idNum = Number.parseInt(selectedId, 10);
    if (!Number.isInteger(idNum) || idNum < 1) {
      setError("Elige un producto para editar.");
      return;
    }

    saveInFlight.current = true;
    setSubmitting(true);

    try {
      const priceNum = Number(price);
      const stockNum = Number.parseInt(stock, 10);
      const catNum = Number.parseInt(categoryId, 10);

      const cleanImages = images
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      const result = await updateAdminProduct(idNum, {
        name,
        description,
        price: priceNum,
        stock: stockNum,
        categoryId: catNum,
        image: cleanImages[0] || undefined,
        images: cleanImages.length > 0 ? cleanImages : undefined,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(`Producto #${result.product.id} actualizado.`);
      setCatalog((prev) => {
        const next = prev.map((p) => (p.id === result.product.id ? result.product : p));
        return next.length ? next : [result.product];
      });
      setImages(productImagesToSlots(result.product));
    } finally {
      setSubmitting(false);
      saveInFlight.current = false;
    }
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
        <h1 className={`mt-2 ${PULSE.h1}`}>Editar productos</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Elige un producto del catálogo y actualiza nombre, descripción, categoría, precio, stock e
          URLs de imágenes. Los cambios se guardan con{" "}
          <code className="rounded bg-[#F0F2F5] px-1.5 py-0.5 text-xs">
            POST /products (JSON con pulseUpdateId)
          </code>
          .
        </p>

        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Cuenta administrador (PostgreSQL seed):</strong>{" "}
          {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD}
        </div>

        {catalogError ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {catalogError}
          </p>
        ) : null}

        <div className="mt-8 max-w-xl space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              Producto a editar
            </span>
            <select
              className={PULSE.input}
              value={selectedId}
              onChange={(ev) => setSelectedId(ev.target.value)}
              disabled={catalog.length === 0 && !catalogError}
            >
              <option value="">
                {catalog.length === 0 ? "No hay productos cargados" : "Elige un producto…"}
              </option>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.name} (${formatPrice(p.price)})
                </option>
              ))}
            </select>
          </label>

          {loadingProduct ? (
            <p className="text-sm text-[#65676B]">Cargando datos del producto…</p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">Nombre</span>
            <input
              className={PULSE.input}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Ej. Auriculares Pulse Pro"
              required
              disabled={!selectedId || loadingProduct}
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
              disabled={!selectedId || loadingProduct}
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
                disabled={!selectedId || loadingProduct}
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
                disabled={!selectedId || loadingProduct}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">Categoría</span>
            <select
              className={PULSE.input}
              value={categoryId}
              onChange={(ev) => setCategoryId(ev.target.value)}
              disabled={!selectedId || loadingProduct}
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
              Imágenes del producto (hasta {MAX_PRODUCT_IMAGES})
            </legend>
            <p className="text-xs text-[#65676B]">
              La primera URL es la portada. Si dejas los campos vacíos, se mantienen las URLs que ya
              tenía el producto en la base.
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
                    disabled={!selectedId || loadingProduct}
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
            disabled={submitting || !selectedId || loadingProduct || categories.length === 0}
          >
            {submitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>

        <p className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#65676B]">
          <Link href="/admin/products" className={PULSE.link}>
            ← Admin productos
          </Link>
          <span aria-hidden className="text-[#DADDE1]">
            ·
          </span>
          <Link href="/admin/products/alta" className={PULSE.link}>
            Alta
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
            Baja
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
