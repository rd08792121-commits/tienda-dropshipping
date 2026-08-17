import { Router } from "express";
import type { Database } from "better-sqlite3";
import { z } from "zod";
import { getProduct, listProducts } from "../db/products.js";
import { asyncHandler } from "../lib/async-handler.js";
import { NotFoundError } from "../lib/errors.js";

const idParamSchema = z.object({ id: z.string().min(1) });

export function createProductsRouter(db: Database) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      res.json({ products: listProducts(db) });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      const product = getProduct(db, id);
      if (!product) {
        throw new NotFoundError(`Producto ${id} no encontrado`);
      }
      res.json({ product });
    }),
  );

  return router;
}
