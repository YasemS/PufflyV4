import { data, redirect } from "react-router";

import type { Route } from "./+types/checkout.coupon";

import format from "~/lib/format";
import prisma from "~/lib/prisma.server";
import { getProduct } from "~/lib/product.server";
import { addOrderCoupon, getOrder, removeOrderCoupon } from "~/lib/order.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const orderId = form.get("order");

  if (typeof orderId !== "string") {
    return data(
      {
        error: "order is required.",
      },
      { status: 400 },
    );
  }

  const order = await getOrder(orderId);

  if (!order) {
    return data(
      {
        error: "invalid order.",
      },
      { status: 400 },
    );
  }

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

  if (action === "remove") {
    await removeOrderCoupon(orderId);

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

  for (const item of order.items) {
    const product = await getProduct(item.productSlug);

    if (!product) {
      continue;
    }

    const productCount = order.items.reduce((count, cartItem) => {
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

  await addOrderCoupon(order.id, coupon.id);

  return data({
    success: true,
  });
}

export function loader() {
  return redirect("/cart");
}
