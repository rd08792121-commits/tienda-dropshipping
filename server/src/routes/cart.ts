import type { Database } from "better-sqlite3";
import { Router } from "express";
import { z } from "zod";
import { addCartItem, createCart, getCartWithItems, removeCartItem, setCartItemQuantity } from "../db/carts.js";
import { getProduct } from "../db/products.js";
import { asyncHandler } from "../lib/async-handler.js";
import { NotFoundError } from "../lib/errors.js";

const cartParamSchema = z.object({ cartId: z.string().min(1) });
const cartItemParamSchema = z.object({ cartId: z.string().min(1), productId: z.string().min(1) });

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export function createCartRouter(db: Database) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (_req, res) => {
      const cart = createCart(db);
      res.status(201).json({ cart: getCartWithItems(db, cart.id) });
    }),
  );

  router.get(
    "/:cartId",
    asyncHandler(async (req, res) => {
      const { cartId } = cartParamSchema.parse(req.params);
      const cart = getCartWithItems(db, cartId);
      if (!cart) {
        throw new NotFoundError(`Carrito ${cartId} no encontrado`);
      }
      res.json({ cart });
    }),
  );

  router.post(
    "/:cartId/items",
    asyncHandler(async (req, res) => {
      const { cartId } = cartParamSchema.parse(req.params);
      const cart = getCartWithItems(db, cartId);
      if (!cart) {
        throw new NotFoundError(`Carrito ${cartId} no encontrado`);
      }

      const { productId, quantity } = addItemSchema.parse(req.body);
      const product = getProduct(db, productId);
      if (!product) {
        throw new NotFoundError(`Producto ${productId} no encontrado`);
      }

      addCartItem(db, cart.id, productId, quantity);
      res.status(201).json({ cart: getCartWithItems(db, cart.id) });
    }),
  );

  router.patch(
    "/:cartId/items/:productId",
    asyncHandler(async (req, res) => {
      const { cartId, productId } = cartItemParamSchema.parse(req.params);
      const cart = getCartWithItems(db, cartId);
      if (!cart) {
        throw new NotFoundError(`Carrito ${cartId} no encontrado`);
      }

      const { quantity } = updateItemSchema.parse(req.body);
      setCartItemQuantity(db, cart.id, productId, quantity);
      res.json({ cart: getCartWithItems(db, cart.id) });
    }),
  );

  router.delete(
    "/:cartId/items/:productId",
    asyncHandler(async (req, res) => {
      const { cartId, productId } = cartItemParamSchema.parse(req.params);
      const cart = getCartWithItems(db, cartId);
      if (!cart) {
        throw new NotFoundError(`Carrito ${cartId} no encontrado`);
      }

      removeCartItem(db, cart.id, productId);
      res.json({ cart: getCartWithItems(db, cart.id) });
    }),
  );

  return router;
}
