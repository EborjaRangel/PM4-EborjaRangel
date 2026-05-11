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
import {
  createProductCategory,
  deleteProductCategory,
  fetchProductCategories,
  updateProductCategory,
} from "@/lib/productCategoriesApi";
import { ICategory } from "@/interfaces/category.interface";

export default function AdminProductCategoriesPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const list = await fetchProductCategories();
      setCategories(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedId((prev) => {
          const n = Number.parseInt(prev, 10);
          const found = list.find((c) => c.id === n) ?? first;
          setEditName(found.name);
          return String(found.id);
        });
      } else {
        setSelectedId("");
        setEditName("");
      }
    } catch {
      setCategories([]);
      setError("No se pudo cargar la lista de categorías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
    void loadCategories();
  }, [router]);

  useEffect(() => {
    const id = Number.parseInt(selectedId, 10);
    if (!Number.isInteger(id) || id < 1) return;
    const found = categories.find((c) => c.id === id);
    if (found) setEditName(found.name);
  }, [selectedId, categories]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    const result = await createProductCategory(newName);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(`Categoría creada: ${result.category.name}`);
    setNewName("");
    await loadCategories();
    setSelectedId(String(result.category.id));
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const id = Number.parseInt(selectedId, 10);
    if (!Number.isInteger(id) || id < 1) {
      setError("Elige una categoría para editar.");
      return;
    }
    setSaving(true);
    const result = await updateProductCategory(id, editName);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(`Categoría actualizada: ${result.category.name}`);
    await loadCategories();
    setSelectedId(String(result.category.id));
  }

  async function handleDelete(id: number) {
    setError("");
    setSuccess("");
    setDeletingId(id);
    const result = await deleteProductCategory(id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess("Categoría eliminada.");
    await loadCategories();
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
        <h1 className={`mt-2 ${PULSE.h1}`}>Categorías</h1>
        <p className={`mt-2 max-w-2xl ${PULSE.body}`}>
          Da de alta, edita y elimina categorías del catálogo. Luego aparecerán en alta/edición de
          productos para seleccionarlas.
        </p>
        <div
          className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#E7F3FF]/50 px-4 py-3 text-sm text-[#1C1E21]"
          role="note"
        >
          <strong className="font-semibold">Cuenta administrador (PostgreSQL seed):</strong>{" "}
          {BUILT_IN_ADMIN_EMAIL} / {BUILT_IN_ADMIN_PASSWORD}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreate} className={`${PULSE.cardTight} border-[#1877F2]/15 p-5`}>
            <h2 className={PULSE.h2}>Alta de categoría</h2>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">Nombre</span>
              <input
                className={PULSE.input}
                value={newName}
                onChange={(ev) => setNewName(ev.target.value)}
                placeholder="Ej. Hogar inteligente"
                required
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className={`${PULSE.btnPrimaryBlock} mt-4 cursor-pointer disabled:opacity-60`}
            >
              Crear categoría
            </button>
          </form>

          <form onSubmit={handleUpdate} className={`${PULSE.cardTight} border-[#1877F2]/15 p-5`}>
            <h2 className={PULSE.h2}>Editar categoría</h2>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">Categoría</span>
              <select
                className={PULSE.input}
                value={selectedId}
                onChange={(ev) => setSelectedId(ev.target.value)}
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? <option value="">Sin categorías</option> : null}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-[#1C1E21]">Nuevo nombre</span>
              <input
                className={PULSE.input}
                value={editName}
                onChange={(ev) => setEditName(ev.target.value)}
                placeholder="Nuevo nombre"
                required
                disabled={categories.length === 0}
              />
            </label>
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className={`${PULSE.btnPrimaryBlock} mt-4 cursor-pointer disabled:opacity-60`}
            >
              Guardar cambios
            </button>
          </form>
        </div>

        <section className={`mt-8 ${PULSE.cardTight} border-[#1877F2]/15 p-5`}>
          <h2 className={PULSE.h2}>Baja de categorías</h2>
          <p className={`mt-2 text-sm ${PULSE.body}`}>
            Solo se puede eliminar una categoría si no tiene productos asignados.
          </p>
          {loading ? (
            <p className="mt-4 text-sm text-[#65676B]">Cargando categorías…</p>
          ) : categories.length === 0 ? (
            <p className="mt-4 text-sm text-[#65676B]">No hay categorías en la base.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#DADDE1] rounded-xl border border-[#DADDE1] bg-white">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="truncate text-[#1C1E21]">
                    #{c.id} — {c.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(c.id)}
                    disabled={deletingId !== null}
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === c.id ? "Eliminando…" : "Eliminar"}
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
          <Link href="/admin/products/baja" className={PULSE.link}>
            Baja de productos
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
