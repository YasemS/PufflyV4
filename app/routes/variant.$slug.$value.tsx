import { Link, redirect, useLoaderData } from "react-router";
import { MoveRight, Star } from "lucide-react";

import type { Route } from "./+types/variant.$slug.$value";

import Accordion from "~/components/Accordion";
import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";

import img from "~/lib/img";
import format from "~/lib/format";
import { H1, H2, H3 } from "~/components/Heading";
import { getProduct } from "~/lib/product.server";
import { getDeliveryEstimate } from "~/lib/shipping";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  let puffs = data.product.metadata.find((item) => item.key === "puffs")?.value || "";

  if (puffs.indexOf(" ") !== -1) {
    puffs = puffs.split(" ").pop() || "";
  }

  if (puffs.endsWith("k")) {
    puffs = puffs.replace("k", "000");
  }

  const title = `${format.capitalize(data.product.name)} Disposable Vape - ${format.capitalize(data.option.name)} - ${puffs.toUpperCase()} Puffs | ${format.currency(data.product.price)}`;
  const image = data.image;
  const canonical = "https://www.puffly.io/variant/" + data.product.slug + "/" + data.option.value;

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
      content: data.product.tagline,
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
      content: data.product.tagline,
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
      content: data.product.tagline,
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
            name: `${data.product.name} vape - ${data.option.name}`,
            item: canonical,
          },
        ],
      },
    },
    {
      "script:ld+json": {
        "@context": "http://schema.org",
        "@type": "Product",
        name: `${data.product.name} vape - ${data.option.name}`,
        url: canonical,
        offers: [
          {
            "@type": "https://schema.org/Offer",
            availability: "https://schema.org/InStock",
            url: canonical,
            price: data.product.price,
            priceCurrency: "USD",
            name: `${data.product.name} vape - ${data.option.name}`,
          },
        ],
        brand: {
          "@type": "Brand",
          name: data.product.brand.name,
        },
        description: data.product.description,
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
          name: `${data.product.name} vape - ${data.option.name}`,
          width: "1000",
          height: "1000",
        },
      },
    },
  ];
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug: productSlug, value: optionValue } = params;

  if (typeof productSlug !== "string") {
    return redirect("/products");
  }

  if (typeof optionValue !== "string") {
    return redirect("/products");
  }

  const product = await getProduct(productSlug);

  if (!product) {
    return redirect("/products");
  }

  if (!product.visible) {
    return redirect("/products");
  }

  const variant = product.variants.find((v) => v.options.find((o) => o.value === optionValue));

  if (!variant) {
    return redirect("/products");
  }

  const option = variant.options.find((o) => o.value === optionValue);

  if (!option) {
    return redirect("/products");
  }

  const image = product.images.find((image) => image.id === option.imageId) || product.images[0];

  if (!image) {
    return redirect("/products");
  }

  return {
    product,
    variant,
    option,
    image,
  };
}

export default function ProductVariant() {
  const { product, variant, option, image } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto text-center">
      <BackgroundGradient className="w-full">
        <Card className="aspect-square p-4">
          <img
            className="w-full h-full object-center"
            src={img.transform(image.source, { width: 450, height: 450 })}
            alt={product.name + " - " + option.name}
          />
        </Card>
      </BackgroundGradient>

      <Link className="mt-4 text-pink-500 text-sm font-semibold leading-4" to={`/brand/${product.brand.slug}`}>
        {product.brand.name}
      </Link>

      <H1 className="mt-2">
        {product.name} - {option.name}
      </H1>

      <p className="mt-2 text-xs text-zinc-300 leading-4">{product.tagline}</p>

      <ProductStars />

      <H2 className="mt-2 text-green-500">{format.currency(product.price)}</H2>

      <div className="flex flex-col items-center justify-center mt-4 pt-4 w-full border-t border-zinc-800/50">
        <Link to={`/product/${product.slug}`}>
          <Button>
            <span>buy now</span>
            <MoveRight className="w-4 h-4" />
          </Button>
        </Link>

        <ProductDeliveryEstimate />
      </div>

      <div className="w-full mt-4 pt-4 border-t border-zinc-800/50">
        <p className="font-semibold">
          get the {product.name} - {option.name} {variant.name}
        </p>

        <p className="mt-2 text-sm text-zinc-300">{product.description}</p>
      </div>

      <ProductFAQ />

      <div className="flex flex-col gap-4 w-full mt-4 pt-4 border-t border-zinc-800/50">
        {product.variants.map((variant) => (
          <div key={variant.id}>
            <H3>
              {product.name} {format.plural(variant.options.length, variant.name, variant.name + "s")}
            </H3>

            <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 mt-2">
              {variant.options.map((o) => {
                if (o.value === option.value) return null;

                return (
                  <Link
                    className="text-pink-500 font-medium underline"
                    key={o.value}
                    to={`/variant/${product.slug}/${o.value}`}
                  >
                    {product.name} - {o.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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

function ProductDeliveryEstimate() {
  return (
    <div className="flex items-center justify-center gap-2 mt-3 font-medium text-sm text-center">
      <img alt="USA" className="w-5" src="/img/usa.png" />
      <p>
        order now, get it by <span className="font-semibold text-pink-500">{getDeliveryEstimate(3)}</span>
      </p>
    </div>
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

  return <Accordion className="w-full mt-4 pt-4 border-t border-zinc-800/50 text-left" questions={questions} />;
}
