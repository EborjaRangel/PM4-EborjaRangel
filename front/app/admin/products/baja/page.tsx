"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import { PULSE } from "@/lib/pulse";
import {
  BUILT_IN_ADMIN_EMAIL,
  BUILT_IN_ADMIN_PASSWORD,
  getCurrentUser,
} from "@/lib/authStorage";
import { deleteAdminProduct, fetchProducts } from "@/lib/productCatalog";
import { IProduct } from "@/interfaces/product.interface";
import { fetchProductCategories } from "@/lib/productCategoriesApi";
import { ICategory } from "@/interfaces/category.interface";
import { formatPrice } from "@/lib/formatPrice";

export default function AdminProductRemovalPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [catalog, setCatalog] = useState<IProduct[] | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function reloadCatalog() {
    try {
      const list = await fetchProducts();
      setCatalog(list);
    } catch {
      setCatalog([]);
    }
  }

  async function reloadCategories() {
    try {
      const list = await fetchProductCategories();
      setCategories(list);
    } catch {
      setCategories([]);
    }
  }

  function categoryLabel(categoryId: number): string {
    return (
      categories.find((c) => c.id === categoryId)?.name ??
      `Categoría ${categoryId}`
    );
  }

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
    void reloadCatalog();
    void reloadCategories();
  }, [router]);

  async function handleDeleteProduct(id: number) {
    if (
      !window.confirm(
        `¿Eliminar el producto #${id} del catálogo? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setError("");
    setDeletingId(id);
    const result = await deleteAdminProduct(id);
    setDeletingId(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    void reloadCatalog();
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
        <h1 className={`mt-2 ${PULSE.h1}`}>Baja de productos</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          La baja es <strong className="text-[#1C1E21]">permanente</strong>: el producto se elimina de la base de datos y{" "}
          <strong className="text-[#1C1E21]">desaparece del catálogo</strong> de la tienda (
          <Link href="/home" className={PULSE.link}>
            Shop
          </Link>
          ), sin reaparecer salvo que lo vuelvas a cargar en{" "}
          <Link href="/admin/products/alta" className={PULSE.link}>
            Alta de productos
          </Link>
          . Si estaba vinculado a un pedido, se desvincula antes de borrarlo.
        </p>

        <p className={`mt-3 max-w-2xl ${PULSE.body}`}>
          Forma parte de{" "}
          <Link href="/admin/products" className={PULSE.link}>
            Admin productos
          </Link>
          . La eliminación en servidor usa{" "}
          <code className="rounded bg-[#F0F2F5] px-1.5 py-0.5 text-xs">
            DELETE /products/:id
          </code>
          .
        </p>

        <p className="mt-3 text-sm text-[#65676B]">
          Productos en catálogo:{" "}
          <strong className="text-[#1C1E21]">
            {catalog === null ? "…" : catalog.length}
          </strong>
          {" · "}
          <Link href="/home" className={PULSE.link}>
            Ver tienda
          </Link>
        </p>

        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Misma sesión que el alta:</strong> necesitas entrar como
          administrador (por ejemplo {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD} si usas el
          seed de la API).
        </div>

        {error ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <section className={`mt-8 ${PULSE.cardTight} border-[#1877F2]/15 p-5 sm:p-6`}>
          <h2 className={PULSE.h2}>Catálogo actual</h2>
          <p className={`mt-2 text-sm ${PULSE.body}`}>
            Listado en vivo desde la API. Al eliminar, el ítem deja de existir para la tienda y se limpia del carrito
            si alguien lo tenía agregado.
          </p>
          {catalog === null ? (
            <p className="mt-4 text-sm text-[#65676B]">Cargando catálogo…</p>
          ) : catalog.length === 0 ? (
            <p className="mt-4 text-sm text-[#65676B]">No hay productos en la base.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#DADDE1] rounded-xl border border-[#DADDE1] bg-white">
              {[...catalog]
                .sort((a, b) => a.id - b.id)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[#1C1E21]">{p.name}</span>
                      <span className="ml-2 text-xs text-[#65676B]">ID {p.id}</span>
                      <p className="mt-0.5 truncate text-xs text-[#65676B]">
                        {categoryLabel(p.categoryId)} · ${formatPrice(p.price)} · Stock{" "}
                        {p.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingId !== null}
                      onClick={() => void handleDeleteProduct(p.id)}
                    >
                      {deletingId === p.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <p className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#65676B]">
          <Link href="/admin/products" className={PULSE.link}>
            ← Admin productos
          </Link>
          <span aria-hidden className="text-[#DADDE1]">
            ·
          </span>
          <Link href="/admin/products/alta" className={PULSE.link}>
            Alta de productos
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
        </p>
      </section>
    </PageShell>
  );
}
