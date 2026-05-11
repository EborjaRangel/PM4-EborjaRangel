"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PULSE } from "@/lib/pulse";
import {
  deleteMyAddress,
  listMyAddresses,
  markAddressDefault,
  updateMyAddress,
} from "@/lib/addressApi";
import type { IAddress } from "@/interfaces/address.interface";

type Props = {
  /** Si el usuario no tiene direcciones, oculta todo el bloque (no muestra el vacío). */
  hideWhenEmpty?: boolean;
  /** Texto del encabezado, por defecto "Libreta de direcciones". */
  title?: string;
  /** Texto secundario. */
  subtitle?: string;
};

export default function AddressBook({
  hideWhenEmpty = false,
  title,
  subtitle,
}: Props = {}) {
  const [items, setItems] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listMyAddresses();
      setItems(list);
    } catch {
      setError("No se pudieron cargar tus direcciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleSetDefault(id: number) {
    setError("");
    setSuccess("");
    setBusyId(id);
    const r = await markAddressDefault(id);
    setBusyId(null);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setSuccess("Dirección marcada como predeterminada.");
    void reload();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setError("");
    setSuccess("");
    setBusyId(id);
    const r = await deleteMyAddress(id);
    setBusyId(null);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setSuccess("Dirección eliminada.");
    void reload();
  }

  function startEdit(it: IAddress) {
    setEditingId(it.id);
    setEditLabel(it.label);
    setEditAddress(it.address);
    setEditPhone(it.phone);
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (editingId === null) return;
    setBusyId(editingId);
    const r = await updateMyAddress(editingId, {
      label: editLabel.trim() || "Sin etiqueta",
      address: editAddress.trim(),
      phone: editPhone.trim(),
    });
    setBusyId(null);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    setSuccess("Dirección actualizada.");
    setEditingId(null);
    void reload();
  }

  if (hideWhenEmpty && !loading && items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={PULSE.kicker}>MIS DIRECCIONES DE ENVÍO</p>
          <h2 className={`mt-2 ${PULSE.h2}`}>
            {title ?? "Libreta de direcciones"}
          </h2>
          <p className={`mt-2 text-sm ${PULSE.body}`}>
            {subtitle ??
              "Guarda múltiples direcciones (Casa, Oficina, Mamá, etc.) y elige cuál usar al pagar."}
          </p>
        </div>
        <Link
          href="/cart/ubicacion"
          className={`${PULSE.btnSecondary} hidden sm:inline-flex`}
        >
          + Agregar dirección
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-[#65676B]">Cargando direcciones…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#1877F2]/30 bg-[#E7F3FF]/30 p-6 text-center">
          <p className={`text-sm ${PULSE.body}`}>
            Aún no tienes direcciones guardadas.
          </p>
          <Link
            href="/cart/ubicacion"
            className={`${PULSE.btnPrimary} mt-4 inline-flex`}
          >
            Agregar mi primera dirección
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className={`rounded-2xl border ${
                it.isDefault
                  ? "border-[#1877F2] bg-[#E7F3FF]/40"
                  : "border-[#DADDE1] bg-white"
              } p-4`}
            >
              {editingId === it.id ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-[#65676B]">
                      Etiqueta
                    </span>
                    <input
                      className={PULSE.input}
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-[#65676B]">
                      Dirección
                    </span>
                    <textarea
                      className={`${PULSE.input} min-h-[70px]`}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-[#65676B]">
                      Teléfono
                    </span>
                    <input
                      className={PULSE.input}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit()}
                      disabled={busyId === it.id}
                      className={`${PULSE.btnPrimary} px-4 py-2 text-sm disabled:opacity-60`}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className={`${PULSE.btnSecondary} px-4 py-2 text-sm`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1C1E21]">
                        {it.label || "Sin etiqueta"}
                      </p>
                      {it.isDefault ? (
                        <span className="rounded-full bg-[#1877F2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Predeterminada
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`mt-1 whitespace-pre-wrap text-sm ${PULSE.body}`}
                    >
                      {it.address}
                    </p>
                    {it.phone ? (
                      <p className={`mt-1 text-xs ${PULSE.body}`}>
                        Teléfono:{" "}
                        <span className="font-medium text-[#1C1E21]">
                          {it.phone}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    {!it.isDefault ? (
                      <button
                        type="button"
                        onClick={() => void handleSetDefault(it.id)}
                        disabled={busyId === it.id}
                        className="rounded-full border border-[#1877F2] bg-white px-3 py-1.5 text-xs font-semibold text-[#1877F2] transition hover:bg-[#E7F3FF] disabled:opacity-60"
                      >
                        Usar por defecto
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => startEdit(it)}
                      className="rounded-full border border-[#DADDE1] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1E21] transition hover:bg-[#F0F2F5]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(it.id)}
                      disabled={busyId === it.id}
                      className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 sm:hidden">
        <Link
          href="/cart/ubicacion"
          className={`${PULSE.btnSecondary} w-full text-center`}
        >
          + Agregar dirección
        </Link>
      </div>
    </div>
  );
}
