"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ICategory } from "@/interfaces/category.interface";
import { fetchProductCategories } from "@/lib/productCategoriesApi";
import { PRODUCT_CATEGORIES } from "@/data/productCategories";
import {
  landingCategoryCoverImage,
  LANDING_CATEGORY_COVER_FALLBACK,
} from "@/lib/landingCategoryCover";

/** Todas las tarjetas del carrusel llevan al catálogo (ruta `/home`). */
const CATEGORY_MARQUEE_TARGET = "/home" as const;

/** Visible en cada foto; se reparte por orden de categorías en BD. */
const PROMO_TAGS = [
  "Liquidaciones",
  "Ofertas",
  "HOT SALE",
  "PROMOCIONES 2 X 1",
  "Descuentos",
  "Pago a meses",
  "Pago a crédito",
  "Liquidaciones",
] as const;

const CARD =
  "group relative z-10 block w-[min(68vw,168px)] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[#1877F2]/12 bg-[#0a1628]/5 shadow-[0_4px_16px_rgba(24,119,242,0.07)] transition hover:border-[#1877F2]/28 hover:shadow-[0_8px_22px_rgba(24,119,242,0.12)] sm:w-[min(34vw,200px)] active:brightness-[1.03]";

const SKELETON_CARD =
  "aspect-[2/1] w-[min(68vw,168px)] shrink-0 animate-pulse rounded-lg border border-[#1877F2]/10 bg-[#E7F3FF]/60 sm:w-[min(34vw,200px)]";

function SlideCard({
  coverSrc,
  name,
  promoTag,
}: {
  coverSrc: string;
  name: string;
  promoTag: string;
}) {
  const [displaySrc, setDisplaySrc] = useState(coverSrc);
  const usedFallbackRef = useRef(false);

  useEffect(() => {
    usedFallbackRef.current = false;
    setDisplaySrc(coverSrc);
  }, [coverSrc]);

  return (
    <Link
      href={CATEGORY_MARQUEE_TARGET}
      prefetch
      scroll
      aria-label={`${promoTag}. Ir al catálogo: ${name}`}
      role="listitem"
      className={CARD}
    >
      <div className="relative aspect-[2/1] w-full">
        <Image
          src={displaySrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 68vw, 200px"
          className="object-cover transition duration-300 group-hover:scale-105"
          onError={() => {
            if (usedFallbackRef.current) return;
            usedFallbackRef.current = true;
            setDisplaySrc(LANDING_CATEGORY_COVER_FALLBACK);
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
          aria-hidden
        />
        <div className="absolute left-1.5 right-1.5 top-1 flex justify-start sm:left-2 sm:right-2 sm:top-1.5">
          <span
            className="line-clamp-2 max-w-full rounded-full bg-[#1877F2] px-1.5 py-0.5 text-left align-top text-[8px] font-bold uppercase leading-tight tracking-wide text-white shadow-[0_2px_8px_rgba(24,119,242,0.45)] ring-1 ring-white/20 sm:px-2 sm:text-[10px]"
            title={promoTag}
          >
            {promoTag}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 sm:px-2.5 sm:py-2">
          <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-xs">
            {name}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Carrusel desde API de categorías; imágenes asignadas de forma estable por `id`. */
export default function CategoryPromoMarquee() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.prefetch(CATEGORY_MARQUEE_TARGET);
  }, [router]);

  const load = useCallback(async () => {
    try {
      const list = await fetchProductCategories();
      const sorted = [...list]
        .filter((c): c is ICategory => c != null && Number.isFinite(c.id) && c.id >= 1 && Boolean(c?.name?.trim()))
        .sort((a, b) => a.id - b.id);
      setCategories(sorted);
    } catch {
      const fallback = PRODUCT_CATEGORIES.map((c) => ({ id: c.id, name: c.name }));
      setCategories(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onVisible() {
      if (typeof document !== "undefined" && document.visibilityState === "visible") void load();
    }
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const slides = useMemo(
    () =>
      categories.map((cat, index) => ({
        catId: cat.id,
        name: cat.name.trim(),
        coverSrc: landingCategoryCoverImage(cat.id),
        promoTag: PROMO_TAGS[index % PROMO_TAGS.length],
      })),
    [categories]
  );

  const doubled = useMemo(() => [...slides, ...slides], [slides]);

  const durationSec = Math.max(32, slides.length * 9);

  if (loading && slides.length === 0) {
    return (
      <div className="-mx-1 flex gap-2 overflow-hidden pb-1.5 pt-0.5 sm:gap-3" aria-busy aria-label="Cargando categorías">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={SKELETON_CARD} />
        ))}
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <p className="pb-2 text-center text-xs text-[#65676B]">
        Aún no hay categorías cargadas desde el servidor.
      </p>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-category-marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .pulse-category-marquee__track {
          width: max-content;
          animation: pulse-category-marquee-ltr ${durationSec}s linear infinite;
          will-change: transform;
        }
        .pulse-category-marquee:hover .pulse-category-marquee__track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-category-marquee {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            -webkit-mask-image: none !important;
            mask-image: none !important;
          }
          .pulse-category-marquee__track {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="pulse-category-marquee relative isolate overflow-hidden pt-0.5 [-webkit-mask-image:linear-gradient(90deg,transparent,white_20px,white_calc(100%-20px),transparent)] [mask-image:linear-gradient(90deg,transparent,white_20px,white_calc(100%-20px),transparent)]"
      >
        <div
          className="pulse-category-marquee__track flex gap-2 pb-1.5 sm:gap-3"
          role="list"
          aria-label="Categorías y promociones en movimiento continuo"
        >
          {doubled.map((s, i) => (
            <SlideCard
              key={`marquee-${s.catId}-${i}`}
              coverSrc={s.coverSrc}
              name={s.name}
              promoTag={s.promoTag}
            />
          ))}
        </div>
      </div>
    </>
  );
}
