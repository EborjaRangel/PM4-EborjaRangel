import { IUser, PublicUser, UserRole } from "@/interfaces/auth.interface";

const USERS_KEY = "pulse_users";
const CURRENT_USER_KEY = "pulse_current_user_id";

/** Cuenta de demostración creada automáticamente para gestionar el catálogo. */
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

function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}

function normalizeUser(user: IUser): IUser {
  return {
    ...user,
    role: normalizeRole(user.role),
    loginCount: typeof user.loginCount === "number" ? user.loginCount : 1,
    lastLoginAt: user.lastLoginAt || user.createdAt,
  };
}

function readUsers(): IUser[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as IUser[];
    return parsed.map(normalizeUser);
  } catch {
    return [];
  }
}

function saveUsers(users: IUser[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublicUser(user: IUser): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function registerUser(fullName: string, email: string, password: string) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return { ok: false as const, message: "Este correo ya esta registrado." };
  }

  const newUser: IUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: "user",
    createdAt: new Date().toISOString(),
    loginCount: 1,
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  if (canUseStorage()) {
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    notifyAuthChanged();
  }

  return { ok: true as const, user: toPublicUser(newUser) };
}

export function loginUser(email: string, password: string) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const userIndex = users.findIndex(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
  );
  const user = userIndex >= 0 ? users[userIndex] : undefined;

  if (!user) {
    return { ok: false as const, message: "Credenciales incorrectas." };
  }

  users[userIndex] = {
    ...user,
    loginCount: user.loginCount + 1,
    lastLoginAt: new Date().toISOString(),
  };
  saveUsers(users);

  if (canUseStorage()) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    notifyAuthChanged();
  }
  return { ok: true as const, user: toPublicUser(users[userIndex]) };
}

export function getCurrentUser(): PublicUser | null {
  if (!canUseStorage()) return null;
  const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) return null;

  const user = readUsers().find((u) => u.id === currentUserId);
  return user ? toPublicUser(user) : null;
}

export function getAllUsers(): PublicUser[] {
  return readUsers().map(toPublicUser);
}

export function logoutUser() {
  if (!canUseStorage()) return;
  localStorage.removeItem(CURRENT_USER_KEY);
  notifyAuthChanged();
}

/** Garantiza una cuenta administrador local (solo demo). Idempotente. */
export function ensureBuiltInAdminAccount() {
  if (!canUseStorage()) return;
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === BUILT_IN_ADMIN_EMAIL)) return;

  const newUser: IUser = {
    id: crypto.randomUUID(),
    fullName: "Administrador PULSE",
    email: BUILT_IN_ADMIN_EMAIL,
    password: BUILT_IN_ADMIN_PASSWORD,
    role: "admin",
    createdAt: new Date().toISOString(),
    loginCount: 0,
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
}

/** Tres clientes de demostración para el dashboard (contraseña compartida `demo123`). Idempotente. */
const DEMO_CLIENT_SEEDS: {
  fullName: string;
  email: string;
  password: string;
  loginCount: number;
  daysSinceLogin: number;
}[] = [
  {
    fullName: "María García",
    email: "maria.garcia@demo.pulse",
    password: "demo123",
    loginCount: 14,
    daysSinceLogin: 1,
  },
  {
    fullName: "Carlos Vega",
    email: "carlos.vega@demo.pulse",
    password: "demo123",
    loginCount: 6,
    daysSinceLogin: 4,
  },
  {
    fullName: "Ana López",
    email: "ana.lopez@demo.pulse",
    password: "demo123",
    loginCount: 9,
    daysSinceLogin: 2,
  },
];

export function ensureDemoClientUsers() {
  if (!canUseStorage()) return;
  const users = readUsers();
  let changed = false;
  const dayMs = 86_400_000;

  for (const seed of DEMO_CLIENT_SEEDS) {
    const email = seed.email.toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) continue;

    const createdAt = new Date(Date.now() - dayMs * 45).toISOString();
    const lastLoginAt = new Date(Date.now() - dayMs * seed.daysSinceLogin).toISOString();

    users.push({
      id: crypto.randomUUID(),
      fullName: seed.fullName,
      email,
      password: seed.password,
      role: "user",
      createdAt,
      loginCount: seed.loginCount,
      lastLoginAt,
    });
    changed = true;
  }

  if (changed) saveUsers(users);
}

export function updateCurrentUserPassword(currentPassword: string, newPassword: string) {
  if (!canUseStorage()) {
    return { ok: false as const, message: "No se pudo actualizar la contrasena." };
  }

  const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) {
    return { ok: false as const, message: "No hay sesion activa." };
  }

  const users = readUsers();
  const userIndex = users.findIndex((u) => u.id === currentUserId);
  if (userIndex === -1) {
    return { ok: false as const, message: "Usuario no encontrado." };
  }

  if (users[userIndex].password !== currentPassword) {
    return { ok: false as const, message: "La contrasena actual no coincide." };
  }

  users[userIndex].password = newPassword;
  saveUsers(users);
  return { ok: true as const };
}
