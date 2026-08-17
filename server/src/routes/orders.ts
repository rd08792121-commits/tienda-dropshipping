import type { Database } from "better-sqlite3";
import { Router } from "express";
import { z } from "zod";
import { getOrderById, getOrderBySessionId } from "../db/orders.js";
import { asyncHandler } from "../lib/async-handler.js";
import { NotFoundError } from "../lib/errors.js";

const idParamSchema = z.object({ id: z.string().min(1) });
const sessionParamSchema = z.object({ sessionId: z.string().min(1) });

export function createOrdersRouter(db: Database) {
  const router = Router();

  router.get(
    "/by-session/:sessionId",
    asyncHandler(async (req, res) => {
      const { sessionId } = sessionParamSchema.parse(req.params);
      const order = getOrderBySessionId(db, sessionId);
      if (!order) {
        throw new NotFoundError(`No hay pedido para la sesion ${sessionId}`);
      }
      res.json({ order });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      const order = getOrderById(db, id);
      if (!order) {
        throw new NotFoundError(`Pedido ${id} no encontrado`);
      }
      res.json({ order });
    }),
  );

  return router;
}
