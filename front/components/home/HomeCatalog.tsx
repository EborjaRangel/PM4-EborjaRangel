"use client";

import dynamic from "next/dynamic";

const CardContainer = dynamic(() => import("@/components/CardContainer"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-sm text-[#65676B]">Cargando catálogo…</p>
  ),
});

export default function HomeCatalog() {
  return <CardContainer />;
}
