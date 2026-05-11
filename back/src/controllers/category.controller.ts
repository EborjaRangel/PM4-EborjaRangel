import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../services/categories.service";

export const getCategories = catchedController(
  async (_req: Request, res: Response) => {
    const rows = await getCategoriesService();
    res.json(rows);
  }
);

export const createCategory = catchedController(
  async (req: Request, res: Response) => {
    const category = await createCategoryService(req.body?.name);
    res.status(201).json(category);
  }
);

export const updateCategory = catchedController(
  async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const category = await updateCategoryService(id, req.body?.name);
    res.json(category);
  }
);

export const deleteCategory = catchedController(
  async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    await deleteCategoryService(id);
    res.status(204).send();
  }
);
