export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
};

export type Cart = {
  id: string;
  createdAt: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
  totalCents: number;
  currency: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "canceled";

export type Order = {
  id: string;
  cartId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  customerEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };
