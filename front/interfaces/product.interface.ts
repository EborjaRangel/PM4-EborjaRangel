// src/interfaces/product.interface.ts
export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  categoryId: number;
}