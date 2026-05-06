"use client";

import { useEffect } from "react";
import { PULSE } from "@/lib/pulse";

interface ConfirmPurchaseModalProps {
  open: boolean;
  productName: string;
  unitPrice: number;
  quantity?: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmPurchaseModal({
  open,
  productName,
  unitPrice,
  quantity = 1,
  onCancel,
  onConfirm,
}: ConfirmPurchaseModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  const total = unitPrice * quantity;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-purchase-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-md ${PULSE.card} p-6 sm:p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={PULSE.kicker}>CONFIRMAR COMPRA</p>
        <h2
          id="confirm-purchase-title"
          className="mt-2 text-xl font-bold text-[#1C1E21]"
        >
          ¿Confirmar compra del producto?
        </h2>

        <div className={`mt-5 ${PULSE.surfaceMuted}`}>
          <p className="text-xs text-[#65676B]">Producto</p>
          <p className="mt-1 font-semibold text-[#1C1E21]">{productName}</p>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[#65676B]">
              Cantidad x {quantity} · ${unitPrice.toFixed(2)} c/u
            </span>
            <span className="font-bold text-[#1877F2]">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <p className={`mt-4 text-sm ${PULSE.body}`}>
          Tras confirmar te llevaremos a la pasarela de pago para finalizar tu
          pedido.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className={`${PULSE.btnGhost} cursor-pointer`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${PULSE.btnPrimary} cursor-pointer`}
          >
            Confirmar y pagar
          </button>
        </div>
      </div>
    </div>
  );
}
