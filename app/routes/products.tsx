import { Star } from "lucide-react";
import { Link } from "react-router";

import { H1 } from "~/components/Heading";

import format from "~/lib/format";

export default function Products() {
  return (
    <>
      <div className="fixed top-16 left-0 w-full h-full z-0 bg-gradient-to-r from-pink-500 via-pink-800/20 to-purple-500 blur-3xl opacity-20 rounded-bl-full"></div>

      <div className="relative z-1">
        <H1>products</H1>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <ProductCard
            slug="foger-switch-pro"
            name="foger switch pro"
            image="https://cdn.puffly.io/img/products/foger-switch-pro/coffee.png"
            price={27.5}
            rating={1.0}
            brand={{ slug: "foger", name: "foger" }}
          />

          <ProductCard
            slug="geek-bar-meloso"
            name="geek bar meloso"
            image="https://cdn.puffly.io/img/products/geek-bar-meloso/stone-freeze.png"
            price={30.0}
            rating={5.0}
            brand={{ slug: "geek-bar", name: "geek bar" }}
          />

          <ProductCard
            slug="geek-bar-pulse"
            name="geek bar pulse"
            image="https://cdn.puffly.io/img/products/geek-bar-pulse/blue-razz-ice.png"
            price={25.0}
            rating={4.3}
            brand={{ slug: "geek-bar", name: "geek bar" }}
          />

          <ProductCard
            slug="geek-bar-pulse-x"
            name="geek bar pulse x"
            image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            price={35.0}
            rating={4.9}
            brand={{ slug: "geek-bar", name: "geek bar" }}
          />

          <ProductCard
            slug="north-5000"
            name="north 5000"
            image="https://cdn.puffly.io/img/products/north-5000/mocha-frappe.png"
            price={20.0}
            rating={1.0}
            brand={{ slug: "north", name: "north" }}
          />

          <ProductCard
            slug="ria-nv30k"
            name="ria nv30k"
            image="https://cdn.puffly.io/img/products/ria-nv30k/blue-razz-ice.png"
            price={25.0}
            rating={4.3}
            brand={{ slug: "geek-bar", name: "geek bar" }}
          />

          <ProductCard
            slug="sea-xs"
            name="sea xs"
            image="https://cdn.puffly.io/img/products/sea-xs/blue-razz-ice.png"
            price={20.0}
            rating={5.0}
            brand={{ slug: "sea", name: "sea" }}
          />
        </div>
      </div>
    </>
  );
}

type ProductCardProps = {
  slug: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  brand: {
    slug: string;
    name: string;
  };
};

function ProductCard(product: ProductCardProps) {
  return (
    <Link
      className="p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg"
      to={`/product/${product.slug}`}
    >
      <img
        className="block w-full aspect-square object-contain"
        alt={product.name}
        src={product.image}
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700 text-zinc-300 text-xs leading-3">
        <p className="font-medium">{product.brand.name}</p>

        <div className="flex items-center gap-1 font-semibold">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <p>{product.rating.toFixed(1)}</p>
        </div>
      </div>

      <p className="mt-1 text-sm font-semibold leading-4">{product.name}</p>

      <p className="mt-1 text-sm font-semibold leading-4">
        {format.currency(product.price)}
      </p>
    </Link>
  );
}
