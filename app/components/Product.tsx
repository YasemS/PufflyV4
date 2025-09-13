import { CircleQuestionMark, Star } from "lucide-react";
import { Link } from "react-router";

import format from "~/lib/format";
import img from "~/lib/img";
import Card from "./Card";

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
      className="w-full p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg group hover:border-zinc-700"
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

      <p className="mt-1 text-sm font-semibold leading-4 underline-offset-1 group-hover:underline">{product.name}</p>

      <p className="mt-1 text-sm font-semibold leading-4">{format.currency(product.price)}</p>
    </Link>
  );
}

type ProductVariantCardProps = {
  product: {
    slug: string;
    name: string;
  };
  option: {
    name: string;
    value: string;
  };
  image?: {
    alt: string;
    source: string;
  } | null;
};

export function ProductVariantCard({ product, option, image }: ProductVariantCardProps) {
  return (
    <Link to={`/variant/${product.slug}/${option.value}`}>
      <Card className="flex items-center gap-4 hover:border-zinc-700">
        <Card className="flex items-center justify-center min-w-16 w-16 h-16 p-2 border-zinc-700">
          {image ? (
            <img
              className="w-full h-full object-contain"
              src={img.transform(image.source, { width: 50, height: 50 })}
              alt={option.name}
            />
          ) : (
            <CircleQuestionMark className="w-8 h-8" />
          )}
        </Card>

        <div className="flex flex-col gap-1 text-left">
          <p className="text-xs text-zinc-300 leading-3 font-semibold">{product.name}</p>

          <p className="font-semibold text-base leading-4">{option.name}</p>
        </div>
      </Card>
    </Link>
  );
}
