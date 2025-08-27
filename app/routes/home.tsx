import { CheckCircle, CircleAlert, CircleQuestionMark, Mail, MoveRight, Star } from "lucide-react";
import { Link, useFetcher, useLoaderData } from "react-router";
import Marquee from "react-fast-marquee";

import type { action as EmailSubscribeAction } from "~/routes/email.subscribe";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import { H1, H2 } from "~/components/Heading";
import { ProductCard } from "~/components/Product";

import prisma from "~/lib/prisma.server";
import { getProducts } from "~/lib/product.server";
import { useEffect, useState } from "react";

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
        <HomeMarquee />

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

      <div className="mt-16">
        <H2 className="text-2xl">🔥 popular products</H2>

        <BackgroundGradient gradientClassName="opacity-10">
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
        </BackgroundGradient>
      </div>

      <div className="mt-16">
        <H2 className="text-2xl">🛍️ shop by brands</H2>

        <BackgroundGradient gradientClassName="opacity-10">
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
        </BackgroundGradient>
      </div>

      <HomeSubscribe />
    </>
  );
}

function HomeMarquee() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <Card className="mb-2 text-sm font-bold select-none">
      <Marquee className="flex" autoFill={true} speed={40}>
        <span className="block w-1 h-1 bg-pink-500 rounded-full"></span>

        <div className="flex items-center gap-1 px-4 text-pink-500">
          <span>rated 5</span> <Star className="inline w-3 h-3 fill-pink-500" />
        </div>

        <span className="block w-1 h-1 bg-pink-500 rounded-full"></span>

        <p className="px-4">free shipping for orders over $40</p>

        <span className="block w-1 h-1 bg-pink-500 rounded-full"></span>

        <p className="px-4 text-pink-500">multiple payment methods</p>

        <span className="block w-1 h-1 bg-pink-500 rounded-full"></span>

        <p className="px-4">14 day returns</p>
      </Marquee>
    </Card>
  );
}

function HomeSubscribe() {
  const fetcher = useFetcher<typeof EmailSubscribeAction>();
  const loading = fetcher.state !== "idle";

  const error = !loading && fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;
  const success = !loading && fetcher.data && "success" in fetcher.data ? fetcher.data.success : null;

  return (
    <div className="mt-16">
      <BackgroundGradient>
        <Card className="grid gap-8 p-3 sm:grid-cols-2">
          <div className="hidden relative rounded overflow-hidden sm:block md:aspect-video">
            <img className="w-full h-full object-cover" src="/img/email-banner.jpg" alt="email banner" />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-pink-500 opacity-80"></div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col items-center justify-center my-auto text-center">
              <div className="flex items-center justify-center min-w-16 w-16 h-16 bg-pink-800/50 border border-pink-500 text-pink-500 rounded-lg">
                <Mail className="w-8 h-8" />
              </div>

              <H2 className="mt-4 text-base leading-4 sm:text-xl sm:leading-5">subscribe for offers and more</H2>

              <p className="mt-1 text-zinc-300 text-xs leading-3.5 sm:text-sm sm:leading-4">
                join to be the first to receive exclusive deals, new product launches, and more from us.
              </p>

              <fetcher.Form
                action="/email/subscribe"
                className="flex flex-col gap-2 max-w-sm w-full mt-4"
                method="post"
              >
                {success && (
                  <div className="flex items-center gap-2 w-full px-2 py-1.5 bg-green-950 border border-green-500 rounded text-green-500 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <p>thanks for subscribing!</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 w-full px-2 py-1.5 bg-red-950 border border-red-500 rounded text-red-500 text-sm font-semibold">
                    <CircleAlert className="w-4 h-4" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex w-full">
                  <Input
                    className="w-full rounded-r-none"
                    name="email"
                    type="text"
                    placeholder="enter your email address"
                  />

                  <Button className="border-l-0 rounded-l-none px-4" disabled={loading} variant="outline">
                    join
                  </Button>
                </div>
              </fetcher.Form>
            </div>

            {/* <Link
                to="/blog"
                className="flex items-center justify-center gap-2 ml-auto text-xs font-medium hover:underline"
              >
                <span>read our blog</span>
                <MoveRight className="w-4 h-4" />
              </Link> */}
          </div>
        </Card>
      </BackgroundGradient>
    </div>
  );
}
