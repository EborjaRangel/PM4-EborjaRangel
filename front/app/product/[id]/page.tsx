"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ConfirmPurchaseModal from "@/components/ConfirmPurchaseModal";
import { PULSE } from "@/lib/pulse";
import { CATALOG_UPDATED_EVENT, fetchProductById } from "@/lib/productCatalog";
import { addToCart } from "@/lib/cartStorage";
import { categoryLabel } from "@/data/productCategories";
import { IProduct } from "@/interfaces/product.interface";

function isAllowedHost(src: string): boolean {
  return (
    src.includes("picsum.photos") ||
    src.includes("images.unsplash.com") ||
    src.includes("source.unsplash.com")
  );
}

interface ProductCarouselProps {
  images: string[];
  alt: string;
}

function ProductCarousel({ images, alt }: ProductCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (total === 0) {
    return (
      <div className="h-80 rounded-2xl border border-[#1877F2]/12 bg-[#E7F3FF]/40" />
    );
  }

  const current = images[Math.min(index, total - 1)];
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="space-y-3">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-[#1877F2]/12 bg-[#E7F3FF]/40 sm:h-96">
        {isAllowedHost(current) ? (
          <Image
            src={current}
            alt={alt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        ) : (
          <img
            src={current}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/85 p-2 text-[#1C1E21] shadow-md transition hover:bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/85 p-2 text-[#1C1E21] shadow-md transition hover:bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {index + 1}/{total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-16 cursor-pointer overflow-hidden rounded-lg border transition ${
                i === index
                  ? "border-[#1877F2] ring-2 ring-[#1877F2]/30"
                  : "border-[#DADDE1] hover:border-[#1877F2]/60"
              }`}
            >
              {isAllowedHost(src) ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductPageById() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id ?? "";
  const productId = Number.parseInt(idParam, 10);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(productId) || productId < 1) {
      setLoading(false);
      setError("ID de producto invalido.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProductById(productId)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Error al cargar el producto.";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!Number.isFinite(productId) || productId < 1) return;

    let cancelled = false;

    function syncFromCatalog() {
      fetchProductById(productId)
        .then((p) => {
          if (cancelled) return;
          setProduct(p);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setProduct(null);
          const message =
            err instanceof Error ? err.message : "Error al cargar el producto.";
          setError(message);
        });
    }

    window.addEventListener(CATALOG_UPDATED_EVENT, syncFromCatalog);
    return () => {
      cancelled = true;
      window.removeEventListener(CATALOG_UPDATED_EVENT, syncFromCatalog);
    };
  }, [productId]);

  const carouselImages = useMemo(() => {
    if (!product) return [];
    const list =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];
    return list.slice(0, 5);
  }, [product]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, 1);
    router.push("/cart");
  }

  function handleBuyClick() {
    if (!product) return;
    setConfirmOpen(true);
  }

  function handleConfirmBuy() {
    if (!product) return;
    addToCart(product, 1);
    setConfirmOpen(false);
    router.push("/checkout");
  }

  if (loading) {
    return (
      <PageShell>
        <p className={`text-center ${PULSE.body}`}>Cargando producto...</p>
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell>
        <section className={`${PULSE.card} p-6 sm:p-10`}>
          <p className={PULSE.kicker}>DETALLE DE PRODUCTO</p>
          <h1 className={`mt-2 ${PULSE.h1}`}>Producto no disponible</h1>
          <p className={`mt-2 text-sm text-red-600`}>
            {error ?? "No encontramos este producto."}
          </p>
          <Link href="/home" className={`mt-6 inline-block ${PULSE.link}`}>
            Volver al catálogo
          </Link>
        </section>
      </PageShell>
    );
  }

  const stockOut = product.stock <= 0;

  return (
    <PageShell>
      <section className={`${PULSE.card} p-6 sm:p-10`}>
        <div className="flex items-center justify-between">
          <p className={PULSE.kicker}>DETALLE DE PRODUCTO</p>
          <Link
            href="/home"
            className="text-sm font-medium text-[#1877F2] hover:text-[#166FE5]"
          >
            ← Volver al catálogo
          </Link>
        </div>

        <article className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ProductCarousel images={carouselImages} alt={product.name} />

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65676B]">
              {categoryLabel(product.categoryId)}
            </p>

            <h1 className="text-3xl font-bold text-[#1C1E21] sm:text-4xl">
              {product.name}
            </h1>

            <p className={`${PULSE.body}`}>{product.description}</p>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1877F2]">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-[#65676B]">
                Impuestos calculados al pagar
              </span>
            </div>

            <p className="text-sm text-[#1C1E21]">
              <span className="font-medium">Stock:</span>{" "}
              {stockOut ? (
                <span className="text-red-600">Agotado</span>
              ) : (
                <span>{product.stock} unidades disponibles</span>
              )}
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stockOut}
                className={`${PULSE.btnSecondary} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                onClick={handleBuyClick}
                disabled={stockOut}
                className={`${PULSE.btnPrimary} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Comprar
              </button>
            </div>
          </div>
        </article>
      </section>

      <ConfirmPurchaseModal
        open={confirmOpen}
        productName={product.name}
        unitPrice={Number(product.price)}
        quantity={1}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmBuy}
      />
    </PageShell>
  );
}
