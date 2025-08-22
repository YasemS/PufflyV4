import { createCookie } from "react-router";
import prisma from "./prisma.server";

export const cartCookie = createCookie("cart_id", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  secrets: [process.env.COOKIE_SECRET!],
});

type CartItemVariants = {
  [key: string]: string;
};

export async function addCartItem(cartId: string, productSlug: string, variants?: CartItemVariants) {
  const conditions = variants
    ? Object.entries(variants).map(([variantId, optionId]) => ({
        variantId,
        optionId,
      }))
    : [];

  const item = await prisma.cartItem.findFirst({
    include: {
      variants: true,
    },
    where: {
      cartId,
      productSlug,
      variants: {
        every: {
          OR: conditions,
        },
      },
    },
  });

  if (item) {
    if (item.quantity >= 99) {
      return;
    }

    return await prisma.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity + 1,
      },
      include: {
        variants: true,
      },
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId,
      productSlug,
      quantity: 1,
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

export async function getCart(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { variants: true } } },
  });

  return cart;
}

export async function createCart() {
  const cart = await prisma.cart.create({
    data: {},
    include: { items: { include: { variants: true } } },
  });

  return cart;
}

export async function removeCartItem(cartId: string, cartItemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!item || item.cartId !== cartId) {
    return false;
  }

  await prisma.cartItemVariant.deleteMany({
    where: { cartItemId },
  });

  await prisma.cartItem.delete({
    where: { id: cartItemId },
    include: { variants: true },
  });

  return true;
}

export async function updateCartItemQuantity(cartId: string, cartItemId: string, quantity: number) {
  if (quantity < 1 || quantity > 99) {
    return false;
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!item || item.cartId !== cartId) {
    return false;
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return true;
}
