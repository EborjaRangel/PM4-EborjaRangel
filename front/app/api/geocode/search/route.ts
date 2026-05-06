import { NextRequest, NextResponse } from "next/server";
import { nominatimAddressToParts } from "@/lib/nominatimParts";

const USER_AGENT = "PULSE-Ecommerce/1.0 (student demo; nominatim proxy)";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const street = sp.get("street")?.trim();
  const city = sp.get("city")?.trim();
  const postalcode = sp.get("postalcode")?.trim();
  const wide = sp.get("wide") === "1";

  let nominatimUrl: string;

  if (street || postalcode) {
    const p = new URLSearchParams({
      format: "json",
      limit: "1",
      addressdetails: "1",
      country: "Mexico",
    });
    if (street) p.set("street", street);
    if (city) p.set("city", city);
    if (postalcode) p.set("postalcode", postalcode);
    nominatimUrl = `https://nominatim.openstreetmap.org/search?${p}`;
  } else if (q) {
    const p = new URLSearchParams({
      q,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });
    if (!wide) p.set("countrycodes", "mx");
    nominatimUrl = `https://nominatim.openstreetmap.org/search?${p}`;
  } else {
    return NextResponse.json(
      {
        ok: false as const,
        message:
          "Indica una busqueda (q) o parametros estructurados (street, postalcode, city).",
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(nominatimUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false as const, message: "Busqueda no disponible." },
        { status: 502 },
      );
    }
    const list = (await res.json()) as Array<{
      lat: string;
      lon: string;
      address?: Record<string, string>;
      display_name?: string;
    }>;

    const hit = list[0];
    if (!hit) {
      return NextResponse.json({
        ok: false as const,
        message: "Sin resultados. Prueba otro texto o codigo postal.",
      });
    }

    const parts = nominatimAddressToParts(hit.address, hit.display_name);

    return NextResponse.json({
      ok: true as const,
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      parts,
    });
  } catch {
    return NextResponse.json(
      { ok: false as const, message: "Error al buscar." },
      { status: 502 },
    );
  }
}
