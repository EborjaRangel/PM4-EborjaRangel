import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function backendOrigin(): string | null {
  const v =
    process.env.PULSE_BACKEND_URL?.trim() ||
    process.env.PULSE_PROXY_TARGET?.trim() ||
    "";
  if (v) return v.replace(/\/$/, "");
  // `next dev`: sin .env.local el proxy no tenía URL y respondía 503. Default al API típico local.
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3000";
  }
  return null;
}

function buildTargetUrl(req: NextRequest, segments: string[]): string | null {
  const base = backendOrigin();
  if (!base) return null;
  const path = segments.length ? `/${segments.join("/")}` : "";
  return `${base}${path}${req.nextUrl.search}`;
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    out.append(key, value);
  });
  return out;
}

async function proxy(req: NextRequest, segments: string[]) {
  const targetUrl = buildTargetUrl(req, segments);
  if (!targetUrl) {
    return NextResponse.json(
      {
        message:
          "Backend no configurado: en Vercel define PULSE_BACKEND_URL con la URL publica del API (sin barra final).",
      },
      { status: 503 },
    );
  }

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardRequestHeaders(req),
      body:
        body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo contactar el backend. Comprueba PULSE_BACKEND_URL y que el API este desplegado y en linea.",
      },
      { status: 502 },
    );
  }

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

type RouteCtx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
}
