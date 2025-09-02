import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/brand.$slug";

import { H1 } from "~/components/Heading";
import { ProductCard } from "~/components/Product";

import prisma from "~/lib/prisma.server";
import { getProducts } from "~/lib/product.server";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  return [{ title: `shop ${data.brand.name} vapes online - puffly` }];
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  if (!slug || typeof slug !== "string") {
    return redirect("/products");
  }

  const brand = await prisma.brand.findUnique({
    where: {
      slug,
    },
  });

  if (!brand) {
    return redirect("/products");
  }

  const products = await getProducts(slug);

  if (!products || products.length === 0) {
    return redirect("/products");
  }

  return { brand, products };
}

export default function Brand() {
  const { brand, products } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="fixed top-16 left-0 w-full h-full z-0 bg-gradient-to-r from-pink-500 via-pink-800/20 to-purple-500 blur-3xl opacity-20 rounded-bl-full md:hidden"></div>

      <div className="relative z-1">
        <H1>{brand.name} products</H1>

        <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              name={product.name}
              image={product.image}
              price={product.price}
              rating={product.rating}
              brand={product.brand}
            />
          ))}
        </div>
      </div>
    </>
  );
}
