import { useEffect, useState } from "react";
import { CircleQuestionMark, Lock, Minus, MoveLeft, Plus, Trash } from "lucide-react";
import { Link, useFetcher, useLoaderData, type LoaderFunctionArgs } from "react-router";

import type { action as CartUpdateAction } from "~/routes/cart.update";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import { H1, H2 } from "~/components/Heading";

import cn from "~/lib/cn";
import format from "~/lib/format";
import { cartCookie, getCart } from "~/lib/cart.server";
import { getProduct } from "~/lib/product.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  if (!cartId) {
    return null;
  }

  const cart = await getCart(cartId);

  if (!cart) {
    return null;
  }

  const results = [];

  for (const item of cart.items) {
    const product = await getProduct(item.productSlug);

    if (!product) {
      continue;
    }

    let image = product.images[0];
    const variants = [];

    for (const selectedVariant of item.variants) {
      const variant = product.variants.find((v) => v.id === selectedVariant.variantId);

      if (!variant) {
        break;
      }

      const option = variant.options.find((o) => o.value === selectedVariant.optionId);

      if (!option) {
        break;
      }

      if (option.stock < item.quantity) {
        // TODO: remove item from cart
        // break;
      }

      variants.push({
        name: variant.name,
        value: option.name,
      });

      if (option.imageId) {
        const optionImage = product.images.find((img) => img.id === option.imageId);

        if (optionImage) {
          image = optionImage;
        }
      }
    }

    if (variants.length !== product.variants.length) {
      continue;
    }

    // number of products where productSlug is same
    const productCount = cart.items.reduce((count, cartItem) => {
      return cartItem.productSlug === item.productSlug ? count + cartItem.quantity : count;
    }, 0);

    // 2 products = 5% off
    // 3+ products = 10% off
    const multiDiscount = productCount === 2 ? 0.05 : productCount >= 3 ? 0.1 : 0;
    const price = product.price - product.price * multiDiscount;

    results.push({
      id: item.id,
      slug: product.slug,
      name: product.name,
      image,
      price,
      quantity: item.quantity,
      visible: product.visible,
      variants,
    });
  }

  const subtotal = results.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const coupon = {
    code: "SUMMER10",
    discount: 5,
    minimum: 50,
  };

  const couponDiscount = subtotal >= coupon.minimum ? coupon.discount : 0;
  const couponTotal = subtotal * (couponDiscount / 100);

  const total = subtotal - couponTotal;

  return {
    items: results,
    coupon,
    summary: {
      subtotal,
      coupon: couponTotal,
      total,
    },
  };
}

export default function Cart() {
  const data = useLoaderData<typeof loader>();

  const count = data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      <H1>cart ({count})</H1>

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
  const data = useLoaderData<typeof loader>();

  const threshold = 40;
  const subtotal = data?.summary.subtotal || 0;
  const difference = threshold - subtotal;

  return (
    <Card className="mt-4">
      {difference <= 0 ? (
        <p className="text-sm font-medium">you've unlocked free shipping 🚚</p>
      ) : (
        <p className="text-sm font-medium">
          you're{" "}
          <span className="mx-0.25 px-1 py-0.5 bg-pink-500 rounded font-semibold">
            {format.currency(difference > 0 ? difference : 0)}
          </span>{" "}
          away from free shipping!
        </p>
      )}

      <div className="mt-2">
        <ProgressBar width={`${Math.min((subtotal / threshold) * 100, 100)}%`} />
      </div>
    </Card>
  );
}

function CartItems() {
  const data = useLoaderData<typeof loader>();

  if (!data) {
    return;
  }

  const visible = data.items.filter((item) => item.visible);

  if (visible.length === 0) {
    return;
  }

  return (
    <Card className="flex flex-col mt-2">
      {data.items.map((item) => (
        <CartItem {...item} key={item.id} />
      ))}
    </Card>
  );
}

function CartItem(props: CartItemProps) {
  const [quantity, setQuantity] = useState(props.quantity);

  const fetcher = useFetcher<typeof CartUpdateAction>();
  const loading = fetcher.state !== "idle";

  const total = props.price * props.quantity;

  function onQuantityChange(newQuantity: number) {
    setQuantity(newQuantity);
  }

  useEffect(() => {
    if (quantity < 1 || isNaN(quantity)) {
      setQuantity(1);
      return;
    }

    if (quantity > 99) {
      setQuantity(99);
      return;
    }

    if (quantity === props.quantity) {
      return;
    }

    const timeout = setTimeout(() => {
      fetcher.submit(
        { item: props.id, action: "quantity", quantity: quantity.toString() },
        { method: "post", action: "/cart/update" },
      );
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [quantity]);

  if (!props.visible) {
    return null;
  }

  return (
    <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-700 first:mt-0 first:pt-0 first:border-t-0">
      <Card className="min-w-20 w-20 h-20 p-2 border-zinc-700">
        <img
          alt={props.name}
          className="w-full h-full object-contain"
          src={props.image.source || "/img/placeholder.png"}
        />
      </Card>

      <fetcher.Form action="/cart/update" className="flex flex-col h-20 w-full" method="post">
        <input type="hidden" name="item" value={props.id} />

        <div className="flex justify-between gap-3">
          <p className="font-bold leading-4">{props.name}</p>

          <button
            className={cn(loading && "text-zinc-300")}
            disabled={loading}
            name="action"
            value="remove"
            type="submit"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">
          {props.variants.map((variant) => (
            <span key={variant.name}>
              {variant.name}: <span className="font-semibold">{variant.value}</span>
              {props.variants.indexOf(variant) < props.variants.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        <div className="flex items-end justify-between gap-3 mt-auto">
          <CartItemQuantity disabled={loading} quantity={quantity} onQuantityChange={onQuantityChange} />

          <p className="pb-1 font-bold leading-4">{format.currency(total)}</p>
        </div>
      </fetcher.Form>
    </div>
  );
}

function CartItemQuantity({ disabled, quantity, onQuantityChange }: CartItemQuantityProps) {
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10);

    if (!isNaN(newValue)) {
      onQuantityChange(newValue);
    }
  }

  return (
    <div className="flex items-center border border-zinc-700 rounded">
      <button
        className="flex items-center justify-center min-w-6 w-6 h-6 border-r border-zinc-700 disabled:text-zinc-500"
        disabled={disabled || quantity <= 1}
        type="button"
        onClick={() => onQuantityChange(quantity - 1)}
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        className="h-6 min-w-8 w-8 outline-none text-sm text-center disabled:text-zinc-500"
        disabled={disabled}
        type="number"
        value={quantity}
        onChange={onInputChange}
      />

      {/* <span className="px-2 text-sm font-medium">1</span> */}

      <button
        className="flex items-center justify-center min-w-6 w-6 h-6 border-l border-zinc-700 disabled:text-zinc-500"
        disabled={disabled || quantity >= 99}
        type="button"
        onClick={() => onQuantityChange(quantity + 1)}
      >
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
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">🎁 discover new flavours from top brands</p>

      <BackgroundGradient>
        <div className="flex flex-col gap-2 mt-3">
          <CartMysteryItem
            slug="mystery-vape-800"
            name="mystery vape - 800 puffs"
            tagline="surprise flavour picked just for you!"
            price={6.0}
          />
          {/* <CartMysteryItem /> */}
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CartMysteryItem(props: CartMysteryItemProps) {
  const data = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const loading = fetcher.state !== "idle";

  const exists = data?.items.find((item) => item.slug === props.slug);

  return (
    <Card className="flex gap-3">
      <div className="flex items-center justify-center min-w-16 w-16 h-16 bg-pink-800/50 border border-pink-500 text-pink-500 rounded-lg">
        <CircleQuestionMark className="w-8 h-8" />
      </div>

      <div className="flex flex-col h-16 w-full">
        <p className="font-bold leading-4">{props.name}</p>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">{props.tagline}</p>

        <div className="flex items-end justify-between gap-3 mt-auto">
          <p className="font-bold leading-4">{format.currency(props.price)}</p>

          <fetcher.Form action={exists ? "/cart/update" : "/cart/add"} method="post">
            {exists ? (
              <input type="hidden" name="item" value={exists.id} />
            ) : (
              <input type="hidden" name="product" value={props.slug} />
            )}

            <Button
              className="h-6 px-3 py-1 text-xs"
              disabled={loading}
              name="action"
              value={exists ? "remove" : ""}
              variant={exists ? "outline" : "primary"}
            >
              {exists ? <Trash className="w-3 h-3" /> : "add"}
            </Button>
          </fetcher.Form>
        </div>
      </div>
    </Card>
  );
}

function CartSummary() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mt-8">
      <H2>cart summary</H2>

      <BackgroundGradient>
        <Card className="flex flex-col gap-2 mt-3">
          <div className="flex items-center justify-between gap-3">
            <p>subtotal</p>
            <p className="font-semibold">{format.currency(data?.summary.subtotal || 0)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>coupon{data?.coupon ? ` (${data.coupon.code})` : ""}</p>
            <p className="font-semibold">{format.currency(data?.summary.coupon || 0)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>shipping</p>
            <p>next step</p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-zinc-700 text-lg font-semibold">
            <p>total</p>
            <p>{format.currency(data?.summary.total || 0)}</p>
          </div>
        </Card>

        <CartCoupon />

        <div className="flex flex-col mt-2">
          <Button className="w-full">
            <Lock className="w-4 h-4" />
            <span>secure checkout</span>
          </Button>

          <p className="mt-2 text-xs text-zinc-300 text-center">
            by clicking checkout, you agree to our{" "}
            <Link className="underline" to="/legal/terms">
              terms of service
            </Link>
            ,{" "}
            <Link className="underline" to="/legal/privacy">
              privacy policy
            </Link>
            ,{" "}
            <Link className="underline" to="/legal/refund">
              refund policy
            </Link>
            , and{" "}
            <Link className="underline" to="/legal/shipping">
              shipping policy
            </Link>
            .
          </p>

          <div className="flex items-center justify-center gap-1 mt-2">
            <img alt="visa" className="h-5 rounded-xs" src="/img/visa.svg" />

            <img alt="mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" />

            <img alt="diners club" className="h-5 rounded-xs" src="/img/diners.svg" />

            <img alt="discover" className="h-5 rounded-xs" src="/img/discover.svg" />

            <img alt="american express" className="h-5 rounded-xs" src="/img/amex.svg" />
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

function ProgressBar({ width }: ProgressBarProps) {
  return (
    <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
      <div className="w-0 h-full bg-pink-500 rounded-full" style={{ width }}></div>
    </div>
  );
}

type ProgressBarProps = {
  width: string;
};

type CartItemProps = {
  id: string;
  slug: string;
  name: string;
  image: {
    id: string;
    alt: string;
    source: string;
  };
  price: number;
  quantity: number;
  visible: boolean;
  variants: {
    name: string;
    value: string;
  }[];
};

type CartItemQuantityProps = {
  disabled?: boolean;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
};

type CartMysteryItemProps = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
};
