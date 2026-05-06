import { NextRequest, NextResponse } from "next/server";
import { nominatimAddressToParts } from "@/lib/nominatimParts";

const USER_AGENT = "PULSE-Ecommerce/1.0 (student demo; nominatim proxy)";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json(
      { ok: false as const, message: "Indica lat y lng." },
      { status: 400 },
    );
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false as const, message: "Geocodificacion no disponible." },
        { status: 502 },
      );
    }
    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
      lat?: string;
      lon?: string;
    };

    const parts = nominatimAddressToParts(data.address, data.display_name);

    return NextResponse.json({
      ok: true as const,
      lat: Number(data.lat ?? lat),
      lng: Number(data.lon ?? lng),
      parts,
    });
  } catch {
    return NextResponse.json(
      { ok: false as const, message: "Error al consultar el mapa." },
      { status: 502 },
    );
  }
}
