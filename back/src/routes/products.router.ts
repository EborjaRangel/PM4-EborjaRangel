import { Router } from "express";
import {
  deleteProduct,
  getProductById,
  getProducts,
  postProduct,
  updateProduct,
} from "../controllers/product.controller";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";

const router = Router();

router.get("/", getProducts);
router.post("/", postProduct);
/** Edición: segmento fijo `replace` para no usar `/admin` (a veces bloqueado en proxies). */
router.post("/:id/replace", updateProduct);
/** Alias bajo /products para entornos/proxies que no enrutan bien /categories. */
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/:id", getProductById);
router.patch("/:id", updateProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
