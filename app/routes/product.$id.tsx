import { Bolt, Cigarette, Cloud, Star, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Card from "~/components/Card";
import { H1, H2, H3 } from "~/components/Heading";
import cn from "~/lib/cn";

type BackgroundGradientProps = React.ComponentProps<"div"> & {
  gradientClassName?: string;
};

function BackgroundGradient({
  className,
  children,
  gradientClassName,
  ...props
}: BackgroundGradientProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="relative z-1">{children}</div>

      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-1/2 w-full h-full bg-gradient-to-b from-pink-500 to-purple-500 blur-3xl opacity-20 z-0",
          gradientClassName
        )}
      ></div>
    </div>
  );
}

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
      <BackgroundGradient gradientClassName="h-3/4">
        <ProductImage />
      </BackgroundGradient>

      <ProductThumbnails />

      <ProductInformation />

      <ProductForm />

      <div className="py-4 border-b border-zinc-800/50">
        <p className="font-semibold">customers also bought</p>

        <BackgroundGradient
          className="mt-1"
          gradientClassName="bg-gradient-to-l"
        >
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

      <ProductFeatures />
    </>
  );
}

function ProductImage() {
  return (
    <Card className="w-full aspect-square p-4">
      <img
        alt="Geek Bar Pulse X Blue Razz Ice"
        className="w-full h-full object-contain"
        src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
      />
    </Card>
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

type ProductThumbnailProps = {
  alt: string;
  image: string;
};

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

type ProductFeatureProps = {
  icon: React.ReactNode;
  text: string;
};

function ProductFeature({ icon, text }: ProductFeatureProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center">
      <span className="text-pink-500">{icon}</span>

      <p className="mt-2 text-sm text-zinc-300 font-semibold">{text}</p>
    </Card>
  );
}
