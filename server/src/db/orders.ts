import type { Database } from "better-sqlite3";
import { nanoid } from "nanoid";
import type { CartItemWithProduct, Order, OrderStatus, OrderWithItems } from "../types.js";

type OrderRow = {
  id: string;
  cart_id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  customer_email: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
};

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    cartId: row.cart_id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    status: row.status,
    totalCents: row.total_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createOrder(
  db: Database,
  params: {
    cartId: string;
    stripeSessionId: string;
    totalCents: number;
    currency: string;
    customerEmail?: string | null;
    items: CartItemWithProduct[];
  },
): OrderWithItems {
  const orderId = nanoid();

  const insertOrder = db.prepare(
    `INSERT INTO orders (id, cart_id, stripe_session_id, status, total_cents, currency, customer_email)
     VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, order_id, product_id, name, unit_price_cents, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const transaction = db.transaction(() => {
    insertOrder.run(orderId, params.cartId, params.stripeSessionId, params.totalCents, params.currency, params.customerEmail ?? null);
    for (const item of params.items) {
      insertItem.run(nanoid(), orderId, item.productId, item.product.name, item.product.priceCents, item.quantity);
    }
  });
  transaction();

  const order = getOrderById(db, orderId);
  if (!order) {
    throw new Error(`Failed to create order ${orderId}`);
  }
  return order;
}

function attachItems(db: Database, order: Order): OrderWithItems {
  const rows = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id) as OrderItemRow[];
  const items = rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    name: row.name,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
  }));
  return { ...order, items };
}

export function getOrderById(db: Database, id: string): OrderWithItems | undefined {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? attachItems(db, toOrder(row)) : undefined;
}

export function getOrderBySessionId(db: Database, stripeSessionId: string): OrderWithItems | undefined {
  const row = db.prepare("SELECT * FROM orders WHERE stripe_session_id = ?").get(stripeSessionId) as
    | OrderRow
    | undefined;
  return row ? attachItems(db, toOrder(row)) : undefined;
}

export function markOrderPaid(db: Database, stripeSessionId: string, paymentIntentId: string | null): void {
  db.prepare(
    `UPDATE orders SET status = 'paid', stripe_payment_intent_id = ?, updated_at = datetime('now')
     WHERE stripe_session_id = ?`,
  ).run(paymentIntentId, stripeSessionId);
}

export function setOrderStatus(db: Database, stripeSessionId: string, status: OrderStatus): void {
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE stripe_session_id = ?").run(
    status,
    stripeSessionId,
  );
}
