"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ValidationError } from "yup";
import {
  getCurrentUser,
  updateCurrentUserAddressOnly,
} from "@/lib/authStorage";
import {
  composeDeliveryAddress,
  DEFAULT_MAP_CENTER,
  type DeliveryAddressParts,
} from "@/lib/deliveryLocationCompose";
import { deliveryAddressYup } from "@/lib/deliveryContact.validation";
import { PULSE } from "@/lib/pulse";

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

export default function OpenStreetMapDeliveryPicker() {
  const router = useRouter();

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const [marker, setMarker] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

  const [street, setStreet] = useState("");
  const [exterior, setExterior] = useState("");
  const [colony, setColony] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [betweenA, setBetweenA] = useState("");
  const [betweenB, setBetweenB] = useState("");

  const [cpQuery, setCpQuery] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  const applyParts = useCallback((parts: DeliveryAddressParts) => {
    setStreet(parts.street);
    setExterior(parts.exterior);
    setColony(parts.colony);
    setPostalCode(parts.postalCode);
    setLocality(parts.locality);
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeoBusy(true);
      try {
        const res = await fetch(
          `/api/geocode/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
        );
        const data = (await res.json()) as
          | { ok: true; parts: DeliveryAddressParts }
          | { ok: false; message?: string };
        if (!data.ok) {
          setSaveErr(data.message ?? "No se pudo leer la direccion.");
          return;
        }
        applyParts(data.parts);
        setSaveErr("");
      } catch {
        setSaveErr("Error de red al geocodificar.");
      } finally {
        setGeoBusy(false);
      }
    },
    [applyParts],
  );

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setSaveErr("Escribe al menos 3 caracteres para buscar.");
      return;
    }
    setSaveErr("");
    setGeoBusy(true);
    try {
      const res = await fetch(
        `/api/geocode/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as
        | { ok: true; lat: number; lng: number; parts: DeliveryAddressParts }
        | { ok: false; message?: string };
      if (!data.ok) {
        setSaveErr(data.message ?? "Sin resultados.");
        return;
      }
      setMarker({ lat: data.lat, lng: data.lng });
      setMapZoom(17);
      applyParts(data.parts);
    } catch {
      setSaveErr("Error de red en la busqueda.");
    } finally {
      setGeoBusy(false);
    }
  }

  async function handlePostalSearch() {
    const digits = cpQuery.replace(/\D/g, "").slice(0, 5);
    if (digits.length < 4) {
      setSaveErr("Ingresa un codigo postal valido (4 o 5 digitos).");
      return;
    }
    await runSearch(`${digits}, México`);
  }

  function handleMapPick(lat: number, lng: number) {
    setMarker({ lat, lng });
    setMapZoom(17);
    void reverseGeocode(lat, lng);
  }

  async function handleSaveAddress() {
    setSaveErr("");
    setSaveOk(false);

    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const composed = composeDeliveryAddress({
      street,
      exterior,
      colony,
      postalCode,
      locality,
      betweenA,
      betweenB,
    });

    try {
      await deliveryAddressYup.validate(composed);
    } catch (e) {
      const msg =
        e instanceof ValidationError
          ? e.errors[0] ?? e.message
          : "Revisa los datos de la direccion.";
      setSaveErr(msg);
      return;
    }

    const result = updateCurrentUserAddressOnly(composed);
    if (!result.ok) {
      setSaveErr(result.message);
      return;
    }

    setSaveOk(true);
  }

  const loggedIn = Boolean(getCurrentUser());

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] lg:items-start">
      <div className="space-y-5">
        <div className={PULSE.surfaceMuted}>
          <p className="text-xs font-semibold text-[#65676B]">
            Buscar por código postal (México)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              className={`${PULSE.input} max-w-[140px]`}
              value={cpQuery}
              onChange={(e) =>
                setCpQuery(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="Ej. 06600"
              aria-label="Codigo postal"
            />
            <button
              type="button"
              onClick={() => void handlePostalSearch()}
              disabled={geoBusy}
              className={`${PULSE.btnSecondary} cursor-pointer px-5 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Buscar zona
            </button>
          </div>
        </div>

        <div className={PULSE.surfaceMuted}>
          <p className="text-xs font-semibold text-[#65676B]">
            Buscar dirección o lugar (OpenStreetMap / Nominatim)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              className={`${PULSE.input} min-w-[200px] flex-1`}
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              placeholder="Ej. Reforma 222, Ciudad de México"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runSearch(addressQuery);
                }
              }}
            />
            <button
              type="button"
              onClick={() => void runSearch(addressQuery)}
              disabled={geoBusy}
              className={`${PULSE.btnSecondary} cursor-pointer px-5 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#1877F2]/12 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
            Dirección detectada (editable)
          </p>
          <label className="block">
            <span className="mb-1 block text-xs text-[#65676B]">Calle</span>
            <input
              className={PULSE.input}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Número exterior
              </span>
              <input
                className={PULSE.input}
                value={exterior}
                onChange={(e) => setExterior(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">Colonia</span>
              <input
                className={PULSE.input}
                value={colony}
                onChange={(e) => setColony(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Código postal
              </span>
              <input
                className={PULSE.input}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[#65676B]">
                Ciudad / alcaldía
              </span>
              <input
                className={PULSE.input}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </label>
          </div>

          <div className="border-t border-[#1877F2]/10 pt-4">
            <p className="mb-2 text-xs font-semibold text-[#65676B]">
              Entre qué calles (opcional)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Calle 1
                </span>
                <input
                  className={PULSE.input}
                  value={betweenA}
                  onChange={(e) => setBetweenA(e.target.value)}
                  placeholder="Ej. Insurgentes"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Calle 2
                </span>
                <input
                  className={PULSE.input}
                  value={betweenB}
                  onChange={(e) => setBetweenB(e.target.value)}
                  placeholder="Ej. Chapultepec"
                />
              </label>
            </div>
          </div>

          {geoBusy ? (
            <p className="text-xs text-[#65676B]">Consultando ubicacion...</p>
          ) : null}

          {saveErr ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {saveErr}
            </p>
          ) : null}
          {saveOk ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Direccion guardada en tu cuenta.{" "}
              <Link href="/cart" className={PULSE.link}>
                Volver al carrito
              </Link>
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSaveAddress}
            disabled={!loggedIn}
            className={`${PULSE.btnPrimaryBlock} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loggedIn ? "Guardar direccion de entrega" : "Inicia sesion para guardar"}
          </button>
          {!loggedIn ? (
            <Link href="/login" className={`inline-block text-sm ${PULSE.link}`}>
              Ir al login
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className={`text-xs ${PULSE.body}`}>
          Mapa gratuito OpenStreetMap. Toca el mapa o arrastra el pin; la
          direccion se completa con Nominatim (uso educativo, sin tarjeta).
        </p>
        <div className="relative z-0 min-h-[420px] w-full overflow-hidden rounded-2xl border border-[#1877F2]/15 shadow-[0_8px_32px_rgba(24,119,242,0.12)]">
          <MapContainer
            center={[marker.lat, marker.lng]}
            zoom={mapZoom}
            className="h-[420px] w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={marker.lat} lng={marker.lng} zoom={mapZoom} />
            <MapClickHandler onPick={handleMapPick} />
            <Marker
              position={[marker.lat, marker.lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  handleMapPick(ll.lat, ll.lng);
                },
              }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
