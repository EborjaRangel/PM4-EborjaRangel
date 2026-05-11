import { Category } from "../entities/Category";
import { CategoryRepository } from "../repositories/category.respository";
import { ProductRepository } from "../repositories/product.repository";
import { ClientError } from "../utils/errors";

function normalizeCategoryName(name: string): string {
  return (name ?? "").toString().trim().replace(/\s+/g, " ");
}

export async function getCategoriesService(): Promise<Category[]> {
  return CategoryRepository.find({ order: { id: "ASC" } });
}

export async function createCategoryService(name: string): Promise<Category> {
  const normalized = normalizeCategoryName(name);
  if (!normalized) {
    throw new ClientError("El nombre de la categoría es obligatorio.", 400);
  }

  const existing = await CategoryRepository.find();
  const duplicate = existing.find(
    (c) => c.name.trim().toLowerCase() === normalized.toLowerCase()
  );
  if (duplicate) {
    throw new ClientError("Ya existe una categoría con ese nombre.", 409);
  }

  const category = CategoryRepository.create({ name: normalized });
  return CategoryRepository.save(category);
}

export async function updateCategoryService(
  id: number,
  name: string
): Promise<Category> {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de categoría inválido.", 400);
  }

  const normalized = normalizeCategoryName(name);
  if (!normalized) {
    throw new ClientError("El nombre de la categoría es obligatorio.", 400);
  }

  const category = await CategoryRepository.findOneBy({ id });
  if (!category) {
    throw new ClientError("Categoría no encontrada.", 404);
  }

  const existing = await CategoryRepository.find();
  const duplicate = existing.find(
    (c) =>
      c.id !== id && c.name.trim().toLowerCase() === normalized.toLowerCase()
  );
  if (duplicate) {
    throw new ClientError("Ya existe una categoría con ese nombre.", 409);
  }

  category.name = normalized;
  return CategoryRepository.save(category);
}

export async function deleteCategoryService(id: number): Promise<void> {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de categoría inválido.", 400);
  }

  const category = await CategoryRepository.findOneBy({ id });
  if (!category) {
    throw new ClientError("Categoría no encontrada.", 404);
  }

  const productsUsingCategory = await ProductRepository.countBy({ categoryId: id });
  if (productsUsingCategory > 0) {
    throw new ClientError(
      "No se puede eliminar la categoría porque tiene productos asignados.",
      409
    );
  }

  await CategoryRepository.delete({ id });
}
