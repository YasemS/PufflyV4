import { useContext, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  CircleQuestionMark,
  Loader2,
  Lock,
  Minus,
  MoveLeft,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { Form, Link, useFetcher, useLoaderData } from "react-router";

import type { Route } from "./+types/cart";
import type { action as CartUpdateAction } from "~/routes/cart.update";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import ProgressBar from "~/components/ProgressBar";
import { H1, H2 } from "~/components/Heading";

import cn from "~/lib/cn";
import format from "~/lib/format";
import img from "~/lib/img";
import { cartCookie, getCart } from "~/lib/cart.server";
import { GlobalContext } from "~/lib/global";
import { getProduct } from "~/lib/product.server";

export const meta: Route.MetaFunction = () => {
  return [
    { title: `cart - puffly` },
    {
      name: "description",
      content: "view and manage your cart.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
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

  let couponTotal = 0;

  if (cart.coupon) {
    if (cart.coupon.type === "PERCENTAGE") {
      couponTotal = (subtotal * cart.coupon.discount) / 100;
    }

    if (cart.coupon.type === "FIXED") {
      couponTotal = cart.coupon.discount;
    }
  }

  const total = subtotal - couponTotal;

  return {
    items: results,
    coupon: cart.coupon
      ? {
          type: cart.coupon.type,
          code: cart.coupon.code,
          discount: cart.coupon.discount,
          minimum: cart.coupon.minimum,
        }
      : null,
    summary: {
      subtotal,
      coupon: couponTotal,
      total,
    },
  };
}

export default function Cart() {
  const { setCart } = useContext(GlobalContext);

  const data = useLoaderData<typeof loader>();

  const count = data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    if (!data) return;

    setCart(data.items.length > 0);
  }, [data]);

  return (
    <>
      <H1>cart ({count})</H1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <BackgroundGradient gradientClassName="h-3/4">
            <CartDeliveryThreshold />

            <CartItems />

            <CartContinueShopping />
          </BackgroundGradient>
        </div>

        <div className="md:col-span-2">
          <CartUpsell />

          <CartSummary />
        </div>
      </div>
    </>
  );
}

function CartDeliveryThreshold() {
  const data = useLoaderData<typeof loader>();

  const threshold = 50;
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
          src={img.transform(props.image.source || "/img/placeholder.png", { width: 50, height: 50 })}
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

          <div className="flex items-center justify-center pb-1">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <p className="pb-1 font-bold leading-4">{format.currency(total)}</p>
            )}
          </div>
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
    <div>
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

          <CartMysteryItem
            slug="mystery-vape-4000"
            name="mystery vape - 4k puffs"
            tagline="reliable vape from premium brands"
            price={15.0}
          />
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

      <div className="flex flex-col min-h-16 w-full">
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
            <p>coupon</p>
            <p className={cn("font-semibold", data?.coupon && "text-green-500")}>
              {format.currency(data && data.coupon ? -data.summary.coupon : 0)}
            </p>
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
          <Form action="/checkout" method="post">
            <Button className="w-full" disabled={data ? data.items.length === 0 : true}>
              <Lock className="w-4 h-4" />
              <span>secure checkout</span>
            </Button>
          </Form>

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
          </div>
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CartCoupon() {
  const data = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const loading = fetcher.state !== "idle";
  const error = fetcher.data?.error;

  const [edit, setEdit] = useState(false);
  const [code, setCode] = useState("");

  function onEditClick() {
    if (data && data.coupon) {
      setCode(data.coupon.code);
    }

    setEdit(true);
  }

  async function onRemoveClick() {
    await fetcher.submit({ action: "remove" }, { action: "/cart/coupon", method: "post" });

    setEdit(false);
    setCode("");
  }

  useEffect(() => {
    if (data && data.coupon) {
      setEdit(false);
      setCode(data.coupon.code);
    }
  }, [data]);

  if (data && data.coupon && !edit) {
    return (
      <Card className="flex items-center gap-2 mt-2">
        <CheckCircle className="w-4 h-4 text-green-500" />

        <p className="text-sm font-medium leading-4">
          coupon <strong>{data.coupon.code}</strong> applied for{" "}
          {data.coupon.type === "PERCENTAGE" ? `${data.coupon.discount}%` : `${format.currency(data.coupon.discount)}`}{" "}
          off
        </p>

        <Button variant="outline" className="w-6 h-6 ml-auto px-0" onClick={onEditClick}>
          <Pencil className="w-3 h-3" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-start mt-2">
      {error && (
        <div className="flex items-center gap-2 w-full px-3 py-2 mb-2 bg-red-950/50 border border-red-500 rounded text-red-500">
          <AlertCircle className="min-w-4 w-4 h-4" />
          <p className="text-sm font-semibold leading-4">{error}</p>
        </div>
      )}

      <fetcher.Form action="/cart/coupon" className="flex w-full" method="post">
        <Input
          className="w-full rounded-r-none"
          type="text"
          placeholder="enter coupon..."
          name="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <Button
          className="border-l-0 rounded-l-none px-4"
          disabled={loading}
          name="action"
          value="add"
          variant="outline"
        >
          apply
        </Button>
      </fetcher.Form>

      {edit && (
        <button className="mt-1 text-xs text-zinc-300 font-medium leading-3" disabled={loading} onClick={onRemoveClick}>
          remove coupon
        </button>
      )}
    </Card>
  );
}

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
