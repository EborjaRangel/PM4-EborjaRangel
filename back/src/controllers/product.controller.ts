import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  createProductService,
  getProductByIdService,
  getProductsService,
} from "../services/products.service";

export const getProducts = catchedController(
  async (req: Request, res: Response) => {
    const products = await getProductsService();
    res.json(products);
  }
);

export const getProductById = catchedController(
  async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const product = await getProductByIdService(id);
    res.json(product);
  }
);

export const createProduct = catchedController(
  async (req: Request, res: Response) => {
    const product = await createProductService(req.body);
    res.status(201).json(product);
  }
);
