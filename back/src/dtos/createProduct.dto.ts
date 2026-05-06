export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  image?: string;
  images?: string[];
}
