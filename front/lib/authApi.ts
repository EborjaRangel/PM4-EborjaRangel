import axios from "axios";
import {
  AUTH_TOKEN_LS_KEY,
} from "@/lib/authConstants";
import { resolveApiOrigin } from "@/lib/resolveApiOrigin";

function bearerHeaders(): { Authorization?: string } {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem(AUTH_TOKEN_LS_KEY);
  return t?.trim() ? { Authorization: `Bearer ${t.trim()}` } : {};
}

export interface ApiLoginResponse {
  login: boolean;
  user: Record<string, unknown>;
  token: string;
}

export async function loginWithApi(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return axios.post<ApiLoginResponse>(`${resolveApiOrigin()}/users/login`, {
    email: normalizedEmail,
    password,
  });
}

export async function registerWithApi(body: {
  name: string;
  email: string;
  password: string;
  address: string;
  phone: string;
}) {
  return axios.post<Record<string, unknown>>(
    `${resolveApiOrigin()}/users/register`,
    {
      ...body,
      email: body.email.trim().toLowerCase(),
    },
  );
}

export async function fetchMyProfileFromApi() {
  return axios.get<Record<string, unknown>>(`${resolveApiOrigin()}/users/me`, {
    headers: bearerHeaders(),
  });
}

export async function patchMyProfile(body: Record<string, unknown>) {
  return axios.patch<Record<string, unknown>>(
    `${resolveApiOrigin()}/users/me`,
    body,
    {
      headers: bearerHeaders(),
    },
  );
}

export async function fetchAllUsersAdmin() {
  return axios.get<Record<string, unknown>[]>(`${resolveApiOrigin()}/users`, {
    headers: bearerHeaders(),
  });
}

/** Mensaje usable en UI ante error HTTP conocido del API de auth. */
export function mapAuthApiError(err: unknown): string {
  if (!axios.isAxiosError(err) || err.response == null) {
    return "";
  }
  const { data } = err.response as { data?: { message?: string } };
  const msg = (data?.message ?? err.message ?? "").trim();
  const low = msg.toLowerCase();
  if (low.includes("forbidden")) {
    return "No tienes permiso para esta accion.";
  }
  if (low.includes("already exists")) {
    return "Este correo ya esta registrado.";
  }
  if (low.includes("missing fields")) {
    return "Completa todos los campos obligatorios.";
  }
  if (
    low.includes("does not exist") ||
    low.includes("user not found") ||
    low.includes("invalid password")
  ) {
    return "Credenciales incorrectas.";
  }
  if (low.includes("current password")) {
    return "La contraseña actual no coincide.";
  }
  if (low.includes("new password")) {
    return "La nueva contraseña debe tener al menos 6 caracteres.";
  }
  return msg || "No se pudo completar la operacion.";
}
