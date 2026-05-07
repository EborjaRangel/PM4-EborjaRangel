import axios from "axios";
import type { PublicUser, UserRole } from "@/interfaces/auth.interface";
import { normalizePhoneDigits } from "@/lib/deliveryContact.validation";
import {
  AUTH_TOKEN_LS_KEY,
  LEGACY_CURRENT_USER_KEY,
  LEGACY_USERS_KEY,
  SESSION_PROFILE_LS_KEY,
} from "@/lib/authConstants";
import {
  fetchMyProfileFromApi,
  loginWithApi,
  mapAuthApiError,
  patchMyProfile,
  registerWithApi,
} from "@/lib/authApi";

/** Referencia única para el admin demo del seed en Postgres (`preLoadAdminUser`). */
export const BUILT_IN_ADMIN_EMAIL = "admin@pulse.local";
export const BUILT_IN_ADMIN_PASSWORD = "admin123";

export const AUTH_CHANGED_EVENT = "pulse-auth-changed";

export function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

function canUseStorage() {
  return typeof window !== "undefined";
}

/** Elimina claves donde se guardaban contraseñas en el navegador (versiones anteriores). */
export function migrateLegacyAuthStorage() {
  if (!canUseStorage()) return;
  localStorage.removeItem(LEGACY_USERS_KEY);
  localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_TOKEN_LS_KEY);
}

function setAuthToken(token: string | null) {
  if (!canUseStorage()) return;
  if (token) localStorage.setItem(AUTH_TOKEN_LS_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_LS_KEY);
}

export function normalizeApiRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}

function toIso(raw: unknown, fallback: string): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return fallback;
}

/** Convierte la respuesta del API en el modelo de perfil de la SPA (sin contraseña). */
export function apiUserRecordToPublicUser(
  data: Record<string, unknown>,
): PublicUser {
  const id = String(data.id ?? "").trim();
  const emailNorm = String(data.email ?? "").trim().toLowerCase();
  const nowIso = new Date().toISOString();
  const fullName = String(data.name ?? data.fullName ?? "").trim();
  const loginCountRaw = data.loginCount;
  let loginCount = 0;
  if (typeof loginCountRaw === "number" && Number.isFinite(loginCountRaw)) {
    loginCount = Math.max(0, Math.floor(loginCountRaw));
  } else if (
    typeof loginCountRaw === "string" &&
    Number.isFinite(Number(loginCountRaw))
  ) {
    loginCount = Math.max(0, Math.floor(Number(loginCountRaw)));
  }

  return {
    id,
    fullName,
    email: emailNorm,
    role: normalizeApiRole(data.role),
    address: typeof data.address === "string" ? data.address : "",
    phone:
      typeof data.phone === "string"
        ? normalizePhoneDigits(data.phone)
        : "",
    createdAt: toIso(data.createdAt, nowIso),
    loginCount,
    lastLoginAt: toIso(data.lastLoginAt ?? data.last_login_at, nowIso),
  };
}

/** Guarda sólo datos públicos de sesión + JWT; nunca credenciales. */
export function persistSession(profile: PublicUser, token: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_PROFILE_LS_KEY, JSON.stringify(profile));
  setAuthToken(token);
  notifyAuthChanged();
}

function readSessionProfile(): PublicUser | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(SESSION_PROFILE_LS_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as PublicUser;
    if (!o || typeof o.id !== "string" || typeof o.email !== "string") {
      return null;
    }
    return o;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_PROFILE_LS_KEY);
  setAuthToken(null);
  notifyAuthChanged();
}

export async function refreshSessionProfile(): Promise<boolean> {
  if (!getAuthToken()?.trim()) {
    clearSession();
    return false;
  }
  try {
    const res = await fetchMyProfileFromApi();
    const pub = apiUserRecordToPublicUser(
      res.data as Record<string, unknown>,
    );
    const t = getAuthToken();
    if (!t) return false;
    persistSession(pub, t);
    return true;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const st = e.response?.status;
      if (st === 401 || st === 403) {
        clearSession();
        return false;
      }
      const hadLocal = Boolean(getAuthToken() && getCurrentUser());
      if (!e.response && hadLocal) {
        return true;
      }
      if (typeof st === "number" && st >= 500 && hadLocal) {
        return true;
      }
    }
    clearSession();
    return false;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<
  { ok: true; user: PublicUser } | { ok: false; message: string }
> {
  const pwd = password.trim();
  try {
    const res = await loginWithApi(email, pwd);
    if (!res.data?.login || !res.data.user || !res.data.token) {
      return { ok: false, message: "Respuesta invalida del servidor." };
    }
    const pub = apiUserRecordToPublicUser(
      res.data.user as Record<string, unknown>,
    );
    persistSession(pub, res.data.token.trim());
    return { ok: true, user: pub };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      return { ok: false, message: mapAuthApiError(e) };
    }
    return {
      ok: false,
      message:
        "Sin conexion con el servidor de cuentas. Comprueba el API en marcha.",
    };
  }
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  address = "",
  phone = "",
): Promise<{ ok: true; user: PublicUser } | { ok: false; message: string }> {
  const name = fullName.trim();
  const pwd = password.trim();
  try {
    await registerWithApi({
      name,
      email: email.trim(),
      password: pwd,
      address: address.trim(),
      phone: normalizePhoneDigits(phone),
    });
    const loginRes = await loginWithApi(email, pwd);
    if (!loginRes.data?.login || !loginRes.data.user || !loginRes.data.token) {
      return {
        ok: false,
        message: "Respuesta invalida del servidor.",
      };
    }
    const pub = apiUserRecordToPublicUser(
      loginRes.data.user as Record<string, unknown>,
    );
    persistSession(pub, loginRes.data.token.trim());
    return { ok: true, user: pub };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      return { ok: false, message: mapAuthApiError(e) };
    }
    return {
      ok: false,
      message:
        "Sin conexion con el servidor de cuentas. Comprueba el API en marcha.",
    };
  }
}

export function getCurrentUser(): PublicUser | null {
  return readSessionProfile();
}

export function logoutUser() {
  clearSession();
}

export async function updateCurrentUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!getAuthToken()?.trim()) {
    return { ok: false, message: "No hay sesion activa." };
  }
  try {
    const { data } = await patchMyProfile({
      currentPassword,
      newPassword,
    });
    const pub = apiUserRecordToPublicUser(data as Record<string, unknown>);
    const token = getAuthToken();
    if (!token)
      return { ok: false, message: "No hay sesion activa." };
    persistSession(pub, token);
    return { ok: true };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      return { ok: false, message: mapAuthApiError(e) };
    }
    return { ok: false, message: "No se pudo actualizar la contraseña." };
  }
}

export async function updateCurrentUserContact(
  address: string,
  phone: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!getAuthToken()?.trim()) {
    return { ok: false, message: "No hay sesion activa." };
  }
  try {
    const { data } = await patchMyProfile({
      address: address.trim(),
      phone: normalizePhoneDigits(phone),
    });
    const pub = apiUserRecordToPublicUser(data as Record<string, unknown>);
    const token = getAuthToken();
    if (!token)
      return { ok: false, message: "No hay sesion activa." };
    persistSession(pub, token);
    return { ok: true };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      return { ok: false, message: mapAuthApiError(e) };
    }
    return { ok: false, message: "No se pudo guardar." };
  }
}

export async function updateCurrentUserAddressOnly(
  address: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!getAuthToken()?.trim()) {
    return { ok: false, message: "No hay sesion activa." };
  }
  try {
    const { data } = await patchMyProfile({
      address: address.trim(),
    });
    const pub = apiUserRecordToPublicUser(data as Record<string, unknown>);
    const token = getAuthToken();
    if (!token)
      return { ok: false, message: "No hay sesion activa." };
    persistSession(pub, token);
    return { ok: true };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      return { ok: false, message: mapAuthApiError(e) };
    }
    return { ok: false, message: "No se pudo guardar la direccion." };
  }
}
