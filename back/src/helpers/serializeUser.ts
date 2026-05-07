import { User } from "../entities/User";

/** Objeto usuario seguro para JSON (sin credencial ni órdenes). */
export function toPublicUserJson(user: User) {
    const plain = JSON.parse(JSON.stringify(user)) as Record<string, unknown>;
    delete plain.credential;
    delete plain.orders;
    return plain;
}
