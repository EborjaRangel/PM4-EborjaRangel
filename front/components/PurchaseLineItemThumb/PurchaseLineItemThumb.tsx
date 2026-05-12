"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

/**
 * Miniatura rectangular alineada junto al precio (pedidos / carrito legacy).
 */
export default function PurchaseLineItemThumb({ src, alt }: Props) {
  const trimmed = (src ?? "").trim();
  if (!trimmed) {
    return (
      <div
        className="h-14 w-14 shrink-0 rounded-lg border border-[#1877F2]/12 bg-[#E7F3FF]/40"
        aria-hidden
      />
    );
  }

  const usesNext =
    trimmed.includes("picsum.photos") ||
    trimmed.includes("images.unsplash.com") ||
    trimmed.includes("source.unsplash.com") ||
    trimmed.includes("loremflickr.com");

  if (usesNext) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#1877F2]/12">
        <Image src={trimmed} alt={alt} fill sizes="56px" className="object-cover" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      className="h-14 w-14 shrink-0 rounded-lg border border-[#1877F2]/12 object-cover"
    />
  );
}
