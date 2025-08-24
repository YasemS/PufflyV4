import crypto from "crypto";

import prisma from "~/lib/prisma.server";

export type OrderItemVariants = {
  [key: string]: string;
};

function generateOrderId(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;

  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % charactersLength];
  }

  return result;
}

export async function addOrderItem(
  orderId: string,
  productSlug: string,
  quantity: number,
  variants?: OrderItemVariants,
) {
  const conditions = variants
    ? Object.entries(variants).map(([variantId, optionId]) => ({
        variantId,
        optionId,
      }))
    : [];

  return await prisma.orderItem.create({
    data: {
      orderId,
      productSlug,
      quantity,
      variants: {
        create: conditions.map(({ variantId, optionId }) => ({
          variantId,
          optionId,
        })),
      },
    },
    include: {
      variants: true,
    },
  });
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { coupon: true, items: { include: { variants: true } } },
  });

  return order;
}

export async function createOrder() {
  return await prisma.order.create({
    data: {
      id: generateOrderId(8),
      shippingMethod: "standard",
    },
    include: { coupon: true, items: { include: { variants: true } } },
  });
}

export async function addOrderCoupon(orderId: string, couponId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { couponId: couponId },
  });

  return true;
}

export async function removeOrderCoupon(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { couponId: null },
  });

  return true;
}
