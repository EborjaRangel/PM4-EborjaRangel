"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { IPurchaseRecord } from "@/lib/purchaseHistory";
import { PULSE } from "@/lib/pulse";

type Props = {
  order: IPurchaseRecord;
  size?: number;
};

/**
 * QR con la URL pública del envío de este pedido. Al escanearlo desde la
 * cámara del teléfono, abre `/envio/<id>` en el mismo origen donde se está
 * sirviendo el front (en local: localhost:3001 / IP LAN; con ngrok: el túnel).
 */
export default function PurchaseQrCode({ order, size = 168 }: Props) {
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!origin) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[#1877F2]/15 bg-white text-xs text-[#65676B]"
        style={{ width: size, height: size }}
      >
        Generando QR…
      </div>
    );
  }

  const url = `${origin}/envio/${encodeURIComponent(order.id)}`;
  const shortId = order.id.slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1877F2]/15 bg-white p-4 text-center shadow-[0_4px_18px_rgba(24,119,242,0.10)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
        Código QR del envío
      </p>
      <div className="rounded-xl bg-white p-2 ring-1 ring-[#1877F2]/15">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          marginSize={2}
          aria-label={`QR del pedido ${shortId}`}
        />
      </div>
      <p className="max-w-[220px] text-xs text-[#65676B]">
        Escanéalo con la cámara del teléfono para abrir el detalle del envío
        del pedido <strong className="text-[#1C1E21]">#{shortId}</strong>.
      </p>
      <Link
        href={`/envio/${encodeURIComponent(order.id)}`}
        className={`text-xs font-semibold ${PULSE.link}`}
      >
        Ver envío del pedido →
      </Link>
    </div>
  );
}
