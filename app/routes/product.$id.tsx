import { Bolt, Cigarette, Cloud, Minus, Plus, Star, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Accordion from "~/components/Accordion";

import BackgroundGradient from "~/components/BackgroundGradient";
import Card from "~/components/Card";
import { H1, H2, H3 } from "~/components/Heading";

import cn from "~/lib/cn";
import format from "~/lib/format";

type ScrollerProps = React.ComponentProps<"div">;

function Scroller({ className, children, ...props }: ScrollerProps) {
  const [showStartGradient, setShowStartGradient] = useState(false);
  const [showEndGradient, setShowEndGradient] = useState(true);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const scrolled = e.currentTarget.scrollLeft;
    const maxScroll = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;

    setShowStartGradient(scrolled > 0);
    setShowEndGradient(scrolled < maxScroll - 1); // -1 to avoid showing gradient when at the end
  }

  return (
    <div className={cn("relative", className)} {...props}>
      <div className="overflow-auto no-scroll" onScroll={onScroll}>
        {children}
      </div>

      {showStartGradient && (
        <div className="absolute top-0 left-0 h-full w-1/10 bg-gradient-to-r from-zinc-950 to-transparent"></div>
      )}

      {showEndGradient && (
        <div className="absolute top-0 right-0 h-full w-1/10 bg-gradient-to-l from-zinc-950 to-transparent"></div>
      )}
    </div>
  );
}

export default function Product() {
  return (
    <>
      <ProductImage />

      <ProductThumbnails />

      <ProductInformation />

      <ProductForm />

      <ProductAlsoBought />

      <ProductFeatures />

      <ProductFAQ />

      <ProductReviews />

      <ProductSimilar />
    </>
  );
}

function ProductImage() {
  return (
    <BackgroundGradient gradientClassName="h-3/4">
      <Card className="w-full aspect-square p-4">
        <img
          alt="Geek Bar Pulse X Blue Razz Ice"
          className="w-full h-full object-contain"
          src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
        />
      </Card>
    </BackgroundGradient>
  );
}

function ProductThumbnails() {
  return (
    <Scroller className="mt-1">
      <div className="flex gap-1">
        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />

        <ProductThumbnail
          alt="Geek Bar Pulse X - Cola Slush"
          image="https://cdn.puffly.io/img/products/geek-bar-pulse-x/cola-slush.png"
        />
      </div>
    </Scroller>
  );
}

function ProductThumbnail({ alt, image }: ProductThumbnailProps) {
  return (
    <button>
      <Card className="h-16 min-w-16 w-16 aspect-square p-2">
        <img alt={alt} className="w-full h-full object-cover" src={image} />
      </Card>
    </button>
  );
}

function ProductInformation() {
  return (
    <div className="mt-4">
      <Link className="text-pink-500 text-sm font-semibold leading-4" to="#">
        geek bar
      </Link>

      <H1>geek bar pulse x</H1>

      <ProductStars />

      <H2 className="mt-8">$35.00</H2>

      <p className="mt-2 text-sm text-zinc-300 leading-4.5">
        geek bar pulse x delivers smooth flavor with up to 25,000 puffs, a
        vibrant led display, and a bold, stylish design for all-day vaping.
      </p>
    </div>
  );
}

function ProductStars() {
  return (
    <div className="flex items-center gap-0.5 mt-2">
      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
      <Star className="w-3 h-3 text-amber-500" />

      <p className="ml-1 text-zinc-300 text-xs">4.1 (500 reviews)</p>
    </div>
  );
}

function ProductForm() {
  return (
    <div className="mt-4 py-4 border-y border-zinc-800/50">
      <BackgroundGradient gradientClassName="opacity-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="text-zinc-300 text-xs font-medium"
              htmlFor="email"
            >
              flavour
            </label>

            <select className="h-10 px-3 appearance-none bg-transparent border border-zinc-700 rounded outline-none text-sm focus:border-zinc-500">
              <option value="">select a flavour</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-zinc-300 text-xs font-medium"
              htmlFor="email"
            >
              quantity
            </label>

            <div className="grid grid-cols-3 gap-1">
              <button className="flex flex-col items-center justify-center p-4 border border-zinc-700 rounded">
                <p className="font-semibold">buy 1</p>
              </button>

              <button className="flex flex-col items-center justify-center relative p-4 border border-pink-500 rounded">
                <p className="font-semibold">buy 2</p>
                <p className="text-pink-500 text-xs font-medium">save 5%</p>

                <p className="absolute top-0 left-1/2 -translate-1/2 px-1.5 py-0.5 bg-pink-500 rounded text-nowrap text-xs font-semibold">
                  most popular
                </p>
              </button>

              <button className="flex flex-col items-center justify-center relative p-4 border border-zinc-700 rounded">
                <p className="font-semibold">buy 3</p>
                <p className="text-pink-500 text-xs font-medium">save 10%</p>

                <p className="absolute top-0 left-1/2 -translate-1/2 px-1.5 py-0.5 bg-transparent backdrop-blur border border-pink-500 rounded text-pink-500 text-nowrap text-xs font-semibold">
                  best value
                </p>
              </button>
            </div>
          </div>

          <button className="bg-pink-500 text-sm font-semibold flex items-center justify-center gap-2 h-10 w-full rounded-md">
            <span>add to cart</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 font-medium text-sm text-center">
          <img alt="USA" className="w-5" src="/img/usa.png" />
          <p>
            order now, get it by{" "}
            <span className="font-medium text-pink-500">aug 8 2025</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mt-3">
          <img alt="visa" className="h-5 rounded-xs" src="/img/visa.svg" />

          <img
            alt="mastercard"
            className="h-5 rounded-xs"
            src="/img/mastercard.svg"
          />

          <img
            alt="diners club"
            className="h-5 rounded-xs"
            src="/img/diners.svg"
          />

          <img
            alt="discover"
            className="h-5 rounded-xs"
            src="/img/discover.svg"
          />

          <img
            alt="american express"
            className="h-5 rounded-xs"
            src="/img/amex.svg"
          />
        </div>
      </BackgroundGradient>
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
            <p className="text-zinc-300 text-xs font-medium leading-3">
              monster
            </p>

            <p className="font-semibold leading-4">monster zero ultra</p>

            <div className="flex items-end justify-between mt-auto">
              <p className="font-semibold leading-4">$5.00</p>

              <button className="px-4 py-1 bg-pink-500 rounded text-xs font-semibold">
                add
              </button>
            </div>
          </div>
        </Card>
      </BackgroundGradient>
    </div>
  );
}

function ProductFeatures() {
  return (
    <BackgroundGradient
      className="mt-4"
      gradientClassName="h-4/5 bg-gradient-to-r"
    >
      <div className="grid grid-cols-3 gap-1">
        <ProductFeature
          icon={<Zap className="w-8 h-8" />}
          text="usb-c charging"
        />

        <ProductFeature
          icon={<Cigarette className="w-8 h-8" />}
          text="5% nicotine"
        />

        <ProductFeature
          icon={<Cloud className="w-8 h-8" />}
          text="15-25k puffs"
        />
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
  const questions = [
    {
      question: "about the geek bar pulse x",
      answer:
        "the geek bar pulse x is a high-performance disposable vape designed for long-lasting enjoyment. it offers up to 25,000 puffs in regular mode and 15,000 in pulse mode, minimizing the need for frequent replacements. with an 18ml e-liquid capacity and dual mesh coil, it delivers smooth, flavorful vapor. an innovative 3d display lets you easily check both e-liquid and battery levels.",
    },
    {
      question: "can I pay with a different method?",
      answer:
        "yes, just reach out to us through one of the methods below, and we'll help arrange an alternative payment method.",
    },
    {
      question: "do you offer discreet shipping?",
      answer:
        "yes, all orders are shipped in non-branded, discreet packaging to ensure your privacy.",
    },
    {
      question: "how long does shipping take?",
      answer:
        "our standard shipping time is estimated at 2-4 business days after your order is processed.",
    },
  ];

  return (
    <Accordion
      className="mt-4 pt-4 border-t border-zinc-800/50"
      questions={questions}
    />
  );
}

function ProductReview() {
  return (
    <Card className="flex flex-col">
      <div className="flex gap-3">
        <div className="flex items-center justify-center min-w-10 w-10 h-10 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl">
          <p className="text-2xl font-bold">h</p>
        </div>

        <div className="flex flex-col pt-1">
          <p className="text-sm font-semibold leading-4">hunter parker</p>

          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <Star className="w-3 h-3 text-amber-500" />
          </div>
        </div>

        <p className="mt-1 ml-auto text-xs text-zinc-300">3 hours ago</p>
      </div>

      <p className="mt-2 pt-2 border-t border-zinc-700 text-sm font-semibold">
        Love them!
      </p>

      <p className="mt-0.5 text-zinc-300 text-xs leading-4">
        Easy checkout, fast shipping, and a great pick for the smaller mystery
        vape I was given. I will be ordering again!!
      </p>
    </Card>
  );
}

function ProductReviews() {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      <H2>customer reviews</H2>

      <BackgroundGradient
        className="mt-2"
        gradientClassName="bg-gradient-to-r left-3/4 w-1/2"
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <p className="text-5xl font-bold leading-12">5.0</p>

            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <Star className="w-4 h-4 text-amber-500" />
            </div>

            <p className="mt-2 text-zinc-300 text-sm leading-4">100 reviews</p>
          </div>

          <div className="flex flex-col justify-center gap-1 w-full">
            <div className="flex items-center gap-1.5">
              <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">
                5
              </p>

              <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">
                4
              </p>

              <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">
                3
              </p>

              <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">
                2
              </p>

              <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="w-3 text-zinc-300 text-sm text-center font-semibold leading-4">
                1
              </p>

              <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
                <div className="w-3/4 h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </BackgroundGradient>

      <BackgroundGradient className="mt-4">
        <div className="flex flex-col gap-2">
          <ProductReview />
          <ProductReview />
          <ProductReview />
          <ProductReview />
          <ProductReview />
        </div>
      </BackgroundGradient>
    </div>
  );
}

function ProductCard(product: ProductCardProps) {
  return (
    <Link
      className="flex flex-col p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg"
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

function ProductSimilar() {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/50">
      <H2>similar products</H2>

      <BackgroundGradient
        className="mt-4"
        gradientClassName="w-1/2 h-1/2 bg-gradient-to-r"
      >
        <Scroller>
          <div className="flex items-center gap-2">
            <div className="min-w-1/2 w-1/2">
              <ProductCard
                slug="foger-switch-pro"
                name="foger switch pro"
                image="https://cdn.puffly.io/img/products/foger-switch-pro/coffee.png"
                price={27.5}
                rating={1.0}
                brand={{ slug: "foger", name: "foger" }}
              />
            </div>

            <div className="min-w-1/2 w-1/2">
              <ProductCard
                slug="foger-switch-pro"
                name="foger switch pro"
                image="https://cdn.puffly.io/img/products/foger-switch-pro/coffee.png"
                price={27.5}
                rating={1.0}
                brand={{ slug: "foger", name: "foger" }}
              />
            </div>

            <div className="min-w-1/2 w-1/2">
              <ProductCard
                slug="foger-switch-pro"
                name="foger switch pro"
                image="https://cdn.puffly.io/img/products/foger-switch-pro/coffee.png"
                price={27.5}
                rating={1.0}
                brand={{ slug: "foger", name: "foger" }}
              />
            </div>
          </div>
        </Scroller>
      </BackgroundGradient>
    </div>
  );
}

type ProductThumbnailProps = {
  alt: string;
  image: string;
};

type ProductFeatureProps = {
  icon: React.ReactNode;
  text: string;
};

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
