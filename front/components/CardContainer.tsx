"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Card from "./card";
import { mockProducts } from "@/data/mockProducts";
import { IProduct } from "@/interfaces/product.interface";
import { PULSE } from "@/lib/pulse";
import { CATALOG_UPDATED_EVENT, getCatalogProducts } from "@/lib/productCatalog";

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

function CardContainer() {
  const [products, setProducts] = useState<IProduct[]>(mockProducts);

  useEffect(() => {
    const sync = () => setProducts(getCatalogProducts());
    sync();
    window.addEventListener(CATALOG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, sync);
  }, []);

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p: IProduct) => (
        <Card
          key={p.id}
          className={`group overflow-hidden ${PULSE.cardTight} border-[#1877F2]/12 p-0 transition hover:-translate-y-1 hover:border-[#1877F2]/25 hover:shadow-[0_12px_40px_rgba(24,119,242,0.15)]`}
          style={{ marginBottom: 0 }}
        >
          <div className="flex flex-col items-start">
            <div className="relative h-60 w-full">
              <CatalogImage src={p.image} alt={p.name} />
            </div>

            <div className="w-full p-5 text-left">
              <h3 className="m-0 text-lg font-semibold text-[#1C1E21]">
                {p.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-[#65676B]">
                {p.description}
              </p>
              <p className="mt-4 text-lg font-bold text-[#1877F2]">
                ${p.price.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-[#65676B]">
                Stock: {p.stock} unidades
              </p>
            </div>

            <div className="flex w-full justify-end px-5 pb-5">
              <button
                type="button"
                className="h-10 w-36 rounded-full bg-[#1877F2] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(24,119,242,0.35)] transition hover:brightness-105"
              >
                Comprar
              </button>
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}

export default CardContainer;
