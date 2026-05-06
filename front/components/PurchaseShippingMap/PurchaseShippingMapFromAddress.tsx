"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { resolveMexicoShippingCoords } from "@/lib/geocodeShipping";
import { PULSE } from "@/lib/pulse";

const PurchaseShippingMap = dynamic(() => import("./PurchaseShippingMap"), {
  ssr: false,
});

type Props = {
  address: string;
  savedLat?: number;
  savedLng?: number;
};

export default function PurchaseShippingMapFromAddress({
  address,
  savedLat,
  savedLng,
}: Props) {
  const hasSaved =
    savedLat != null &&
    savedLng != null &&
    Number.isFinite(savedLat) &&
    Number.isFinite(savedLng);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    hasSaved ? { lat: savedLat!, lng: savedLng! } : null,
  );
  const [phase, setPhase] = useState<"idle" | "resolving" | "done">(() => {
    if (hasSaved) return "done";
    return address.trim().length >= 8 ? "resolving" : "done";
  });

  useEffect(() => {
    if (hasSaved) return;
    const addr = address.trim();
    if (addr.length < 8) {
      setPhase("done");
      return;
    }
    let cancelled = false;
    setPhase("resolving");
    (async () => {
      const r = await resolveMexicoShippingCoords(addr);
      if (!cancelled && r) setCoords(r);
      if (!cancelled) setPhase("done");
    })();
    return () => {
      cancelled = true;
    };
  }, [address, hasSaved]);

  if (coords) {
    return (
      <div className="mt-4">
        <p className="text-xs text-[#65676B]">
          {hasSaved
            ? "Ubicacion al momento de la compra (OpenStreetMap)"
            : "Ubicacion aproximada (OpenStreetMap)"}
        </p>
        <div className="mt-2">
          <PurchaseShippingMap lat={coords.lat} lng={coords.lng} />
        </div>
      </div>
    );
  }

  if (phase === "resolving") {
    return (
      <div className="mt-4 flex h-[220px] items-center justify-center rounded-xl border border-[#1877F2]/10 bg-[#F0F2F5] text-sm text-[#65676B]">
        Buscando ubicacion en el mapa...
      </div>
    );
  }

  if (address.trim().length >= 8) {
    return (
      <p className={`mt-3 text-xs text-[#65676B] ${PULSE.body}`}>
        No se pudo situar la direccion en el mapa automaticamente. Revisa el
        texto de envio o acota calle y codigo postal en tu perfil.
      </p>
    );
  }

  return null;
}
