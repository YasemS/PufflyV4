import { Link, redirect, useLoaderData } from "react-router";
import { CircleQuestionMark, MoveRight, Star } from "lucide-react";

import type { Route } from "./+types/variant.$slug.$value";

import Accordion from "~/components/Accordion";
import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";

import img from "~/lib/img";
import format from "~/lib/format";
import prisma from "~/lib/prisma.server";
import { H1, H2, H3 } from "~/components/Heading";
import { getProduct } from "~/lib/product.server";
import { getDeliveryEstimate } from "~/lib/shipping";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  let puffs = data.product.metadata.find((item) => item.key === "puffs")?.value || "";

  if (puffs.indexOf(" ") !== -1) {
    puffs = puffs.split(" ").pop() || "";
  }

  const name = format.capitalize(data.product.name) + " " + format.capitalize(data.option.name);
  const title = `${name} ${puffs.toUpperCase()} Puffs | ${format.currency(data.product.price)}`;
  const description =
    data.option.seoDescription || data.product.seoDescription || format.capitalize(data.product.tagline);
  const image = data.image;
  const canonical = "https://www.puffly.io/variant/" + data.product.slug + "/" + data.option.value;

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
        offers: [
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
        description: description,
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
          name,
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

  const vOption = variant.options.find((o) => o.value === optionValue);

  if (!vOption) {
    return redirect("/products");
  }

  const rOption = await prisma.productVariantOption.findFirst({
    select: {
      seoDescription: true,
    },
    where: {
      value: vOption.value,
      variantId: variant.id,
    },
  });

  if (!rOption) {
    return redirect("/products");
  }

  const option = { ...vOption, ...rOption };

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
  const { product, option, image } = useLoaderData<typeof loader>();

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
        {product.name} {option.name}
      </H1>

      <p className="mt-2 text-sm text-zinc-300 leading-4.5">{product.tagline}</p>

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

      <ProductFAQ />

      <div className="w-full mt-4 pt-8 pb-4 border-t border-zinc-800/50">
        {option.seoDescription && (
          <>
            <H3>
              about the {product.name} {option.name}
            </H3>

            <p className="mt-1 text-sm text-zinc-300">{option.seoDescription.toLowerCase()}</p>
          </>
        )}

        <H3 className="mt-8 first:mt-0">about the {product.name}</H3>

        {product.seoDescription && (
          <>
            <p className="mt-1 text-sm text-zinc-300">{product.seoDescription.toLowerCase()}</p>
          </>
        )}

        <p className="mt-2 text-sm text-zinc-300">{product.description}</p>
      </div>

      <div className="flex flex-col gap-4 w-full mt-4 pt-4 border-t border-zinc-800/50">
        {product.variants.map((variant) => (
          <div key={variant.id}>
            <H3>
              {product.name} {format.plural(variant.options.length, variant.name, variant.name + "s")}
            </H3>

            <BackgroundGradient gradientClassName="opacity-10">
              <div className="flex flex-col gap-2 mt-4">
                {variant.options.map((o) => {
                  if (o.value === option.value) return null;

                  const image = o.imageId ? product.images.find((img) => img.id === o.imageId) : null;

                  return (
                    <Link key={o.value} to={`/variant/${product.slug}/${o.value}`}>
                      <Card className="flex items-center gap-4">
                        <Card className="flex items-center justify-center min-w-16 w-16 h-16 border-zinc-700">
                          {image ? (
                            <img
                              className="w-full h-full object-contain"
                              src={img.transform(image.source, { width: 100, height: 100 })}
                              alt={o.name}
                            />
                          ) : (
                            <CircleQuestionMark className="w-8 h-8" />
                          )}
                        </Card>

                        <p className="text-left font-semibold">
                          {product.name} {o.name}
                        </p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </BackgroundGradient>
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
