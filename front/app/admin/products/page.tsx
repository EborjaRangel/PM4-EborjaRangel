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
import { PRODUCT_CATEGORIES } from "@/data/productCategories";
import {
  addAdminProduct,
  getAdminOnlyProducts,
  getCatalogProducts,
} from "@/lib/productCatalog";
import { IProduct } from "@/interfaces/product.interface";

export default function AdminProductsPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState(String(PRODUCT_CATEGORIES[0].id));
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminExtras, setAdminExtras] = useState<IProduct[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
    setAdminExtras(getAdminOnlyProducts());
  }, [router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const priceNum = Number(price);
    const stockNum = Number.parseInt(stock, 10);
    const catNum = Number.parseInt(categoryId, 10);

    const result = addAdminProduct({
      name,
      description,
      price: priceNum,
      stock: stockNum,
      categoryId: catNum,
      image: image.trim() || undefined,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(`Producto #${result.product.id} guardado en el catálogo de este navegador.`);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId(String(PRODUCT_CATEGORIES[0].id));
    setImage("");
    setAdminExtras(getAdminOnlyProducts());
  }

  if (!allowed) {
    return (
      <PageShell>
        <p className="text-sm text-[#65676B]">Comprobando acceso…</p>
      </PageShell>
    );
  }

  const totalInCatalog = getCatalogProducts().length;

  return (
    <PageShell>
      <section className={`${PULSE.card} p-8 sm:p-10`}>
        <p className={PULSE.kicker}>ADMINISTRACIÓN</p>
        <h1 className={`mt-2 ${PULSE.h1}`}>Alta de productos</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Los datos se guardan en el arreglo local del navegador (
          <code className="rounded bg-[#F0F2F5] px-1.5 py-0.5 text-xs">localStorage</code>
          ) y se unen al catálogo base. Así puedes añadir artículos sin backend.
        </p>

        <p className="mt-3 text-sm text-[#65676B]">
          Catálogo visible en Shop:{" "}
          <strong className="text-[#1C1E21]">{totalInCatalog}</strong> productos
          ·{" "}
          <Link href="/home" className={PULSE.link}>
            Ver tienda
          </Link>
        </p>

        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Cuenta administrador (demo):</strong>{" "}
          {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD}
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
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1C1E21]">
              URL de imagen (opcional)
            </span>
            <input
              type="url"
              className={PULSE.input}
              value={image}
              onChange={(ev) => setImage(ev.target.value)}
              placeholder="https://… (vacío = imagen automática picsum)"
            />
            <span className="mt-1 block text-xs text-[#65676B]">
              Si la dejas vacía, se asigna una imagen estable según el ID del producto.
            </span>
          </label>

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

          <button type="submit" className={PULSE.btnPrimaryBlock}>
            Guardar producto
          </button>
        </form>
      </section>

      <section className={`mt-10 ${PULSE.card} p-8 sm:p-10`}>
        <h2 className={PULSE.h2}>Productos dados de alta manualmente</h2>
        <p className={`mt-2 text-sm ${PULSE.body}`}>
          Solo los que añadiste en esta sesión de administrador (no incluye el catálogo base).
        </p>
        {adminExtras.length === 0 ? (
          <p className="mt-4 text-sm text-[#65676B]">Aún no hay altas manuales.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#DADDE1] rounded-xl border border-[#DADDE1] bg-white">
            {adminExtras.map((p) => (
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
