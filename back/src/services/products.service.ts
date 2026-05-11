import { AppDataSource } from "../config/dataSource";
import { Order } from "../entities/Order";
import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.respository";
import { ClientError } from "../utils/errors";
import { CreateProductDto } from "../dtos/createProduct.dto";

const MAX_IMAGES = 5;

export const checkProductExists = async (itemId: number): Promise<boolean> => {
  const item: Product | null = await ProductRepository.findOneBy({
    id: itemId,
  });
  return !!item;
};

export const getProductsService = async (): Promise<Product[]> => {
  return await ProductRepository.find();
};

export const getProductByIdService = async (id: number): Promise<Product> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de producto inválido.", 400);
  }
  const product = await ProductRepository.findOneBy({ id });
  if (!product) {
    throw new ClientError("Producto no encontrado.", 404);
  }
  return product;
};

export const createProductService = async (
  dto: CreateProductDto
): Promise<Product> => {
  const name = (dto?.name ?? "").toString().trim();
  const description = (dto?.description ?? "").toString().trim();
  const price = Number(dto?.price);
  const stock = Number(dto?.stock);
  const categoryId = Number(dto?.categoryId);

  if (!name) throw new ClientError("El nombre es obligatorio.", 400);
  if (!description)
    throw new ClientError("La descripción es obligatoria.", 400);
  if (!Number.isFinite(price) || price < 0)
    throw new ClientError("El precio debe ser un número mayor o igual a 0.", 400);
  if (!Number.isInteger(stock) || stock < 0)
    throw new ClientError("El stock debe ser un entero mayor o igual a 0.", 400);
  if (!Number.isInteger(categoryId) || categoryId < 1)
    throw new ClientError("Selecciona una categoría válida.", 400);

  const category = await CategoryRepository.findOneBy({ id: categoryId });
  if (!category) throw new ClientError("La categoría no existe.", 404);

  // Normaliza imágenes: acepta `images` (array hasta 5) y/o `image` (portada).
  const rawImages = Array.isArray(dto?.images) ? dto.images : [];
  const cleanedImages = rawImages
    .map((u) => (u ?? "").toString().trim())
    .filter((u) => u.length > 0)
    .slice(0, MAX_IMAGES);

  const coverFromInput = (dto?.image ?? "").toString().trim();

  let images: string[];
  if (cleanedImages.length > 0) {
    images = cleanedImages;
  } else if (coverFromInput) {
    images = [coverFromInput];
  } else {
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "item";
    const fallback = `https://picsum.photos/seed/pulse-product-${slug}-${Date.now()}/900/900`;
    images = [fallback];
  }

  if (images.length > MAX_IMAGES) {
    throw new ClientError(`Máximo ${MAX_IMAGES} imágenes por producto.`, 400);
  }

  const cover = coverFromInput || images[0];

  const product = ProductRepository.create({
    name,
    description,
    price,
    stock,
    categoryId,
    image: cover,
    images,
  });

  return await ProductRepository.save(product);
};

export const updateProductByIdService = async (
  id: number,
  dto: CreateProductDto
): Promise<Product> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de producto inválido.", 400);
  }

  const name = (dto?.name ?? "").toString().trim();
  const description = (dto?.description ?? "").toString().trim();
  const price = Number(dto?.price);
  const stock = Number(dto?.stock);
  const categoryId = Number(dto?.categoryId);

  if (!name) throw new ClientError("El nombre es obligatorio.", 400);
  if (!description)
    throw new ClientError("La descripción es obligatoria.", 400);
  if (!Number.isFinite(price) || price < 0)
    throw new ClientError("El precio debe ser un número mayor o igual a 0.", 400);
  if (!Number.isInteger(stock) || stock < 0)
    throw new ClientError("El stock debe ser un entero mayor o igual a 0.", 400);
  if (!Number.isInteger(categoryId) || categoryId < 1)
    throw new ClientError("Selecciona una categoría válida.", 400);

  const existing = await ProductRepository.findOneBy({ id });
  if (!existing) {
    throw new ClientError("Producto no encontrado.", 404);
  }

  const category = await CategoryRepository.findOneBy({ id: categoryId });
  if (!category) throw new ClientError("La categoría no existe.", 404);

  const rawImages = Array.isArray(dto?.images) ? dto.images : [];
  const cleanedImages = rawImages
    .map((u) => (u ?? "").toString().trim())
    .filter((u) => u.length > 0)
    .slice(0, MAX_IMAGES);

  const coverFromInput = (dto?.image ?? "").toString().trim();

  let images: string[];
  let cover: string;

  if (cleanedImages.length > 0) {
    images = cleanedImages;
    cover = coverFromInput || images[0];
  } else if (coverFromInput) {
    images = [coverFromInput];
    cover = coverFromInput;
  } else {
    const prev = Array.isArray(existing.images) ? existing.images.filter(Boolean) : [];
    if (prev.length > 0) {
      images = prev;
      cover = existing.image || prev[0];
    } else if (existing.image) {
      images = [existing.image];
      cover = existing.image;
    } else {
      throw new ClientError(
        "Indica al menos una URL de imagen o deja las que ya tenía el producto.",
        400
      );
    }
  }

  if (images.length > MAX_IMAGES) {
    throw new ClientError(`Máximo ${MAX_IMAGES} imágenes por producto.`, 400);
  }

  existing.name = name;
  existing.description = description;
  existing.price = price;
  existing.stock = stock;
  existing.categoryId = categoryId;
  existing.image = cover;
  existing.images = images;

  return await ProductRepository.save(existing);
};

/**
 * Borra filas de la tabla intermedia Order ↔ Product y luego el registro en `products`.
 * La API anterior (`relation().remove(id)`) podía no limpiar bien la junction en Postgres y el DELETE en `products`
 * fallaba en silencio o quedaba inconsistente; por eso el producto seguía apareciendo en GET /products.
 */
export const deleteProductByIdService = async (id: number): Promise<void> => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ClientError("ID de producto inválido.", 400);
  }

  await AppDataSource.transaction(async (manager) => {
    const productRepo = manager.getRepository(Product);
    const existing = await productRepo.findOneBy({ id });
    if (!existing) {
      throw new ClientError("Producto no encontrado.", 404);
    }

    const orderMeta = AppDataSource.getMetadata(Order);
    const rel = orderMeta.manyToManyRelations.find(
      (r) => r.propertyName === "products"
    );

    let junctionCleared = false;
    if (rel?.junctionEntityMetadata && rel.inverseJoinColumns.length > 0) {
      try {
        const table = rel.junctionEntityMetadata.tablePath;
        const productCol = rel.inverseJoinColumns[0].databaseName;
        await manager.query(
          `DELETE FROM "${table}" WHERE "${productCol}" = $1`,
          [id]
        );
        junctionCleared = true;
      } catch {
        junctionCleared = false;
      }
    }

    if (!junctionCleared) {
      const orderRepo = manager.getRepository(Order);
      const orders = await orderRepo
        .createQueryBuilder("order")
        .innerJoinAndSelect("order.products", "product")
        .where("product.id = :id", { id })
        .getMany();
      for (const order of orders) {
        order.products = (order.products ?? []).filter((p) => p.id !== id);
        await orderRepo.save(order);
      }
    }

    const del = await productRepo.delete({ id });
    if (!del.affected || del.affected < 1) {
      throw new ClientError(
        "No se pudo eliminar el producto (restricción en base de datos).",
        409
      );
    }
  });
};
