import validator from "validator";
import { data, redirect } from "react-router";

import type { Route } from "./+types/checkout.update";

import prisma from "~/lib/prisma.server";
import { getOrder } from "~/lib/order.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const orderId = form.get("order");

  if (typeof orderId !== "string") {
    return data({ error: "order is required." }, { status: 400 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    return data({ error: "invalid order." }, { status: 400 });
  }

  const fields = [
    "email",
    "firstName",
    "lastName",
    "addressLine1",
    "addressLine2",
    "country",
    "city",
    "state",
    "postal",
    "shippingMethod",
  ];

  const changes: { [key: string]: string | null } = {};

  for (const field of fields) {
    const value = form.get(field);

    if (field === "addressLine2" && !value) {
      changes[field] = null;
      continue;
    }

    if (typeof value !== "string") {
      continue;
    }

    if (value.trim().length === 0) {
      continue;
    }

    if (field === "email" && !validator.isEmail(value)) {
      continue;
    }

    if (field === "shippingMethod" && !["standard", "express"].includes(value)) {
      continue;
    }

    changes[field] = value;
  }

  if (Object.keys(changes).length === 0) {
    return data({ error: "no/invalid data provided." }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: changes,
  });

  return data({ success: true });
}

export function loader() {
  return redirect("/cart");
}
