import { data, redirect, type ActionFunctionArgs } from "react-router";
import { addCartItem, cartCookie, createCart, getCart } from "~/lib/cart.server";
import { getProduct } from "~/lib/product.server";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const productSlug = form.get("product");

  if (typeof productSlug !== "string") {
    return data(
      {
        error: "product is required.",
      },
      { status: 400 },
    );
  }

  const product = await getProduct(productSlug);

  if (!product) {
    return data(
      {
        error: "product not found.",
      },
      { status: 404 },
    );
  }

  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  let cart = cartId ? await getCart(cartId) : null;

  if (!cart) {
    cart = await createCart();
  }

  if (product.variants.length === 0) {
    await addCartItem(cart.id, product.slug);

    return redirect("/cart", {
      headers: {
        "Set-Cookie": await cartCookie.serialize(cart.id),
      },
    });
  }

  for (const variant of product.variants) {
    const formKey = `variant__${variant.id}`;
    const values = form.getAll(formKey);

    if (values.length === 0) {
      return data(
        {
          error: `${variant.name} is required.`,
        },
        {
          status: 400,
        },
      );
    }

    for (const value of values) {
      const option = variant.options.find((opt) => opt.value === value);

      if (!option) {
        continue;
      }

      await addCartItem(cart.id, product.slug, {
        [variant.id]: option.value,
      });
    }
  }

  return redirect("/cart", {
    headers: {
      "Set-Cookie": await cartCookie.serialize(cart.id),
    },
  });
}
