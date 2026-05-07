import { Role } from "../entities/User";
import { UserRepository } from "../repositories/user.repository";
import { checkUserExists, registerUserService } from "../services/user.service";

const ADMIN_EMAIL =
  (process.env.SEED_ADMIN_EMAIL || "admin@pulse.local").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

export async function preLoadAdminUser(): Promise<void> {
  const exists = await checkUserExists(ADMIN_EMAIL);
  if (exists) return;

  const created = await registerUserService({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: "Administrador PULSE",
    address: "-",
    phone: "-",
  });

  await UserRepository.update({ id: created.id }, { role: Role.ADMIN });
}
