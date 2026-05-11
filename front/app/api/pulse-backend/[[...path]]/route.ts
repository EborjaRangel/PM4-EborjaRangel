import { NextRequest, NextResponse } from "next/server";
import { resolveProxyTargetForServer } from "@/lib/apiProxyTarget";

export const dynamic = "force-dynamic";

function backendOrigin(): string {
  return resolveProxyTargetForServer();
}

function buildTarget(pathParts: string[], search: string): string {
  const base = backendOrigin();
  const path = pathParts.filter(Boolean).join("/");
  const url = path ? `${base}/${path}` : base;
  return `${url}${search}`;
}

function outgoingHeaders(req: NextRequest): HeadersInit {
  const origin = backendOrigin();
  const h: Record<string, string> = {
    Accept: req.headers.get("accept") ?? "application/json",
  };
  if (origin.toLowerCase().includes("ngrok")) {
    h["ngrok-skip-browser-warning"] = "true";
  }
  const ct = req.headers.get("content-type");
  if (ct) h["Content-Type"] = ct;
  const auth = req.headers.get("authorization");
  if (auth) h.Authorization = auth;
  const productOp = req.headers.get("x-pulse-product-op");
  if (productOp) h["X-Pulse-Product-Op"] = productOp;
  return h;
}

async function forward(req: NextRequest, pathParts: string[]) {
  const target = buildTarget(pathParts, req.nextUrl.search);
  const method = req.method.toUpperCase();
  try {
    const init: RequestInit = {
      method,
      headers: outgoingHeaders(req),
      cache: "no-store",
    };
    if (!["GET", "HEAD"].includes(method)) {
      init.body = await req.arrayBuffer();
    }
    const res = await fetch(target, init);
    const outHeaders = new Headers();
    const ct = res.headers.get("content-type");
    if (ct) outHeaders.set("content-type", ct);
    return new NextResponse(res.status === 204 ? null : res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
    });
  } catch (e) {
    console.error("[pulse-backend proxy]", target, e);
    return NextResponse.json(
      { message: "No se pudo contactar el API." },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path ?? []);
}
