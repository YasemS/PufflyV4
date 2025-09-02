import { Star } from "lucide-react";
import { Link } from "react-router";

import format from "~/lib/format";
import img from "~/lib/img";

type ProductCardProps = {
  slug: string;
  name: string;
  image: string;
  price: number;
  rating?: number | null;
  brand: {
    slug: string;
    name: string;
  };
};

export function ProductCard(product: ProductCardProps) {
  return (
    <Link
      className="w-full p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg"
      to={`/product/${product.slug}`}
    >
      <img
        className="block w-full aspect-square object-contain"
        alt={product.name}
        src={img.transform(product.image, { width: 250, height: 250 })}
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700 text-zinc-300 text-xs leading-3">
        <p className="font-medium">{product.brand.name}</p>

        {!!product.rating && (
          <div className="flex items-center gap-1 font-semibold">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <p>{product.rating.toFixed(1)}</p>
          </div>
        )}
      </div>

      <p className="mt-1 text-sm font-semibold leading-4">{product.name}</p>

      <p className="mt-1 text-sm font-semibold leading-4">{format.currency(product.price)}</p>
    </Link>
  );
}
