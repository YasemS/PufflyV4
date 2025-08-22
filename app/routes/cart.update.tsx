import { data, redirect } from "react-router";

import type { Route } from "./+types/cart.update";

import { cartCookie, getCart, removeCartItem, updateCartItemQuantity } from "~/lib/cart.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const cartItemId = form.get("item");
  const action = form.get("action");

  if (typeof cartItemId !== "string" || typeof action !== "string") {
    return data({ error: "Invalid form data" }, { status: 400 });
  }

  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  if (!cartId) {
    return data({ error: "Cart not found" }, { status: 404 });
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return data({ error: "Cart not found" }, { status: 404 });
  }

  const cartItem = cart.items.find((item) => item.id === cartItemId);

  if (!cartItem) {
    return data({ error: "Cart item not found" }, { status: 404 });
  }

  if (action === "remove") {
    await removeCartItem(cartId, cartItemId);
  }

  if (action === "quantity") {
    const quantity = form.get("quantity");

    if (typeof quantity !== "string") {
      return data({ error: "Invalid quantity" }, { status: 400 });
    }

    const quantityInt = parseInt(quantity, 10);

    if (isNaN(quantityInt) || quantityInt < 1 || quantityInt > 99) {
      return data({ error: "Invalid quantity" }, { status: 400 });
    }

    await updateCartItemQuantity(cartId, cartItemId, quantityInt);
  }

  // return redirect("/cart");
  return { success: true };
}

export function loader() {
  return redirect("/cart");
}
