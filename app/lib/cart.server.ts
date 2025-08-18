import { createCookie } from "react-router";
import prisma from "./prisma";

export const cartCookie = createCookie("cart_id", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  secrets: [process.env.COOKIE_SECRET!],
});

export async function addCartItem() {}

export async function getCart(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true },
  });

  return cart;
}

export async function createCart() {
  const cart = await prisma.cart.create({
    data: {},
    include: { items: true },
  });

  return cart;
}
