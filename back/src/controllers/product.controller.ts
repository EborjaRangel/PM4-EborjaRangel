import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import { CreateProductDto } from "../dtos/createProduct.dto";
import {
  createProductService,
  deleteProductByIdService,
  getProductByIdService,
  getProductsService,
  updateProductByIdService,
} from "../services/products.service";
import { ClientError } from "../utils/errors";

/** Campo en JSON para edición (sin `_` inicial: algunos proxies lo quitan del body). */
const BODY_UPDATE_ID = "pulseUpdateId";

/** El alta debe mandar esta cabecera; si no hay `pulseUpdateId` y no es `create`, no insertamos (evita duplicados por POST fantasma). */
const HEADER_CREATE_OP = "x-pulse-product-op";

/** Evita que proxies o el navegador sirvan listas de catálogo obsoletas tras borrar productos. */
function setNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

export const getProducts = catchedController(
  async (req: Request, res: Response) => {
    setNoStore(res);
    const products = await getProductsService();
    res.json(products);
  }
);

export const getProductById = catchedController(
  async (req: Request, res: Response) => {
    setNoStore(res);
    const id = Number.parseInt(req.params.id, 10);
    const product = await getProductByIdService(id);
    res.json(product);
  }
);

/**
 * Alta (`POST /products`) o edición (`POST /products` + `pulseUpdateId` en el JSON).
 * Misma ruta y método que el alta para que pase por los mismos proxies/ngrok que ya funcionan.
 */
export const postProduct = catchedController(
  async (req: Request, res: Response) => {
    const src =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? { ...(req.body as Record<string, unknown>) }
        : {};

    const raw =
      src[BODY_UPDATE_ID] ?? src._pulse_update ?? req.query._pulse_update;
    delete src[BODY_UPDATE_ID];
    delete src._pulse_update;

    if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
      const id = Number.parseInt(String(raw), 10);
      setNoStore(res);
      const product = await updateProductByIdService(
        id,
        src as unknown as CreateProductDto
      );
      res.json(product);
      return;
    }

    const op = (req.get(HEADER_CREATE_OP) ?? "").trim().toLowerCase();
    if (op !== "create") {
      throw new ClientError(
        "Falta pulseUpdateId para editar, o la cabecera X-Pulse-Product-Op: create para dar de alta. Así se evitan altas duplicadas por peticiones repetidas.",
        400
      );
    }

    const product = await createProductService(src as unknown as CreateProductDto);
    res.status(201).json(product);
  }
);

export const updateProduct = catchedController(
  async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    setNoStore(res);
    const product = await updateProductByIdService(id, req.body);
    res.json(product);
  }
);

export const deleteProduct = catchedController(
  async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    await deleteProductByIdService(id);
    res.status(204).send();
  }
);
