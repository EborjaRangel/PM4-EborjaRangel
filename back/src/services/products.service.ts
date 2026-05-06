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
    throw new ClientError("ID de producto invalido.", 400);
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
