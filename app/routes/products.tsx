import { useLoaderData } from "react-router";

import { H1 } from "~/components/Heading";
import { ProductCard } from "~/components/Product";

import { getProducts } from "~/lib/product";

export async function loader() {
  const products = await getProducts();

  return { products };
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="fixed top-16 left-0 w-full h-full z-0 bg-gradient-to-r from-pink-500 via-pink-800/20 to-purple-500 blur-3xl opacity-20 rounded-bl-full"></div>

      <div className="relative z-1">
        <H1>products</H1>

        <div className="grid grid-cols-2 gap-2 mt-4">
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
