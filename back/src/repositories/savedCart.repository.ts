import { AppDataSource } from "../config/dataSource";
import { SavedCart } from "../entities/SavedCart";

export const SavedCartRepository = AppDataSource.getRepository(SavedCart);
