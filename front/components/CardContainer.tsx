"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "./card";
import { IProduct } from "@/interfaces/product.interface";
import { PULSE } from "@/lib/pulse";
import { CATALOG_UPDATED_EVENT, fetchProducts } from "@/lib/productCatalog";

function CatalogImage({ src, alt }: { src: string; alt: string }) {
  const allowedHost =
    src.includes("picsum.photos") ||
    src.includes("images.unsplash.com") ||
    src.includes("source.unsplash.com");

  if (allowedHost) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    // URLs externas arbitrarias (p. ej. pegadas por el admin): <img> evita restricciones de dominio de next/image.
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  );
}

// Quita acentos y baja a minúsculas para que "Cámara" haga match con "camara".
function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function CardContainer() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data.sort((a, b) => a.id - b.id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cargar productos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sync = () => {
      load();
    };
    window.addEventListener(CATALOG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, sync);
  }, [load]);

  const filteredProducts = useMemo(() => {
    const q = normalizeText(query.trim());
    if (!q) return products;
    return products.filter((p) => {
      const name = normalizeText(p.name ?? "");
      const description = normalizeText(p.description ?? "");
      return name.includes(q) || description.includes(q);
    });
  }, [products, query]);

  if (loading && products.length === 0) {
    return (
      <p className={`text-center ${PULSE.body}`}>Cargando productos...</p>
    );
  }

  if (error && products.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600">
        No se pudieron cargar los productos: {error}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="catalog-search-glow-blobs relative isolate overflow-hidden rounded-2xl bg-white/80 shadow-[0_12px_48px_rgba(24,119,242,0.14)] backdrop-blur-md">
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-[#1877F2]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-2 bg-gradient-to-r from-transparent via-[#1877F2]/15 to-transparent" />

        <div className="relative z-[1] flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-5">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="catalog-search-icon-ring relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1877F2] to-[#4338ca] text-white shadow-[0_6px_20px_rgba(24,119,242,0.45)]"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1877F2]/90">
                  Explora el catálogo
                </p>
                <p className="catalog-search-headline mt-1 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
                  Buscar por nombre o descripción…
                </p>
                <p className="mt-1.5 max-w-xl text-xs font-medium text-[#65676B] sm:text-sm">
                  Escribe palabras clave y filtra al instante — coincide con el{" "}
                  <span className="font-semibold text-[#1877F2]">nombre</span>{" "}
                  y la{" "}
                  <span className="font-semibold text-[#7c3aed]">
                    descripción
                  </span>{" "}
                  de cada producto.
                </p>
              </div>
            </div>

            <label className="relative block w-full sm:max-w-xl">
              <span className="sr-only">Buscar productos</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. auricular · deportes · oferta…"
                className={`${PULSE.input} border-[#1877F2]/25 pr-10 shadow-[inset_0_1px_3px_rgba(24,119,242,0.07)] ring-2 ring-transparent transition focus:border-[#1877F2]/45 focus:ring-[#1877F2]/20`}
                aria-label="Buscar productos por nombre o descripción"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-[#65676B] transition hover:bg-[#F0F2F5] hover:text-[#1C1E21]"
                  aria-label="Limpiar búsqueda"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : null}
            </label>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 rounded-xl border border-[#1877F2]/15 bg-gradient-to-br from-[#E7F3FF]/90 to-white px-4 py-3 sm:items-end sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#65676B]">
              Resultados
            </span>
            <span className="text-2xl font-black tabular-nums tracking-tight text-[#1877F2] sm:text-3xl">
              {filteredProducts.length}
              <span className="text-lg font-bold text-[#65676B]">
                {" "}
                / {products.length}
              </span>
            </span>
            <span className="text-[11px] font-medium text-[#65676B]">
              {query.trim() ? "coincidencias" : "productos en vivo"}
            </span>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="rounded-xl border border-[#DADDE1] bg-[#F0F2F5] px-3 py-3 text-center text-sm text-[#65676B]">
          No encontramos productos que coincidan con &quot;{query}&quot;.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p: IProduct) => (
            <Card
              key={p.id}
              className={`group flex h-full min-h-0 flex-col overflow-hidden ${PULSE.cardTight} border-[#1877F2]/12 p-0 transition hover:-translate-y-1 hover:border-[#1877F2]/25 hover:shadow-[0_12px_40px_rgba(24,119,242,0.15)]`}
              style={{ marginBottom: 0, padding: 0 }}
            >
              <div className="flex h-full min-h-0 flex-col items-stretch pt-4">
                <div className="relative h-60 w-full shrink-0">
                  <CatalogImage src={p.image} alt={p.name} />
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-5 text-left">
                  <h3 className="m-0 text-lg font-semibold text-[#1C1E21]">
                    {p.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#65676B]">
                    {p.description}
                  </p>
                  <p className="mt-4 text-lg font-bold text-[#1877F2]">
                    ${Number(p.price).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#65676B]">
                    Stock: {p.stock} unidades
                  </p>

                  <div className="mt-auto flex w-full justify-end pt-4">
                    <Link
                      href={`/product/${p.id}`}
                      className="inline-flex h-10 w-36 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1877F2] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(24,119,242,0.35)] transition hover:brightness-105"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default CardContainer;
