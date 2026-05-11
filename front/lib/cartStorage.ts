import { IProduct } from "@/interfaces/product.interface";
import { getCurrentUser } from "@/lib/authStorage";
import { fetchProducts } from "@/lib/productCatalog";
import { fetchRemoteCartRaw, putRemoteCartPayload } from "@/lib/cartRemote";

/**
 * Carrito:
 * - Invitado (sin sesión): solo `localStorage` (`pulse_cart_guest`). No hay llamadas al backend.
 * - Usuario con sesión iniciada: Postgres vía API (persistencia entre dispositivos) + caché local por usuario
 *   (`pulse_cart_u_<id>`) para lectura inmediata y resiliencia si falla la red.
 */

export interface ICartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
  categoryId: number;
}

export interface ICartTotals {
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
}

/** Clave historica (un solo carrito); se migra una vez a invitado o al usuario activo. */
const LEGACY_CART_KEY = "pulse_cart";
/** Solo invitados; nunca se sincroniza con el servidor. */
const GUEST_CART_KEY = "pulse_cart_guest";

function userCartKey(userId: string): string {
  return `pulse_cart_u_${userId}`;
}

export const CART_UPDATED_EVENT = "pulse-cart-updated";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function notifyCartUpdated() {
  if (canUseStorage()) {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

function normalizeCartItems(parsed: unknown): ICartItem[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((it) => ({
      id: Number((it as ICartItem).id),
      name: String((it as ICartItem).name ?? ""),
      price: Number((it as ICartItem).price ?? 0),
      image: String((it as ICartItem).image ?? ""),
      qty: Math.max(1, Number((it as ICartItem).qty ?? 1)),
      categoryId: Number((it as ICartItem).categoryId ?? 0),
    }))
    .filter((it) => Number.isInteger(it.id) && it.id > 0);
}

function parseCartJson(raw: string | null): ICartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeCartItems(parsed);
  } catch {
    return [];
  }
}

function readCartFromKey(storageKey: string): ICartItem[] {
  if (!canUseStorage()) return [];
  return parseCartJson(localStorage.getItem(storageKey));
}

function mergeCarts(primary: ICartItem[], secondary: ICartItem[]): ICartItem[] {
  const map = new Map<number, ICartItem>();
  for (const it of primary) {
    map.set(it.id, { ...it });
  }
  for (const it of secondary) {
    const ex = map.get(it.id);
    if (ex) {
      map.set(it.id, { ...ex, qty: ex.qty + it.qty });
    } else {
      map.set(it.id, { ...it });
    }
  }
  return Array.from(map.values());
}

/** Migra `pulse_cart` al alcance actual (invitado o usuario) y elimina la clave antigua. */
function migrateLegacyCartIfNeeded(): void {
  if (!canUseStorage()) return;
  const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
  if (!legacyRaw) return;

  const legacyItems = parseCartJson(legacyRaw);
  localStorage.removeItem(LEGACY_CART_KEY);

  if (legacyItems.length === 0) return;

  const user = getCurrentUser();
  const targetKey = user ? userCartKey(user.id) : GUEST_CART_KEY;
  const existing = readCartFromKey(targetKey);
  const merged = mergeCarts(existing, legacyItems);
  localStorage.setItem(targetKey, JSON.stringify(merged));
}

function getActiveCartStorageKey(): string {
  migrateLegacyCartIfNeeded();
  const user = getCurrentUser();
  return user ? userCartKey(user.id) : GUEST_CART_KEY;
}

function saveCartToKey(storageKey: string, items: ICartItem[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function itemToPayload(it: ICartItem): Record<string, unknown> {
  return {
    id: it.id,
    name: it.name,
    price: it.price,
    image: it.image,
    qty: it.qty,
    categoryId: it.categoryId,
  };
}

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();

function cancelScheduledPush(userId: string) {
  const t = pushTimers.get(userId);
  if (t) clearTimeout(t);
  pushTimers.delete(userId);
}

/** Persistencia remota: únicamente si hay usuario con sesión iniciada. */
function scheduleRemotePersist(userId: string, items: ICartItem[]) {
  cancelScheduledPush(userId);
  const timerId = setTimeout(() => {
    pushTimers.delete(userId);
    void putRemoteCartPayload(
      userId,
      items.map(itemToPayload)
    ).catch(() => {});
  }, 450);
  pushTimers.set(userId, timerId);
}

function saveCart(items: ICartItem[]) {
  if (!canUseStorage()) return;
  saveCartToKey(getActiveCartStorageKey(), items);
  notifyCartUpdated();
  const user = getCurrentUser();
  // Invitado: no API — solo localStorage arriba.
  if (user) {
    scheduleRemotePersist(user.id, items);
  }
}

let hydrateChain: Promise<void> = Promise.resolve();

async function performHydrate(userId: string): Promise<void> {
  cancelScheduledPush(userId);

  const localSnapshot = readCartFromKey(userCartKey(userId));
  await putRemoteCartPayload(
    userId,
    localSnapshot.map(itemToPayload)
  ).catch(() => {});

  const remoteRaw = await fetchRemoteCartRaw(userId);
  if (getCurrentUser()?.id !== userId) return;

  const remote =
    remoteRaw === null ? null : normalizeCartItems(remoteRaw);

  const guest = readCartFromKey(GUEST_CART_KEY);

  const merged =
    remote === null
      ? mergeCarts(localSnapshot, guest)
      : mergeCarts(remote, guest);

  if (getCurrentUser()?.id !== userId) return;

  saveCartToKey(userCartKey(userId), merged);
  saveCartToKey(GUEST_CART_KEY, []);
  notifyCartUpdated();

  await putRemoteCartPayload(
    userId,
    merged.map(itemToPayload)
  ).catch(() => {});
}

/**
 * Solo con sesión activa: sincroniza con la API. Sin login es no-op (invitado usa solo localStorage).
 */
export function hydrateLoggedInUserCart(userId: string): Promise<void> {
  if (!canUseStorage()) return Promise.resolve();
  const session = getCurrentUser();
  if (!session || session.id !== userId) {
    return Promise.resolve();
  }
  const next = hydrateChain.then(() => performHydrate(userId));
  hydrateChain = next.catch(() => {});
  return next;
}

export function getCart(): ICartItem[] {
  if (!canUseStorage()) return [];
  return readCartFromKey(getActiveCartStorageKey());
}

export function getCartCount(): number {
  return getCart().reduce((acc, it) => acc + it.qty, 0);
}

/** Agrega un producto real al carrito; si ya está, suma a la cantidad. */
export function addToCart(product: IProduct, qty = 1): ICartItem[] {
  const items = getCart();
  const safeQty = Math.max(1, Math.floor(qty));
  const idx = items.findIndex((it) => it.id === product.id);

  if (idx >= 0) {
    items[idx] = { ...items[idx], qty: items[idx].qty + safeQty };
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      qty: safeQty,
      categoryId: product.categoryId,
    });
  }

  saveCart(items);
  return items;
}

export function removeFromCart(id: number): ICartItem[] {
  const items = getCart().filter((it) => it.id !== id);
  saveCart(items);
  return items;
}

export function setQty(id: number, qty: number): ICartItem[] {
  const items = getCart();
  const safe = Math.floor(qty);
  if (safe <= 0) {
    return removeFromCart(id);
  }
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return items;
  items[idx] = { ...items[idx], qty: safe };
  saveCart(items);
  return items;
}

export function clearCart(): ICartItem[] {
  if (!canUseStorage()) return [];
  saveCartToKey(getActiveCartStorageKey(), []);
  notifyCartUpdated();
  // Con sesión: vaciar también en el servidor. Invitado: solo localStorage (sin PUT).
  const user = getCurrentUser();
  if (user) {
    cancelScheduledPush(user.id);
    void putRemoteCartPayload(user.id, []).catch(() => {});
  }
  return [];
}

/** Quita del carrito ítems cuyo producto ya no existe en catálogo (baja permanente en BD). */
export function pruneCartToExistingProductIds(validIds: Set<number>): void {
  if (!canUseStorage()) return;
  const items = getCart();
  const next = items.filter((it) => validIds.has(it.id));
  if (next.length === items.length) return;
  saveCart(next);
}

/**
 * Alinea el carrito con `GET /products`. Si falla la red, no se vacía el carrito.
 * Convoca tras cambios de catálogo (altas/bajas) para que no queden productos eliminados.
 */
export async function pruneCartAgainstCatalog(): Promise<void> {
  if (!canUseStorage()) return;
  try {
    const products = await fetchProducts();
    pruneCartToExistingProductIds(new Set(products.map((p) => p.id)));
  } catch {
    /* sin catálogo no tocamos el carrito */
  }
}

/** Subtotal/envío/taxes/total con la misma fórmula usada antes en el mock. */
export function getCartTotals(items?: ICartItem[]): ICartTotals {
  const list = items ?? getCart();
  const subtotal = list.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shipping = list.length === 0 ? 0 : subtotal > 250 ? 0 : 14.9;
  const taxes = subtotal * 0.12;
  const total = subtotal + shipping + taxes;
  return { subtotal, shipping, taxes, total };
}
