import { data, redirect } from "react-router";

import type { Route } from "./+types/cart.coupon";

import format from "~/lib/format";
import prisma from "~/lib/prisma.server";
import { addCartCoupon, cartCookie, createCart, getCart, removeCartCoupon } from "~/lib/cart.server";
import { getProduct } from "~/lib/product.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const action = form.get("action");

  if (typeof action !== "string") {
    return data(
      {
        error: "action is required.",
      },
      { status: 400 },
    );
  }

  if (!["add", "remove"].includes(action)) {
    return data(
      {
        error: "invalid action.",
      },
      { status: 400 },
    );
  }

  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  let cart = cartId ? await getCart(cartId) : null;

  if (!cart) {
    cart = await createCart();
  }

  if (action === "remove") {
    await removeCartCoupon(cartId);

    return data({
      success: true,
    });
  }

  const couponCode = form.get("coupon");

  if (typeof couponCode !== "string") {
    return data(
      {
        error: "coupon is required.",
      },
      { status: 400 },
    );
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
    },
  });

  if (!coupon) {
    return data(
      {
        error: "invalid coupon.",
      },
      { status: 400 },
    );
  }

  if (coupon.expiration && coupon.expiration < new Date()) {
    return data(
      {
        error: "coupon has expired.",
      },
      { status: 400 },
    );
  }

  const results = [];

  for (const item of cart.items) {
    const product = await getProduct(item.productSlug);

    if (!product) {
      continue;
    }

    const productCount = cart.items.reduce((count, cartItem) => {
      return cartItem.productSlug === item.productSlug ? count + cartItem.quantity : count;
    }, 0);

    const multiDiscount = productCount === 2 ? 0.05 : productCount >= 3 ? 0.1 : 0;
    const price = product.price - product.price * multiDiscount;

    results.push({
      id: item.id,
      slug: product.slug,
      name: product.name,
      price,
      quantity: item.quantity,
    });
  }

  const subtotal = results.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (subtotal < coupon.minimum) {
    return data(
      {
        error: `you must spend at least ${format.currency(coupon.minimum)} to use this coupon.`,
      },
      { status: 400 },
    );
  }

  await addCartCoupon(cart.id, coupon.id);

  return data(
    {
      success: true,
    },
    {
      headers: {
        "Set-Cookie": await cartCookie.serialize(cart.id),
      },
    },
  );
}

export function loader() {
  return redirect("/cart");
}
