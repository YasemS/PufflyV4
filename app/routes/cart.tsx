import {
  Car,
  CircleQuestionMark,
  Lock,
  Minus,
  MoveLeft,
  Plus,
  Star,
  Trash,
} from "lucide-react";
import { Link } from "react-router";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import { H1, H2 } from "~/components/Heading";

import format from "~/lib/format";

type ProgressBarProps = {
  width: string;
};

function ProgressBar({ width }: ProgressBarProps) {
  return (
    <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
      <div
        className="w-0 h-full bg-pink-500 rounded-full"
        style={{ width }}
      ></div>
    </div>
  );
}

export default function Cart() {
  return (
    <>
      <H1>cart (1)</H1>

      <BackgroundGradient gradientClassName="h-3/4">
        <CartDeliveryThreshold />

        <CartItems />

        <CartContinueShopping />
      </BackgroundGradient>

      <CartUpsell />

      <CartSummary />
    </>
  );
}

function CartDeliveryThreshold() {
  return (
    <Card className="mt-4">
      <p className="text-sm font-medium">
        you're{" "}
        <span className="mx-0.25 px-1 py-0.5 bg-pink-500 rounded font-semibold">
          $40.00
        </span>{" "}
        away from free shipping!
      </p>

      <div className="mt-2">
        <ProgressBar width="50%" />
      </div>
    </Card>
  );
}

function CartItems() {
  return (
    <Card className="flex flex-col mt-2">
      <CartItem />

      <CartItem />
    </Card>
  );
}

function CartItem() {
  return (
    <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-700 first:mt-0 first:pt-0 first:border-t-0">
      <Card className="min-w-20 w-20 h-20 p-2 border-zinc-700">
        <img
          alt=""
          className="w-full h-full object-contain"
          src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
        />
      </Card>

      <div className="flex flex-col h-20 w-full">
        <div className="flex justify-between gap-3">
          <p className="font-bold leading-4">geek bar pulse x</p>

          <button>
            <Trash className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">
          flavour: <span className="font-semibold">blue razz ice</span>
        </p>

        <div className="flex items-end justify-between gap-3 mt-auto">
          <CartItemQuantity />

          <p className="pb-1 font-bold leading-4">$15.00</p>
        </div>
      </div>
    </div>
  );
}

function CartItemQuantity() {
  return (
    <div className="flex items-center border border-zinc-700 rounded">
      <button className="flex items-center justify-center min-w-6 w-6 h-6 border-r border-zinc-700">
        <Minus className="w-4 h-4" />
      </button>

      <input
        className="h-6 min-w-8 w-8 outline-none text-sm text-center"
        type="number"
        defaultValue={1}
      />

      {/* <span className="px-2 text-sm font-medium">1</span> */}

      <button className="flex items-center justify-center min-w-6 w-6 h-6 border-l border-zinc-700">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

function CartContinueShopping() {
  return (
    <Link className="flex mt-2" to="/products">
      <Button className="w-full" variant="outline">
        <MoveLeft className="w-5 h-5" />
        <span>continue shopping</span>
      </Button>
    </Link>
  );
}

function CartUpsell() {
  return (
    <div className="mt-8">
      <H2>add a mystery vape?</H2>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        🎁 discover new flavours from top brands
      </p>

      <BackgroundGradient>
        <div className="flex flex-col gap-2 mt-3">
          <CartMysteryItem />
          <CartMysteryItem />
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CartMysteryItem() {
  return (
    <Card className="flex gap-3">
      <div className="flex items-center justify-center min-w-16 w-16 h-16 bg-pink-800/50 border border-pink-500 text-pink-500 rounded-lg">
        <CircleQuestionMark className="w-8 h-8" />
      </div>

      <div className="flex flex-col h-16 w-full">
        <p className="font-bold leading-4">mystery vape - 500 puffs</p>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">
          surprise flavour picked just for you!
        </p>

        <div className="flex items-end justify-between gap-3 mt-auto">
          <p className="font-bold leading-4">$5.00</p>

          <Button className="h-6 px-3 py-1 text-xs">add</Button>
        </div>
      </div>
    </Card>
  );
}

function CartSummary() {
  return (
    <div className="mt-8">
      <H2>cart summary</H2>

      <BackgroundGradient>
        <Card className="flex flex-col gap-2 mt-3">
          <div className="flex items-center justify-between gap-3">
            <p>subtotal</p>
            <p className="font-semibold">$1,000.00</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>shipping</p>
            <p className="font-semibold">next step...</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>coupon</p>
            <p className="font-semibold">-</p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-zinc-700 text-lg font-semibold">
            <p>total</p>
            <p>$123.45</p>
          </div>
        </Card>

        <CartCoupon />

        <div className="flex flex-col mt-2">
          <Button className="w-full">
            <Lock className="w-4 h-4" />
            <span>secure checkout</span>
          </Button>

          <div className="flex items-center justify-center gap-1 mt-2">
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
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CartCoupon() {
  return (
    <Card className="flex mt-2">
      <input
        className="h-10 w-full px-3 bg-transparent border border-zinc-700 rounded-l outline-none text-sm focus:border-zinc-500"
        type="text"
        placeholder="enter coupon..."
      />

      <Button className="border-l-0 rounded-l-none px-4" variant="outline">
        apply
      </Button>
    </Card>
  );
}
