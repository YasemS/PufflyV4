import { useEffect, useState } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { Banknote, Check, CircleQuestionMark, CreditCard, Headset, Home, Mail, Truck, User } from "lucide-react";
import { APIProvider, Map, Marker, useMapsLibrary } from "@vis.gl/react-google-maps";

import type { Route } from "./+types/order.$id";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Scroller from "~/components/Scroller";
import { H1, H2, H3 } from "~/components/Heading";

import cn from "~/lib/cn";
import format from "~/lib/format";
import { getOrder } from "~/lib/order.server";
import { getProduct } from "~/lib/product.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  if (typeof id !== "string") {
    return redirect("/cart");
  }

  const order = await getOrder(id);

  if (!order) {
    return redirect("/cart");
  }

  if (order.status === "PENDING") {
    return redirect("/cart");
  }

  const results = [];

  for (const item of order.items) {
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
    const productCount = order.items.reduce((count, cartItem) => {
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

  const keys = {
    google: {
      mapsApiKey: process.env.GOOGLE_MAPS_API_KEY!,
    },
  };

  return {
    order: {
      id: order.id,
      status: order.status,
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      country: order.country,
      city: order.city,
      state: order.state,
      postal: order.postal,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,

      updated: order.updated,
      created: order.created,
    },
    items: results,
    summary: {
      subtotal: order.subtotal,
      coupon: order.couponTotal,
      shipping: order.shippingTotal,
      total: order.total,
    },
    keys,
  };
}

export default function Order() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <>
      <H1>your order</H1>

      {order.status === "AWAITING_PAYMENT" && <OrderAlertPayment />}

      <OrderItemsScroller />

      <OrderMap />

      <OrderStatus />

      <OrderInformation />

      <OrderItems />

      <OrderSummary />

      {["AWAITING_PAYMENT", "PROCESSING", "AWAITING_FULFILLMENT"].includes(order.status) && <OrderCancellation />}
    </>
  );
}

function OrderItemsScroller() {
  const { items } = useLoaderData<typeof loader>();
  return (
    <BackgroundGradient className="mt-4" gradientClassName="h-3/4 w-1/2">
      <Scroller>
        <div className="flex items-center gap-1">
          {items.map((item) =>
            item.visible ? (
              <Card key={item.id} className="min-w-20 w-20 h-20 p-2">
                <img alt={item.image.alt} className="w-full h-full object-contain" src={item.image.source} />
              </Card>
            ) : (
              <div className="flex items-center justify-center min-w-20 w-20 h-20 bg-pink-800/50 border border-pink-500 text-pink-500 rounded-lg">
                <CircleQuestionMark className="w-8 h-8" />
              </div>
            ),
          )}
        </div>
      </Scroller>
    </BackgroundGradient>
  );
}

function OrderMap() {
  const { order, keys } = useLoaderData<typeof loader>();

  const address = `${order.addressLine1 + (order.addressLine2 ? ", " + order.addressLine2 : "")}, ${order.city}, ${order.state} ${order.postal}`;

  return (
    <BackgroundGradient className="mt-2" gradientClassName="h-1/2">
      <Card className="relative w-full h-100 p-0 overflow-hidden">
        <APIProvider apiKey={keys.google.mapsApiKey}>
          <AddressMarker address={address} />
        </APIProvider>
      </Card>
    </BackgroundGradient>
  );
}

function AddressMarker({ address }: { address: string }) {
  const [coords, setCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const geocoding = useMapsLibrary("geocoding");

  useEffect(() => {
    if (!geocoding) return;

    const geocoder = new geocoding.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setCoords({ lat: lat(), lng: lng() });
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  }, [geocoding, address]);

  if (!coords) return null;

  return (
    <Map
      zoom={10}
      center={coords}
      cameraControl={false}
      colorScheme="DARK"
      streetViewControl={false}
      fullscreenControl={false}
      mapTypeControl={false}
      keyboardShortcuts={false}
      gestureHandling="none"
    >
      <Marker position={coords} />
    </Map>
  );
}

function OrderAlertPayment() {
  const { order } = useLoaderData<typeof loader>();

  const paymentMethod = order.paymentMethod?.split("-").join(" ");

  return (
    <div className="flex items-center gap-2 px-3 py-2 my-4 bg-amber-800/50 border border-amber-500 rounded text-amber-500 text-sm font-semibold">
      <p>
        your order will be processed once we confirm your {paymentMethod} payment, please make sure you've completed the
        payment steps.
      </p>
    </div>
  );
}

function OrderStatus() {
  const { order } = useLoaderData<typeof loader>();

  function getWidth() {
    if (order.status === "AWAITING_PAYMENT") {
      return "0";
    }

    if (order.status === "PROCESSING" || order.status === "AWAITING_FULFILLMENT") {
      return "66.66%";
    }

    if (order.status === "FULFILLED") {
      return "100%";
    }

    return "0";
  }

  return (
    <BackgroundGradient className="mt-2" gradientClassName="bg-gradient-to-r">
      <Card className="flex flex-col p-4">
        <H2 className="text-center">{order.status.split("_").join(" ").toLowerCase()}</H2>

        <div className="flex mt-5 pb-6 relative">
          <div className="w-full h-4 mx-6 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
            <div className="w-0 h-full bg-pink-500 rounded-full" style={{ width: getWidth() }}></div>
          </div>

          <div className="flex justify-between absolute -top-1 left-0 w-full">
            <OrderStatusItem active status="ordered" />

            <OrderStatusItem active={order.status !== "AWAITING_PAYMENT"} status="paid" />

            <OrderStatusItem active={order.status !== "AWAITING_PAYMENT"} status="processing" />

            <OrderStatusItem active={order.status === "FULFILLED"} status="shipped" />
          </div>
        </div>
      </Card>
    </BackgroundGradient>
  );
}

function OrderStatusItem({ active, status }: { active?: boolean; status: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-12">
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full drop-shadow",
          active ? "bg-pink-500" : "bg-zinc-800",
        )}
      >
        {active && <Check className="w-4 h-4" />}
      </div>

      <p className={cn("mt-1 text-xs font-medium", !active && "text-zinc-400")}>{status}</p>
    </div>
  );
}

function OrderInformation() {
  const { order } = useLoaderData<typeof loader>();

  return (
    <BackgroundGradient className="mt-2">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <H3 className="text-base leading-4">order - {order.id}</H3>
            <p className="mt-0.5 text-xs text-zinc-300 font-medium leading-3">
              placed on{" "}
              {order.created
                .toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                .split(",")
                .join("")
                .toLowerCase()}
            </p>
          </div>

          <Link to="/help" target="_blank">
            <Button className="w-8 h-8 px-0" variant="outline" tabIndex={-1}>
              <Headset className="w-4 h-4 text-zinc-300" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-start gap-3 mt-3 pt-3 border-t border-zinc-700">
          <OrderInformationRow icon={<User />}>
            <p>
              {order.firstName} {order.lastName}
            </p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Home />}>
            <p>{order.addressLine1}</p>
            <p>
              {order.city}, {order.state} {order.postal}
            </p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Mail />}>
            <p>{order.email}</p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Truck />}>
            <p>{order.shippingMethod} shipping</p>
          </OrderInformationRow>

          {/* <OrderInformationRow icon={<Phone />}>
            <p>(123) 456-7890</p>
          </OrderInformationRow> */}
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-zinc-700 text-sm leading-4">
          <p className="text-zinc-300">payment method</p>

          <div className="flex items-center justify-center gap-1.5">
            <p className="font-medium">{order.paymentMethod!.split("-").join(" ")}</p>

            {order.paymentMethod === "credit-card" ? (
              <CreditCard className="w-4 h-4" />
            ) : (
              <Banknote className="w-4 h-4" />
            )}
          </div>
        </div>
      </Card>
    </BackgroundGradient>
  );
}

function OrderInformationRow({ icon, children }: OrderInformationRowProps) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center w-4 h-4 text-zinc-300">{icon}</div>

      <div className="flex flex-col gap-1 pt-0.25 text-sm font-medium leading-3.5 lowercase">{children}</div>
    </div>
  );
}

function OrderItems() {
  const { items } = useLoaderData<typeof loader>();

  return (
    <BackgroundGradient className="mt-2">
      <Card>
        {items.map((item) => (
          <OrderItem key={item.id} {...item} />
        ))}
      </Card>
    </BackgroundGradient>
  );
}

function OrderItem(props: OrderItemProps) {
  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-700 first:mt-0 first:pt-0 first:border-t-0">
      {props.visible ? (
        <Card className="relative min-w-16 w-16 h-16 p-2 border-zinc-700">
          <img alt={props.image.alt} className="w-full h-full object-contain" src={props.image.source} />

          <span className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full text-xs text-center font-semibold leading-4">
            {props.quantity}
          </span>
        </Card>
      ) : (
        <div className="flex items-center justify-center min-w-16 w-16 h-16 bg-pink-800/50 border border-pink-500 text-pink-500 rounded-lg">
          <CircleQuestionMark className="w-8 h-8" />
        </div>
      )}

      <div className="flex flex-col">
        <p className="font-bold leading-4">{props.name}</p>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">
          {props.variants.map((variant) => (
            <span key={variant.name}>
              {variant.name}: <span className="font-semibold">{variant.value}</span>
              {props.variants.indexOf(variant) < props.variants.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <p className="ml-auto font-bold leading-4">{format.currency(props.price * props.quantity)}</p>
    </div>
  );
}

function OrderSummary() {
  const { summary } = useLoaderData<typeof loader>();

  return (
    <BackgroundGradient className="mt-2">
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p>subtotal</p>
          <p className="font-semibold">{format.currency(summary.subtotal || 0)}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p>coupon</p>
          <p className={cn("font-semibold", summary.coupon && summary.coupon > 0 && "text-green-500")}>
            {format.currency(summary.coupon || 0)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p>shipping</p>
          <p className="font-semibold">{format.currency(summary.shipping || 0)}</p>
        </div>

        <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-zinc-700 text-lg font-semibold">
          <p>total</p>
          <p>{format.currency(summary.total || 0)}</p>
        </div>
      </Card>
    </BackgroundGradient>
  );
}

function OrderCancellation() {
  return (
    <Card className="mt-2 text-center">
      <p className="text-base font-semibold leading-4">want to cancel your order?</p>
      <Link className="text-sm text-pink-500 font-medium leading-4" to="/help">
        contact us
      </Link>
    </Card>
  );
}

type OrderInformationRowProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

type OrderItemProps = {
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
