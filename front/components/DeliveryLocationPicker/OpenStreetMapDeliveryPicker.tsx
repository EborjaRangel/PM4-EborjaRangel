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
import { createMyAddress } from "@/lib/addressApi";

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

  /**
   * Si el navegador / dispositivo tiene activada la geolocalización, intenta
   * centrar el mapa en la posición actual al entrar. Si el permiso está
   * "denied", o el usuario lo rechaza, o falla por timeout / sin sensor, se
   * deja silenciosamente el centro por defecto. Nunca insistimos.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) return;

    let cancelled = false;

    const requestPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const { latitude, longitude } = pos.coords;
          setMarker({ lat: latitude, lng: longitude });
          setMapZoom(16);
          void reverseGeocode(latitude, longitude);
        },
        () => {
          // Permiso rechazado / timeout / sin GPS: no hacemos nada.
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
      );
    };

    const permissionsApi = (navigator as Navigator & {
      permissions?: {
        query: (q: { name: PermissionName }) => Promise<PermissionStatus>;
      };
    }).permissions;

    if (permissionsApi?.query) {
      permissionsApi
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (cancelled) return;
          if (status.state === "denied") return; // no prompt, no fetch
          requestPosition();
        })
        .catch(() => {
          // Si Permissions API falla, probamos sin más.
          requestPosition();
        });
    } else {
      requestPosition();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [street, setStreet] = useState("");
  const [exterior, setExterior] = useState("");
  const [colony, setColony] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [betweenA, setBetweenA] = useState("");
  const [betweenB, setBetweenB] = useState("");

  const [label, setLabel] = useState("Casa");
  const [phoneAddress, setPhoneAddress] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const [cpQuery, setCpQuery] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  // Pre-rellena el teléfono con el del perfil al montar.
  useEffect(() => {
    const u = getCurrentUser();
    if (u && !phoneAddress) {
      setPhoneAddress(u.phone ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          setSaveErr(data.message ?? "No se pudo leer la dirección.");
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
      setSaveErr("Ingresa un código postal válido (4 o 5 dígitos).");
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
          : "Revisa los datos de la dirección.";
      setSaveErr(msg);
      return;
    }

    const phoneClean = phoneAddress.trim();
    if (phoneClean.length < 6) {
      setSaveErr("Indica un teléfono de contacto (mínimo 6 dígitos).");
      return;
    }

    // Guarda como nueva dirección del usuario en el backend.
    const created = await createMyAddress({
      label: label.trim() || "Sin etiqueta",
      address: composed,
      phone: phoneClean,
      lat: marker.lat,
      lng: marker.lng,
      isDefault: setAsDefault,
    });
    if (!created.ok) {
      setSaveErr(created.message);
      return;
    }

    // Mantén también el "user.address/phone" como fallback (compatibilidad
    // con compras existentes que toman la dirección del perfil).
    await updateCurrentUserAddressOnly(composed);

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
            Buscar dirección o lugar en el Mapa
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

          <div className="border-t border-[#1877F2]/10 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1877F2]">
              Datos de esta dirección
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Etiqueta (alias)
                </span>
                <input
                  className={PULSE.input}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Casa, Oficina, Mamá…"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-[#65676B]">
                  Teléfono de contacto
                </span>
                <input
                  className={PULSE.input}
                  value={phoneAddress}
                  onChange={(e) => setPhoneAddress(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  inputMode="tel"
                />
              </label>
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-[#1C1E21]">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[#1877F2]"
              />
              <span>Marcar como dirección predeterminada</span>
            </label>
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
              Dirección agregada a tu lista.{" "}
              <Link href="/profile" className={PULSE.link}>
                Ver mis direcciones
              </Link>
              {" · "}
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
            {loggedIn ? "Agregar dirección de envío" : "Inicia sesión para guardar"}
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
          Mapa: toca o arrastra el PIN para seleccionar lugar de Envío.
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
