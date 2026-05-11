import { AppDataSource } from "../config/dataSource";
import { Address } from "../entities/Address";
import { AddressRepository } from "../repositories/address.repository";
import { ClientError } from "../utils/errors";

export interface AddressDto {
  label?: string;
  address?: string;
  phone?: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}

function normalizeStringField(value: unknown): string {
  return (value ?? "").toString().trim();
}

function normalizeCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateBaseFields(dto: AddressDto, partial = false): void {
  const address = normalizeStringField(dto.address);
  const phone = normalizeStringField(dto.phone);
  if (!partial) {
    if (!address) throw new ClientError("La dirección es obligatoria.", 400);
    if (!phone) throw new ClientError("El teléfono es obligatorio.", 400);
  }
  if (address && address.length < 4) {
    throw new ClientError("La dirección es demasiado corta.", 400);
  }
  if (phone && phone.length < 6) {
    throw new ClientError("El teléfono es demasiado corto.", 400);
  }
}

async function unsetOtherDefaults(
  userId: number,
  exceptId?: number,
): Promise<void> {
  const qb = AddressRepository.createQueryBuilder()
    .update(Address)
    .set({ isDefault: false })
    .where("userId = :userId", { userId })
    .andWhere("isDefault = :isDefault", { isDefault: true });
  if (exceptId) {
    qb.andWhere("id <> :id", { id: exceptId });
  }
  await qb.execute();
}

export const listAddressesByUserService = async (
  userId: number,
): Promise<Address[]> => {
  if (!Number.isInteger(userId) || userId < 1) {
    throw new ClientError("userId inválido.", 400);
  }
  return AddressRepository.find({
    where: { userId },
    order: { isDefault: "DESC", createdAt: "ASC" },
  });
};

export const createAddressService = async (
  userId: number,
  dto: AddressDto,
): Promise<Address> => {
  if (!Number.isInteger(userId) || userId < 1) {
    throw new ClientError("userId inválido.", 400);
  }
  validateBaseFields(dto, false);

  const label = normalizeStringField(dto.label);
  const address = normalizeStringField(dto.address);
  const phone = normalizeStringField(dto.phone);
  const lat = normalizeCoord(dto.lat);
  const lng = normalizeCoord(dto.lng);

  const existing = await AddressRepository.find({ where: { userId } });
  const shouldBeDefault = dto.isDefault === true || existing.length === 0;

  return AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(Address);
    if (shouldBeDefault) {
      await repo
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where("userId = :userId", { userId })
        .execute();
    }
    const entity = repo.create({
      userId,
      label,
      address,
      phone,
      lat,
      lng,
      isDefault: shouldBeDefault,
    });
    return repo.save(entity);
  });
};

export const updateAddressService = async (
  id: number,
  userId: number,
  dto: AddressDto,
): Promise<Address> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de dirección inválido.", 400);
  }
  const current = await AddressRepository.findOneBy({ id });
  if (!current) throw new ClientError("Dirección no encontrada.", 404);
  if (current.userId !== userId) {
    throw new ClientError("La dirección no pertenece a este usuario.", 403);
  }
  validateBaseFields(dto, true);

  if (dto.label !== undefined) current.label = normalizeStringField(dto.label);
  if (dto.address !== undefined)
    current.address = normalizeStringField(dto.address) || current.address;
  if (dto.phone !== undefined)
    current.phone = normalizeStringField(dto.phone) || current.phone;
  if (dto.lat !== undefined) current.lat = normalizeCoord(dto.lat);
  if (dto.lng !== undefined) current.lng = normalizeCoord(dto.lng);

  if (dto.isDefault === true) {
    await unsetOtherDefaults(userId, id);
    current.isDefault = true;
  } else if (dto.isDefault === false && current.isDefault) {
    // Si se quita el default y no había otra, hay que dejar alguna otra como default.
    const others = await AddressRepository.find({ where: { userId } });
    if (others.length > 1) {
      current.isDefault = false;
      // Promueve la más antigua que no sea esta.
      const newDefault = others
        .filter((a) => a.id !== id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )[0];
      if (newDefault) {
        newDefault.isDefault = true;
        await AddressRepository.save(newDefault);
      }
    } else {
      current.isDefault = true; // única dirección, debe quedar como default.
    }
  }

  return AddressRepository.save(current);
};

export const deleteAddressService = async (
  id: number,
  userId: number,
): Promise<void> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de dirección inválido.", 400);
  }
  const current = await AddressRepository.findOneBy({ id });
  if (!current) throw new ClientError("Dirección no encontrada.", 404);
  if (current.userId !== userId) {
    throw new ClientError("La dirección no pertenece a este usuario.", 403);
  }

  await AddressRepository.delete({ id });

  // Si era la default, promover otra como default (si queda alguna).
  if (current.isDefault) {
    const remaining = await AddressRepository.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });
    if (remaining.length > 0) {
      remaining[0].isDefault = true;
      await AddressRepository.save(remaining[0]);
    }
  }
};

export const setDefaultAddressService = async (
  id: number,
  userId: number,
): Promise<Address> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de dirección inválido.", 400);
  }
  const current = await AddressRepository.findOneBy({ id });
  if (!current) throw new ClientError("Dirección no encontrada.", 404);
  if (current.userId !== userId) {
    throw new ClientError("La dirección no pertenece a este usuario.", 403);
  }
  await unsetOtherDefaults(userId, id);
  current.isDefault = true;
  return AddressRepository.save(current);
};
