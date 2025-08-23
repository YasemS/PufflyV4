import { redirect } from "react-router";

import type { Route } from "./+types/checkout";

import { cartCookie, getCart } from "~/lib/cart.server";
import { addOrderCoupon, addOrderItem, createOrder, type OrderItemVariants } from "~/lib/order.server";

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  if (!cartId) {
    return redirect("/cart");
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return redirect("/cart");
  }

  if (cart.items.length === 0) {
    return redirect("/cart");
  }

  const order = await createOrder();

  for (const item of cart.items) {
    const variants: OrderItemVariants = {};

    for (const variant of item.variants) {
      variants[variant.variantId] = variant.optionId;
    }

    await addOrderItem(order.id, item.productSlug, item.quantity, variants);
  }

  if (cart.coupon) {
    await addOrderCoupon(order.id, cart.coupon.id);
  }

  return redirect("/checkout/" + order.id);
}

export async function loader() {
  return redirect("/cart");
}
