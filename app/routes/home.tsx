import { MoveRight } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import { H1, H2 } from "~/components/Heading";
import { ProductCard } from "~/components/Product";

import prisma from "~/lib/prisma.server";
import { getProducts } from "~/lib/product.server";

export async function loader() {
  const products = await getProducts(null, 8);

  const brands = await prisma.brand.findMany({
    where: {
      visible: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return { brands, products };
}

export default function Home() {
  const { brands, products } = useLoaderData<typeof loader>();

  return (
    <>
      <BackgroundGradient className="col-span-2">
        <div className="grid gap-4 h-100 lg:grid-cols-7">
          <div className="flex flex-col items-center justify-end col-span-5 relative p-8 bg-zinc-900 rounded-xl text-center overflow-hidden">
            <img
              src="/img/geek-bar-pulse-banner.png"
              alt="geek bar pulse banner"
              className="absolute top-1/2 left-1/2 -translate-1/2 w-[120%] h-[120%] object-cover"
            />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-zinc-950 opacity-90"></div>

            <div className="flex flex-col items-center justify-center gap-4 relative z-1">
              <H1>find your favorite vape</H1>

              <Link to="/products" tabIndex={-1}>
                <Button>
                  <span>shop now</span>
                  <MoveRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden col-span-2 lg:block">
            <Link to="/product/sea-xs">
              <Card className="flex flex-col items-center justify-end relative h-full py-6 text-center">
                <img src="https://cdn.puffly.io/img/products/sea-xs/blue-razz-ice.png" alt="" />

                <H2 className="mt-6">sea xs</H2>

                <div className="mt-2">
                  <div className="flex items-center justify-center gap-1 px-4 py-1 bg-green-950 border border-green-500 rounded-full text-green-500 text-xs font-medium leading-3 select-none">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <p>available</p>
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="px-4 py-1 bg-pink-950 border border-pink-500 rounded-full text-pink-500 text-xs font-semibold leading-3 select-none">
                    <p>new</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </BackgroundGradient>

      <div className="mt-12">
        <H2 className="text-2xl">🔥 popular products</H2>

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

      <div className="mt-12">
        <H2 className="text-2xl">🛍️ shop by brands</H2>

        <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-4 md:grid-cols-5">
          {brands.map((brand) => (
            <Link to={`/brand/${brand.slug}`} key={brand.slug}>
              <Card className="aspect-video">
                {brand.image ? (
                  <img className="w-full h-full object-contain" src={brand.image} alt={brand.name} />
                ) : (
                  <p>no image</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
