import { createContext, useContext, useEffect, useState } from "react";
import { AlertCircle, Cigarette, Cloud, Star, Zap } from "lucide-react";
import { Link, redirect, useFetcher, useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/product.$slug";

import Accordion from "~/components/Accordion";
import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import InputControl from "~/components/InputControl";
import Label from "~/components/Label";
import Scroller from "~/components/Scroller";
import Select from "~/components/Select";
import { H1, H2, H3 } from "~/components/Heading";
import { ProductCard } from "~/components/Product";

import cn from "~/lib/cn";
import fbq from "~/lib/analytics/fbq.client";
import format from "~/lib/format";
import gtag from "~/lib/analytics/gtag.client";
import img from "~/lib/img";
import { getProduct, getSimilarProducts } from "~/lib/product.server";
import { getDeliveryEstimate } from "~/lib/shipping";

const ProductContext = createContext<{
  price: number;
  quantity: number;
}>({
  price: 0,
  quantity: 1,
});

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  let puffs = data.product.metadata.find((item) => item.key === "puffs")?.value || "";

  if (puffs.indexOf(" ") !== -1) {
    puffs = puffs.split(" ").pop() || "";
  }

  if (puffs.endsWith("k")) {
    puffs = puffs.replace("k", "000");
  }

  const name = format.capitalize(data.product.name);
  const title = `${name} Disposable Vape ${puffs.toUpperCase()} Puffs | ${format.currency(data.product.price)}`;
  const description = data.product.seoDescription || format.capitalize(data.product.tagline);
  const image = data.product.images[0];
  const canonical = "https://www.puffly.io/product/" + data.product.slug;

  const priceValidUntil = "2026-12-31T23:59:59Z";

  const ratings = {
    average: data.product.reviews.stats.average || 0,
    count: data.product.reviews.stats.count || 0,
    worst: Math.min(...data.product.reviews.list.map((review) => review.rating)),
    best: Math.max(...data.product.reviews.list.map((review) => review.rating)),
  };

  return [
    { title: title },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:site_name",
      content: "Puffly",
    },
    {
      property: "og:url",
      content: canonical,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:type",
      content: "product",
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: image.source,
    },
    {
      property: "og:image:width",
      content: "1000",
    },
    {
      property: "og:image:height",
      content: "1000",
    },
    {
      property: "og:price:amount",
      content: data.product.price.toFixed(2),
    },
    {
      property: "og:price:currency",
      content: "USD",
    },
    {
      name: "twitter:site",
      content: "@pufflyio",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:description",
      content: description,
    },
    {
      tagName: "link",
      rel: "canonical",
      href: canonical,
    },
    {
      "script:ld+json": [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "puffly",
          url: "https://www.puffly.io",
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "puffly",
          url: "https://www.puffly.io",
          logo: "https://cdn.puffly.io/img/logo.png",
          sameAs: [
            "https://www.x.com/pufflyio",
            "https://www.instagram.com/pufflyio",
            "https://www.tiktok.com/@pufflyio",
            "https://www.youtube.com/@pufflyio",
          ],
        },
      ],
    },
    {
      "script:ld+json": {
        "@context": "http://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.puffly.io",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonical,
          },
        ],
      },
    },
    {
      "script:ld+json": {
        "@context": "http://schema.org",
        "@type": "Product",
        name,
        url: canonical,
        offers:
          data.product.variants.length >= 1
            ? data.product.variants[0].options.map((option) => ({
                "@type": "https://schema.org/Offer",
                availability: "https://schema.org/InStock",
                url: canonical,
                price: data.product.price,
                priceCurrency: "USD",
                priceValidUntil: priceValidUntil,
                name: `${name} ${format.capitalize(option.name)}`,
              }))
            : [
                {
                  "@type": "https://schema.org/Offer",
                  availability: "https://schema.org/InStock",
                  url: canonical,
                  price: data.product.price,
                  priceCurrency: "USD",
                  priceValidUntil: priceValidUntil,
                  name,
                },
              ],
        brand: {
          "@type": "Brand",
          name: data.product.brand.name,
        },
        description,
        category: "vape",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratings.average.toFixed(2),
          reviewCount: ratings.count,
          worstRating: ratings.worst,
          bestRating: ratings.best,
        },
        image: {
          "@type": "ImageObject",
          url: image.source,
          image: image.source,
          name: name,
          width: "1000",
          height: "1000",
        },
      },
    },
  ];
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  if (typeof slug !== "string") {
    return redirect("/products");
  }

  const product = await getProduct(slug);

  if (!product) {
    return redirect("/products");
  }

  if (!product.visible) {
    return redirect("/products");
  }

  const similar = await getSimilarProducts(slug);

  return { product, similar };
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>();

  const imageDefault = product.images[0];
  const [imageActive, setImageActive] = useState<(typeof product.images)[0]>(imageDefault);

  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(1);

  function onQuantityChange(newQuantity: number) {
    setQuantity(newQuantity);

    const discount = newQuantity === 3 ? 10 : newQuantity === 2 ? 5 : 0;

    setPrice(product.price * (1 - discount / 100));
  }

  function onVariantChange(id: string, value: string) {
    fbq.track("CustomizeProduct");

    const variant = product.variants.find((variant) => variant.id === id);

    if (!variant) return;

    const option = variant.options.find((option) => option.value === value);

    if (!option) return;

    const image = product.images.find((image) => image.id === option.imageId);

    if (!image) return;

    setImageActive(image);
  }

  useEffect(() => {
    fbq.track("ViewContent", {
      content_ids: [product.slug],
      content_type: "product",
      contents: [{ id: product.slug, quantity, item_price: product.price }],
      currency: "USD",
      value: product.price,
    });

    gtag.track("view_item", {
      currency: "USD",
      value: product.price,
      items: [
        {
          item_id: product.slug,
          item_name: product.name,
          item_brand: product.brand.name,
          price: product.price,
          quantity,
        },
      ],
    });
  }, [product]);

  useEffect(() => {
    setImageActive(imageDefault);
    setPrice(product.price);
    setQuantity(1);
  }, [product]);

  return (
    <ProductContext.Provider value={{ price, quantity }}>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col max-w-sm md:max-w-none">
          <div className="sticky top-24">
            <ProductImage {...imageActive} />

            <ProductThumbnails>
              {product.images.map((image) => (
                <ProductThumbnail
                  key={image.id}
                  alt={image.alt}
                  selected={imageActive.id === image.id}
                  source={image.source}
                  onClick={() => setImageActive(image)}
                />
              ))}
            </ProductThumbnails>
          </div>
        </div>

        <div className="flex flex-col">
          <ProductInformation />

          <ProductForm onQuantityChange={onQuantityChange} onVariantChange={onVariantChange} />

          <ProductFeatures />

          <ProductFAQ />
        </div>
      </div>

      <ProductReviews />

      <ProductSimilar />
    </ProductContext.Provider>
  );
}

function ProductImage({ alt, source }: { alt: string; source: string }) {
  return (
    <BackgroundGradient gradientClassName="h-3/4">
      <Card className="w-full aspect-square p-4">
        <img
          alt={alt}
          className="w-full h-full object-contain"
          src={img.transform(source, { width: 460, height: 460 })}
        />
      </Card>
    </BackgroundGradient>
  );
}

function ProductThumbnails({ children }: { children: React.ReactNode }) {
  return (
    <Scroller className="mt-1">
      <div className="flex gap-1">{children}</div>
    </Scroller>
  );
}

function ProductThumbnail({ alt, selected, source, onClick }: ProductThumbnailProps) {
  return (
    <button onClick={onClick}>
      <Card className={cn("h-16 min-w-16 w-16 aspect-square p-2 cursor-pointer", selected && "border-zinc-700")}>
        <img alt={alt} className="w-full h-full object-cover" src={img.transform(source, { width: 50, height: 50 })} />
      </Card>
    </button>
  );
}

function ProductInformation() {
  const { product } = useLoaderData<typeof loader>();

  const { price, quantity } = useContext(ProductContext);

  return (
    <div className="mt-4">
      <Link className="text-pink-500 text-sm font-semibold leading-4" to={`/brand/${product.brand.slug}`}>
        {product.brand.name}
      </Link>

      <H1>{product.name}</H1>

      <ProductStars />

      <div className="flex items-center gap-1 mt-8">
        <H2 className={cn(price !== product.price && "text-green-500")}>{format.currency(price * quantity)}</H2>

        {price !== product.price && (
          <H3 className="text-base text-zinc-300 leading-4 line-through">
            {format.currency(product.price * quantity)}
          </H3>
        )}
      </div>

      <p className="mt-1 text-xs text-zinc-300 leading-4">{product.tagline}</p>
    </div>
  );
}

function ProductStars() {
  const { product } = useLoaderData<typeof loader>();

  if (product.reviews.list.length === 0) return null;

  const averageInt = parseInt(product.reviews.stats.average?.toFixed(0) ?? "0");

  return (
    <div className="flex items-center gap-0.5 mt-2">
      {[...Array(averageInt)].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
      ))}

      {[...Array(5 - (averageInt || 0))].map((_, i) => (
        <Star key={i} className="w-3 h-3 text-amber-500" />
      ))}

      <p className="ml-1 text-zinc-300 text-xs">
        {product.reviews.stats.average?.toFixed(1)} ({product.reviews.stats.count}{" "}
        {format.plural(product.reviews.stats.count, "review", "reviews")})
      </p>
    </div>
  );
}

function ProductForm({ onQuantityChange, onVariantChange }: ProductFormProps) {
  const { product } = useLoaderData<typeof loader>();

  const { quantity, price } = useContext(ProductContext);

  const fetcher = useFetcher();
  const nav = useNavigate();

  const error = fetcher.data?.error;

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data) return;

    if ("success" in fetcher.data) {
      fbq.track("AddToCart", {
        contents: [
          {
            id: product.slug,
            quantity: quantity,
            item_price: price,
          },
        ],
        content_ids: [product.slug],
        content_type: "product", // Type of content (product, product_group, etc.)
        value: price, // Total value of added items (sum of all quantities * prices)
        currency: "USD", // Currency code (ISO 4217)
      });

      gtag.track("add_to_cart", {
        currency: "USD",
        value: price,
        items: [
          {
            item_id: product.slug,
            item_name: product.name,
            item_brand: product.brand.name,
            price: price,
            quantity: quantity,
          },
        ],
      });

      nav("/cart");
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="mt-4 py-4 border-y border-zinc-800/50">
      <BackgroundGradient gradientClassName="opacity-10">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-red-950/50 border border-red-500 rounded text-red-500">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <fetcher.Form action="/cart/add" className="flex flex-col gap-4" method="post">
          <input type="hidden" name="product" value={product.slug} />

          {product.variants.map((variant) => {
            return [...Array(quantity)].map((_, index) => (
              <InputControl key={variant.id + index}>
                <Label htmlFor={`variant__${variant.id}__${index}`}>
                  {variant.name} {index > 0 ? `(${index + 1})` : ""}
                </Label>

                <Select
                  defaultValue=""
                  id={`variant__${variant.id}__${index}`}
                  name={`variant__${variant.id}`}
                  onChange={(e) => onVariantChange(variant.id, e.target.value)}
                >
                  <option value="" disabled>
                    select {variant.name}
                  </option>

                  {variant.options.map((option) => (
                    <option key={option.name} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </InputControl>
            ));
          })}

          <InputControl>
            <Label htmlFor="quantity">quantity</Label>

            <div className="grid grid-cols-3 gap-1">
              <ProductQuantityButton active={quantity === 1} text="buy 1" onClick={() => onQuantityChange(1)} />

              <ProductQuantityButton
                active={quantity === 2}
                text="buy 2"
                discount={5}
                tag="most popular"
                onClick={() => onQuantityChange(2)}
              />

              <ProductQuantityButton
                active={quantity === 3}
                text="buy 3"
                discount={10}
                tag="best value"
                tagStyle="secondary"
                onClick={() => onQuantityChange(3)}
              />
            </div>
          </InputControl>

          <Button type="submit">add to cart</Button>
        </fetcher.Form>

        <ProductDeliveryEstimate />

        <ProductPaymentMethods />
      </BackgroundGradient>
    </div>
  );
}

function ProductQuantityButton({
  text,
  discount,
  tag,
  tagStyle = "primary",
  active,
  onClick,
}: ProductQuantityButtonProps) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center relative p-4 border border-zinc-700 rounded",
        active && "border-pink-500",
      )}
      type="button"
      onClick={onClick}
    >
      <p className="font-semibold">{text}</p>
      {discount && <p className="text-pink-500 text-xs font-medium">save {discount}%</p>}

      {tag && (
        <p
          className={cn(
            "absolute top-0 left-1/2 -translate-1/2 px-1.5 py-0.5 rounded text-nowrap text-xs font-semibold",
            tagStyle === "secondary" && "bg-transparent backdrop-blur border border-pink-500 text-pink-500",
            tagStyle === "primary" && "bg-pink-500",
          )}
        >
          {tag}
        </p>
      )}
    </button>
  );
}

function ProductDeliveryEstimate() {
  return (
    <div className="flex items-center justify-center gap-2 mt-4 font-medium text-sm text-center">
      <img alt="USA" className="w-5" src="/img/usa.png" />
      <p>
        order now, get it by <span className="font-semibold text-pink-500">{getDeliveryEstimate(3)}</span>
      </p>
    </div>
  );
}

function ProductPaymentMethods() {
  return (
    <div className="flex items-center justify-center gap-1 mt-3">
      <img alt="visa" className="h-5 rounded-xs" src="/img/visa.svg" />

      <img alt="mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" />

      <img alt="diners club" className="h-5 rounded-xs" src="/img/diners.svg" />

      <img alt="discover" className="h-5 rounded-xs" src="/img/discover.svg" />
    </div>
  );
}

function ProductAlsoBought() {
  return (
    <div className="py-4 border-b border-zinc-800/50">
      <p className="font-semibold leading-4">customers also bought</p>

      <BackgroundGradient className="mt-2" gradientClassName="bg-gradient-to-l">
        <Card className="flex items-center gap-3">
          <Card className="min-w-16 w-16 h-16 p-1 border-zinc-700">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://i0.wp.com/vikingcocacola.com/wp-content/uploads/2020/11/Monster-Zero-Ultra.png?fit=750%2C1000&ssl=1"
            />
          </Card>

          <div className="flex flex-col w-full h-16">
            <p className="text-zinc-300 text-xs font-medium leading-3">monster</p>

            <p className="font-semibold leading-4">monster zero ultra</p>

            <div className="flex items-end justify-between mt-auto">
              <p className="font-semibold leading-4">$5.00</p>

              <button className="px-4 py-1 bg-pink-500 rounded text-xs font-semibold">add</button>
            </div>
          </div>
        </Card>
      </BackgroundGradient>
    </div>
  );
}

function ProductFeatures() {
  const { product } = useLoaderData<typeof loader>();

  const charging = product.metadata.find((item) => item.key === "charging")?.value || "";
  const nicotine = product.metadata.find((item) => item.key === "nicotine")?.value || "";
  const puffs = product.metadata.find((item) => item.key === "puffs")?.value || "";

  return (
    <BackgroundGradient className="mt-4" gradientClassName="h-4/5 bg-gradient-to-r">
      <div className="grid grid-cols-3 gap-1">
        <ProductFeature icon={<Zap className="w-8 h-8" />} text={charging + " charging"} />

        <ProductFeature icon={<Cigarette className="w-8 h-8" />} text={nicotine + " nicotine"} />

        <ProductFeature icon={<Cloud className="w-8 h-8" />} text={puffs + " puffs"} />
      </div>
    </BackgroundGradient>
  );
}

function ProductFeature({ icon, text }: ProductFeatureProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center">
      <span className="text-pink-500">{icon}</span>

      <p className="mt-2 text-sm text-zinc-300 font-semibold">{text}</p>
    </Card>
  );
}

function ProductFAQ() {
  const { product } = useLoaderData<typeof loader>();

  const questions = [
    {
      question: "about the " + product.name,
      answer: product.description,
    },
    {
      question: "can I pay with a different method?",
      answer:
        "yes, just reach out to us through one of the methods below, and we'll help arrange an alternative payment method.",
    },
    {
      question: "do you offer discreet shipping?",
      answer: "yes, all orders are shipped in non-branded, discreet packaging to ensure your privacy.",
    },
    {
      question: "how long does shipping take?",
      answer: "our standard shipping time is estimated at 2-4 business days after your order is processed.",
    },
  ];

  return <Accordion className="mt-4 pt-4 border-t border-zinc-800/50" questions={questions} />;
}

function ProductReview(review: ProductReviewProps) {
  return (
    <div className="break-inside-avoid mb-2">
      <Card className="flex flex-col">
        <div className="flex gap-3">
          <div className="flex items-center justify-center min-w-10 w-10 h-10 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl">
            <p className="text-2xl font-bold">{review.name.charAt(0) || "?"}</p>
          </div>

          <div className="flex flex-col pt-1">
            <p className="text-sm font-semibold leading-4">{review.name}</p>

            <div className="flex items-center gap-1 mt-1">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
              ))}

              {[...Array(5 - (review.rating || 0))].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-500" />
              ))}
            </div>
          </div>

          <p className="mt-1 ml-auto text-xs text-zinc-300">
            {review.created
              .toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
              .toLowerCase()}
          </p>
        </div>

        <p className="mt-2 pt-2 border-t border-zinc-700 text-sm font-semibold">{review.title}</p>

        <p className="mt-0.5 text-zinc-300 text-xs leading-4">{review.content}</p>
      </Card>
    </div>
  );
}

function ProductReviews() {
  const { product } = useLoaderData<typeof loader>();

  if (product.reviews.list.length === 0) return null;

  const averageInt = parseInt(product.reviews.stats.average?.toFixed(0) ?? "0");

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      <H2>customer reviews</H2>

      <BackgroundGradient
        className="mt-2 max-w-sm w-full"
        gradientClassName="bg-gradient-to-r left-3/4 w-1/2 md:opacity-10"
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <p className="text-5xl font-bold leading-12">{product.reviews.stats.average?.toFixed(1)}</p>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(averageInt)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
              ))}

              {[...Array(5 - (averageInt || 0))].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-500" />
              ))}
            </div>

            <p className="mt-2 text-zinc-300 text-sm leading-4">
              {product.reviews.stats.count} {format.plural(product.reviews.stats.count, "review", "reviews")}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-1 w-full">
            {Object.entries(product.reviews.stats.ratings)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-1.5">
                  <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">{rating}</p>

                  <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                    {count ? (
                      <div
                        className="w-0 h-full bg-amber-500 rounded-full"
                        style={{ width: `${(count / product.reviews.stats.count) * 100}%` }}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </BackgroundGradient>

      <BackgroundGradient className="mt-4" gradientClassName="md:opacity-10">
        <div className="columns-1 gap-2 sm:columns-2 md:columns-3">
          {product.reviews.list.map((review) => (
            <ProductReview key={review.id} {...review} />
          ))}
        </div>
      </BackgroundGradient>
    </div>
  );
}

function ProductSimilar() {
  const { similar } = useLoaderData<typeof loader>();

  if (similar.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      <H2>similar products</H2>

      <BackgroundGradient className="mt-4" gradientClassName="w-1/2 h-1/2 bg-gradient-to-r md:opacity-10">
        <Scroller>
          <div className="flex items-center gap-2">
            {similar.map((product) => (
              <div className="flex min-w-1/2 w-1/2 sm:w-1/3 sm:min-w-1/3 md:w-1/4 md:min-w-1/4" key={product.slug}>
                <ProductCard
                  slug={product.slug}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  rating={product.rating}
                  brand={product.brand}
                />
              </div>
            ))}
          </div>
        </Scroller>
      </BackgroundGradient>
    </div>
  );
}

type ProductThumbnailProps = {
  alt: string;
  selected?: boolean;
  source: string;
  onClick: () => void;
};

type ProductFeatureProps = {
  icon: React.ReactNode;
  text: string;
};

type ProductFormProps = {
  onQuantityChange: (newQuantity: number) => void;
  onVariantChange: (id: string, value: string) => void;
};

type ProductQuantityButtonProps = {
  text: string;
  discount?: number;

  tag?: string;
  tagStyle?: "primary" | "secondary";

  active?: boolean;
  onClick?: () => void;
};

type ProductReviewProps = {
  rating: number;
  name: string;
  title: string;
  content: string;
  verified: boolean;
  created: Date;
};
