import { useContext, useEffect, useState } from "react";
import { data as rdata, redirect, useFetcher, useLoaderData, useSubmit, useActionData } from "react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  CircleQuestionMark,
  Loader2,
  Lock,
  MoveRight,
  Pencil,
} from "lucide-react";
import { usePlacesWidget } from "react-google-autocomplete";
import validator, { type PostalCodeLocale } from "validator";
import QRCode from "react-qr-code";

import type { Route } from "./+types/checkout.$id";
import type { OrderStatus } from "generated/prisma/client";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import InputControl from "~/components/InputControl";
import Label from "~/components/Label";
import ProgressBar from "~/components/ProgressBar";
import Select from "~/components/Select";
import { H1, H2 } from "~/components/Heading";

import cn from "~/lib/cn";
import format from "~/lib/format";
import authorizenet from "~/lib/authorizenet.server";
import prisma from "~/lib/prisma.server";
import { template as emailTemplate, resend } from "~/lib/email.server";
import { cartCookie } from "~/lib/cart.server";
import { GlobalContext } from "~/lib/global";
import { getOrder } from "~/lib/order.server";
import { getDeliveryEstimate } from "~/lib/shipping";
import { getProduct } from "~/lib/product.server";

export async function action({ params, request }: Route.ActionArgs) {
  const { id } = params;

  if (typeof id !== "string") {
    return redirect("/cart");
  }

  const order = await getOrder(id);

  if (!order) {
    return redirect("/cart");
  }

  if (order.status !== "PENDING") {
    return redirect("/cart");
  }

  if (order.items.length === 0) {
    return redirect("/cart");
  }

  const results = [];

  for (const item of order.items) {
    const product = await getProduct(item.productSlug);

    if (!product) {
      continue;
    }

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
      price,
      quantity: item.quantity,
      visible: product.visible,
      variants,
    });
  }

  const subtotal = results.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let couponTotal = 0;

  if (order.coupon) {
    if (order.coupon.type === "PERCENTAGE") {
      couponTotal = (subtotal * order.coupon.discount) / 100;
    }

    if (order.coupon.type === "FIXED") {
      couponTotal = order.coupon.discount;
    }
  }

  const form = await request.formData();

  const email = form.get("email") || order.email;
  const firstName = form.get("firstName") || order.firstName;
  const lastName = form.get("lastName") || order.lastName;
  const addressLine1 = form.get("addressLine1") || order.addressLine1;
  const addressLine2 = form.get("addressLine2") || order.addressLine2;
  const country = form.get("country") || order.country;
  const city = form.get("city") || order.city;
  const state = form.get("state") || order.state;
  const postal = form.get("postal") || order.postal;
  const shippingMethod = form.get("shippingMethod") || order.shippingMethod;
  const paymentMethod = form.get("paymentMethod");

  if (!email || typeof email !== "string") {
    return rdata({ error: "email is required." }, { status: 400 });
  }

  if (!validator.isEmail(email)) {
    return rdata({ error: "invalid email address." }, { status: 400 });
  }

  if (!firstName || typeof firstName !== "string") {
    return rdata({ error: "first name is required." }, { status: 400 });
  }

  if (!lastName || typeof lastName !== "string") {
    return rdata({ error: "last name is required." }, { status: 400 });
  }

  if (!addressLine1 || typeof addressLine1 !== "string") {
    return rdata({ error: "address is required." }, { status: 400 });
  }

  if (addressLine2 && typeof addressLine2 !== "string") {
    return rdata({ error: "invalid apt/suite/unit." }, { status: 400 });
  }

  if (!country || typeof country !== "string") {
    return rdata({ error: "country is required." }, { status: 400 });
  }

  if (!city || typeof city !== "string") {
    return rdata({ error: "city is required." }, { status: 400 });
  }

  if (!state || typeof state !== "string") {
    return rdata({ error: "state is required." }, { status: 400 });
  }

  if (!postal || typeof postal !== "string") {
    return rdata({ error: "postal code is required." }, { status: 400 });
  }

  if (!validator.isISO31661Alpha2(country)) {
    return rdata({ error: "invalid country code." }, { status: 400 });
  }

  if (!validator.isPostalCode(postal, country as PostalCodeLocale)) {
    return rdata({ error: "invalid postal code." }, { status: 400 });
  }

  if (!shippingMethod || typeof shippingMethod !== "string") {
    return rdata({ error: "shipping method is required." }, { status: 400 });
  }

  if (!["standard", "express"].includes(shippingMethod)) {
    return rdata({ error: "invalid shipping method." }, { status: 400 });
  }

  if (!paymentMethod || typeof paymentMethod !== "string") {
    return rdata({ error: "payment method is required." }, { status: 400 });
  }

  if (!["apple-cash", "credit-card", "cash-app", "zelle"].includes(paymentMethod)) {
    return rdata({ error: "invalid payment method." }, { status: 400 });
  }

  const shippingTotal = shippingMethod === "standard" ? (subtotal > 40 ? 0 : 2.99) : 10;

  const total = subtotal - couponTotal + shippingTotal;

  let orderStatus: OrderStatus = "AWAITING_PAYMENT";
  let orderPaymentId: string | null = null;

  if (paymentMethod === "credit-card") {
    const cardDescriptor = form.get("paymentDataDescriptor")?.toString() || "";
    const cardValue = form.get("paymentDataValue")?.toString() || "";

    if (!cardDescriptor.trim() || !cardValue.trim()) {
      return rdata({ error: "credit card is required" }, { status: 400 });
    }

    const transaction = await authorizenet.createPayment(
      total,
      { descriptor: cardDescriptor, value: cardValue },
      {
        loginId: process.env.AUTHORIZENET_LOGIN_ID!,
        transactionKey: process.env.AUTHORIZENET_TRANSACTION_KEY!,
      },
    );

    if ("error" in transaction) {
      return rdata({ error: transaction.error.toLowerCase() }, { status: 400 });
    }

    orderStatus = "PROCESSING";
    orderPaymentId = transaction.id;
  }

  await prisma.order.update({
    data: {
      status: orderStatus,
      email,
      firstName,
      lastName,
      addressLine1,
      addressLine2: addressLine2 || null,
      country,
      city,
      state,
      postal,
      subtotal,
      couponTotal,
      shippingTotal,
      total,
      shippingMethod,
      paymentMethod: paymentMethod,
      paymentId: orderPaymentId,
    },
    where: {
      id: order.id,
    },
  });

  const templateItems = results.map((item) => {
    const variants = item.variants.map((v) => v.value).join(", ");

    return item.quantity + " x " + item.name + (variants ? " (" + variants + ")" : "");
  });

  const templateAddress = `${order.addressLine1 + (order.addressLine2 ? ", " + order.addressLine2 : "")}, ${order.city}, ${order.state} ${order.postal}`;

  const template =
    orderStatus === "AWAITING_PAYMENT"
      ? emailTemplate.order.pending({
          id: order.id,
          name: firstName.toLowerCase(),
          address: templateAddress,
          payment: paymentMethod.split("-").join(" "),
          items: templateItems,
        })
      : emailTemplate.order.confirmation({
          id: order.id,
          name: firstName.toLowerCase(),
          address: templateAddress,
          items: templateItems,
        });

  await resend.emails.send({
    from: "puffly <automated@puffly.io>",
    to: [email],
    replyTo: "support@puffly.io",
    subject: `order ${orderStatus === "PROCESSING" ? "confirmation" : "pending"} - puffly`,
    ...template,
  });

  // TODO: add ntfy and datafast

  return redirect("/order/" + order.id, {
    headers: {
      "Set-Cookie": await cartCookie.serialize("", { maxAge: 0 }),
    },
  });
}

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  if (typeof id !== "string") {
    return redirect("/cart");
  }

  const order = await getOrder(id);

  if (!order) {
    return redirect("/cart");
  }

  if (order.status !== "PENDING") {
    return redirect("/cart");
  }

  if (order.items.length === 0) {
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

  const subtotal = results.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let couponTotal = 0;

  if (order.coupon) {
    if (order.coupon.type === "PERCENTAGE") {
      couponTotal = (subtotal * order.coupon.discount) / 100;
    }

    if (order.coupon.type === "FIXED") {
      couponTotal = order.coupon.discount;
    }
  }

  const keys = {
    authorizenet: {
      apiLoginId: process.env.AUTHORIZENET_LOGIN_ID!,
      clientKey: process.env.AUTHORIZENET_CLIENT_KEY!,
    },
    google: {
      mapsApiKey: process.env.GOOGLE_MAPS_API_KEY!,
    },
  };

  return {
    order: {
      id: order.id,
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
    },
    items: results,
    coupon: order.coupon
      ? {
          type: order.coupon.type,
          code: order.coupon.code,
          discount: order.coupon.discount,
          minimum: order.coupon.minimum,
        }
      : null,
    summary: {
      subtotal,
      coupon: couponTotal,
    },
    keys,
  };
}

export default function Checkout() {
  const aData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const submit = useSubmit();

  const { setCart } = useContext(GlobalContext);

  const { ref: addressRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: data.keys.google.mapsApiKey,
    onPlaceSelected: onAddressSelect,
    options: {
      types: ["address"],
      componentRestrictions: { country: "us" },
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState(data.order.email || "");
  const [firstName, setFirstName] = useState(data.order.firstName || "");
  const [lastName, setLastName] = useState(data.order.lastName || "");
  const [addressLine1, setAddressLine1] = useState(data.order.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(data.order.addressLine2 || "");
  const [country, setCountry] = useState(data.order.country || "");
  const [city, setCity] = useState(data.order.city || "");
  const [state, setState] = useState(data.order.state || "");
  const [postal, setPostal] = useState(data.order.postal || "");

  const [shippingMethod, setShippingMethod] = useState(data.order.shippingMethod || "standard");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardPostal, setCardPostal] = useState("");

  const loading = fetcher.state !== "idle" || submitting;

  const subtotal = data.summary.subtotal;
  const couponTotal = data.summary.coupon;
  const shippingTotal = shippingMethod === "standard" ? (subtotal > 40 ? 0 : 2.99) : 10;

  const total = subtotal - couponTotal + shippingTotal;

  function getCardBrand(input?: string) {
    const cleaned = (input ?? cardNumber).replace(/\D/g, "");

    if (/^4/.test(cleaned)) {
      return "VISA";
    } else if (/^5[1-5]/.test(cleaned) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(cleaned)) {
      return "MASTERCARD";
    } else if (/^3[47]/.test(cleaned)) {
      return "AMEX";
    } else if (
      /^6011/.test(cleaned) ||
      /^65/.test(cleaned) ||
      /^64[4-9]/.test(cleaned) ||
      /^(62212[6-9]|6221[3-9]\d|622[2-8]\d{2}|6229[01]\d|62292[0-5])/.test(cleaned)
    ) {
      return "DISCOVER";
    }

    return "";
  }

  function getCardIcons() {
    const brand = getCardBrand();

    const icons = [];

    if (brand === "VISA") {
      icons.push(<img key="visa" className="h-5 rounded-xs" src="/img/visa.svg" alt="Visa" />);
    }

    if (brand === "MASTERCARD") {
      icons.push(<img key="mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" alt="MasterCard" />);
    }

    if (brand === "DISCOVER") {
      icons.push(<img key="discover" className="h-5 rounded-xs" src="/img/discover.svg" alt="Discover" />);
    }

    if (brand === "AMEX") {
      icons.push(<img key="amex" className="h-5 rounded-xs" src="/img/amex.svg" alt="American Express" />);
    }

    // If no match yet (input too short or invalid prefix), show all
    if (icons.length === 0) {
      return (
        <>
          <img alt="Visa" className="h-5 rounded-xs" src="/img/visa.svg" />

          <img alt="Mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" />

          <img alt="American Express" className="h-5 rounded-xs" src="/img/amex.svg" />

          <p className="pl-1 font-medium leading-3 text-center text-xs">+2</p>
        </>
      );
    }

    return <>{icons}</>;
  }

  function onCardNumberChange(value: string) {
    const raw = value.replace(/\D/g, ""); // Digits only
    const brand = getCardBrand(raw);

    // Set max length by brand
    let maxLength = 16;
    if (brand === "AMEX") {
      maxLength = 15;
    } else if (brand === "VISA") {
      maxLength = 19;
    }

    const trimmed = raw.slice(0, maxLength);

    let formatted = trimmed;

    if (brand === "AMEX") {
      // AMEX: 4-6-5 format
      formatted = trimmed.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, p1, p2, p3) =>
        [p1, p2, p3].filter(Boolean).join(" "),
      );
    } else {
      // Default: space every 4 digits
      formatted = trimmed.replace(/(.{1,4})/g, "$1 ").trim();
    }

    setCardNumber(formatted);
  }

  function onCardExpiryChange(value: string) {
    let digitsOnly = value.replace(/\D/g, "");

    // Auto-prepend 0 if user types a single-digit month like 3 → 03
    if (digitsOnly.length === 1 && parseInt(digitsOnly, 10) > 1) {
      digitsOnly = "0" + digitsOnly;
    }

    digitsOnly = digitsOnly.slice(0, 4); // MMYY

    let month = digitsOnly.slice(0, 2);
    let year = digitsOnly.slice(2);

    // Auto-correct invalid month
    if (month.length === 2) {
      let monthNum = parseInt(month, 10);
      if (monthNum < 1) monthNum = 1;
      if (monthNum > 12) monthNum = 12;
      month = monthNum < 10 ? "0" + monthNum : "" + monthNum;
    }

    // Auto-correct year if in past (assume 20YY)
    if (year.length === 2) {
      const currentYear = new Date().getFullYear() % 100; // last 2 digits
      const currentMonth = new Date().getMonth() + 1; // 1–12

      const yearNum = parseInt(year, 10);
      if (yearNum < currentYear) {
        year = currentYear.toString().padStart(2, "0");
      } else if (yearNum === currentYear && parseInt(month, 10) < currentMonth) {
        // If same year, make sure month isn't in past
        month = currentMonth.toString().padStart(2, "0");
      }
    }

    const formatted = year ? `${month}/${year}` : month;
    setCardExpiry(formatted);
  }

  function onAddressSelect(place: google.maps.places.PlaceResult) {
    if (!place || !place.address_components) return;
    if (place.address_components.length === 0) return;

    const data = {
      addressLine1: "",
    };

    for (const component of place.address_components) {
      if (component.types.includes("street_number")) {
        data.addressLine1 = component.long_name + data.addressLine1;
        continue;
      }

      if (component.types.includes("route")) {
        data.addressLine1 = data.addressLine1 + " " + component.long_name;
        continue;
      }

      if (component.types.includes("subpremise")) {
        setAddressLine2(component.long_name.toLowerCase());
        continue;
      }

      if (component.types.includes("country")) {
        setCountry(component.short_name);
        continue;
      }

      if (component.types.includes("locality")) {
        setCity(component.long_name.toLowerCase());
        continue;
      }

      if (component.types.includes("administrative_area_level_1")) {
        setState(component.short_name);
        continue;
      }

      if (component.types.includes("postal_code")) {
        setPostal(component.long_name);
        continue;
      }
    }

    setAddressLine1(data.addressLine1.toLowerCase());
  }

  function onCheckoutChange() {
    const changes: { [key: string]: string } = {};

    if (email && validator.isEmail(email) && email !== data.order.email) {
      changes.email = email;
    }

    if (firstName && firstName !== data.order.firstName) {
      changes.firstName = firstName;
    }

    if (lastName && lastName !== data.order.lastName) {
      changes.lastName = lastName;
    }

    if (addressLine1 && addressLine1 !== data.order.addressLine1) {
      changes.addressLine1 = addressLine1;
    }

    const al2 = addressLine2 || null;

    if (al2 !== data.order.addressLine2) {
      changes.addressLine2 = addressLine2;
    }

    if (country && country !== data.order.country) {
      changes.country = country;
    }

    if (city && city !== data.order.city) {
      changes.city = city;
    }

    if (state && state !== data.order.state) {
      changes.state = state;
    }

    if (postal && postal !== data.order.postal) {
      changes.postal = postal;
    }

    if (shippingMethod && shippingMethod !== data.order.shippingMethod) {
      changes.shippingMethod = shippingMethod;
    }

    if (Object.keys(changes).length > 0) {
      fetcher.submit({ ...changes, order: data.order.id }, { action: "/checkout/update", method: "post" });
    }
  }

  function onPaymentChange(method: string) {
    setPaymentMethod(method);

    if (method === "credit-card") {
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardHolder(firstName + lastName ? " " + lastName : "");
      setCardPostal(postal);
    }
  }

  function onCheckoutError(error: string) {
    setError(error);
    setSubmitting(false);

    window.scrollTo(0, 0);
  }

  function onCheckoutClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    if (!email) {
      return onCheckoutError("email is required.");
    }

    if (!validator.isEmail(email)) {
      return onCheckoutError("invalid email.");
    }

    if (!firstName) {
      return onCheckoutError("first name is required.");
    }

    if (!lastName) {
      return onCheckoutError("last name is required.");
    }

    if (!addressLine1) {
      return onCheckoutError("address is required.");
    }

    if (!country) {
      return onCheckoutError("country is required.");
    }

    if (!city) {
      return onCheckoutError("city is required.");
    }

    if (!state) {
      return onCheckoutError("state is required.");
    }

    if (!postal) {
      return onCheckoutError("postal code is required.");
    }

    if (!shippingMethod) {
      return onCheckoutError("shipping method is required.");
    }

    if (!paymentMethod) {
      return onCheckoutError("payment method is required.");
    }

    if (paymentMethod === "credit-card") {
      if (!cardNumber) {
        return onCheckoutError("card number is required.");
      }

      if (!cardExpiry) {
        return onCheckoutError("card expiry is required.");
      }

      if (!cardCvc) {
        return onCheckoutError("card cvc is required.");
      }

      if (!cardHolder) {
        return onCheckoutError("card holder is required.");
      }

      if (!cardPostal) {
        return onCheckoutError("card postal code is required.");
      }

      if (cardExpiry.split("/").length !== 2) {
        return onCheckoutError("invalid card expiry date.");
      }

      if (cardPostal.length > 20) {
        return onCheckoutError("billing zip cannot exceed 20 characters");
      }

      if (cardHolder.length > 64) {
        return onCheckoutError("name of card holder cannot exceed 64 characters");
      }

      if (typeof window.Accept === "undefined" || !window.Accept) {
        return onCheckoutError(
          "unable to process payment, failed to load gateway. please contact support or try a different payment method.",
        );
      }

      const authData = {
        apiLoginID: data.keys.authorizenet.apiLoginId,
        clientKey: data.keys.authorizenet.clientKey,
      };

      const cardData = {
        cardNumber: cardNumber.replace(/\D/g, ""),
        month: parseInt(cardExpiry.split("/")[0]).toString(),
        year: cardExpiry.split("/")[1],
        cardCode: cardCvc,
        zip: cardPostal.trim(),
        fullName: cardHolder.trim(),
      };

      const secureData = {
        authData,
        cardData,
      };

      window.Accept.dispatchData(secureData, (response) => {
        if (response.messages.resultCode === "Error") {
          return onCheckoutError(response.messages.message[0].text);
        }

        const { dataDescriptor, dataValue } = response.opaqueData;

        submitCheckout({
          paymentDataDescriptor: dataDescriptor,
          paymentDataValue: dataValue,
        });
      });

      return;
    }

    submitCheckout();
  }

  function submitCheckout(dataExtra?: { [key: string]: string }) {
    setCart(false);

    const data = {
      email,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      country,
      city,
      state,
      postal,
      shippingMethod,
      paymentMethod,
      ...dataExtra,
    };

    submit(data, { method: "post" });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      onCheckoutChange();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [email, firstName, lastName, addressLine1, addressLine2, country, city, state, postal, shippingMethod]);

  useEffect(() => {
    if (aData && aData.error) {
      onCheckoutError(aData.error);
    }
  }, [aData]);

  return (
    <>
      <H1>checkout</H1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="flex flex-col gap-4 mt-4 md:col-span-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-950/50 border border-red-500 rounded text-red-500">
              <AlertCircle className="min-w-4 w-4 h-4" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <CheckoutSection title="contact">
            <InputControl>
              <Label htmlFor="email">email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputControl>

            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked />

              <label className="leading-4 text-sm text-zinc-300" htmlFor="">
                email me with news and offers
              </label>
            </div>
          </CheckoutSection>

          <CheckoutSection title="address">
            <div className="flex flex-col gap-3">
              <InputControl>
                <Label htmlFor="first_name">first name</Label>

                <Input
                  autoComplete="given-name"
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </InputControl>

              <InputControl>
                <Label htmlFor="last_name">last name</Label>

                <Input
                  autoComplete="family-name"
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </InputControl>

              <InputControl>
                <Label htmlFor="address_line_1">address</Label>

                <Input
                  autoComplete="address-line1"
                  id="address_line_1"
                  name="address_line_1"
                  placeholder="enter your address"
                  ref={addressRef}
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
              </InputControl>

              <InputControl>
                <Label htmlFor="address_line_2">apt / suite / unit</Label>

                <Input
                  autoComplete="address-line2"
                  id="address_line_2"
                  placeholder="optional"
                  name="address_line_2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </InputControl>

              <InputControl>
                <Label htmlFor="country">country</Label>

                <Select
                  autoComplete="country"
                  id="country"
                  name="country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="" disabled></option>
                  <option value="US">united states</option>
                </Select>
              </InputControl>

              <InputControl>
                <Label htmlFor="city">city</Label>

                <Input
                  autoComplete="address-level2"
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </InputControl>

              <InputControl>
                <Label htmlFor="state">state</Label>

                <Select
                  autoComplete="address-level1"
                  id="state"
                  name="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option disabled value=""></option>
                  <option value="AL">alabama</option>
                  <option value="AK">alaska</option>
                  <option value="AZ">arizona</option>
                  <option value="AR">arkansas</option>
                  <option value="CA">california</option>
                  <option value="CO">colorado</option>
                  <option value="CT">connecticut</option>
                  <option value="DE">delaware</option>
                  <option value="DC">district of columbia</option>
                  <option value="FL">florida</option>
                  <option value="GA">georgia</option>
                  <option value="HI">hawaii</option>
                  <option value="ID">idaho</option>
                  <option value="IL">illinois</option>
                  <option value="IN">indiana</option>
                  <option value="IA">iowa</option>
                  <option value="KS">kansas</option>
                  <option value="KY">kentucky</option>
                  <option value="LA">louisiana</option>
                  <option value="ME">maine</option>
                  <option value="MD">maryland</option>
                  <option value="MI">michigan</option>
                  <option value="MN">minnesota</option>
                  <option value="MS">mississippi</option>
                  <option value="MO">missouri</option>
                  <option value="MT">montana</option>
                  <option value="NE">nebraska</option>
                  <option value="NV">nevada</option>
                  <option value="NH">new hampshire</option>
                  <option value="NJ">new jersey</option>
                  <option value="NM">new mexico</option>
                  <option value="NY">new york</option>
                  <option value="NC">north carolina</option>
                  <option value="ND">north dakota</option>
                  <option value="OH">ohio</option>
                  <option value="OK">oklahoma</option>
                  <option value="OR">oregon</option>
                  <option value="PA">pennsylvania</option>
                  <option value="RI">rhode island</option>
                  <option value="SC">south carolina</option>
                  <option value="SD">south dakota</option>
                  <option value="TN">tennessee</option>
                  <option value="TX">texas</option>
                  <option value="VT">vermont</option>
                  <option value="VA">virginia</option>
                  <option value="WA">washington</option>
                  <option value="WV">west virginia</option>
                  <option value="WI">wisconsin</option>
                  <option value="WY">wyoming</option>
                </Select>
              </InputControl>

              <InputControl>
                <Label htmlFor="postal">zip code</Label>

                <Input
                  autoComplete="postal-code"
                  id="postal"
                  name="postal"
                  type="text"
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                />
              </InputControl>
            </div>
          </CheckoutSection>

          <CheckoutSection title="shipping">
            <div className="flex flex-col gap-1.5">
              <CheckoutShippingOption
                active={shippingMethod === "standard"}
                title="standard shipping"
                days={5}
                price={data.summary.subtotal > 40 ? 0 : 2.99}
                onClick={() => setShippingMethod("standard")}
              />

              <CheckoutShippingOption
                active={shippingMethod === "express"}
                title="express shipping"
                days={3}
                price={10}
                onClick={() => setShippingMethod("express")}
              />
            </div>
          </CheckoutSection>

          <CheckoutSection title="payment">
            <div className="flex flex-col gap-1.5">
              <CheckoutPaymentOption
                active={paymentMethod === "apple-cash"}
                title="apple cash"
                icons={<img alt="Apple" className="h-5 rounded-xs" src="/img/apple.svg" />}
                content={<CheckoutAppleCashContent total={total} />}
                onClick={() => onPaymentChange("apple-cash")}
              />

              <CheckoutPaymentOption
                active={paymentMethod === "credit-card"}
                title="credit card"
                icons={getCardIcons()}
                content={
                  <>
                    <InputControl>
                      <Label htmlFor="card_number">card number</Label>

                      <Input
                        autoComplete="cc-number"
                        inputMode="numeric"
                        id="card_number"
                        name="card_number"
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => onCardNumberChange(e.target.value)}
                      />
                    </InputControl>

                    <div className="grid grid-cols-2 gap-2">
                      <InputControl>
                        <Label htmlFor="card_expiry">expiration date</Label>

                        <Input
                          autoComplete="cc-exp"
                          id="card_expiry"
                          name="card_expiry"
                          placeholder="mm/yy"
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => onCardExpiryChange(e.target.value)}
                        />
                      </InputControl>

                      <InputControl>
                        <Label htmlFor="card_cvc">security code</Label>

                        <Input
                          autoComplete="cc-csc"
                          id="card_cvc"
                          name="card_cvc"
                          type="number"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                        />
                      </InputControl>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <InputControl>
                        <Label htmlFor="card_holder">name on card</Label>

                        <Input
                          autoComplete="cc-name"
                          id="card_holder"
                          name="card_holder"
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                        />
                      </InputControl>

                      <InputControl>
                        <Label htmlFor="card_postal">billing zip</Label>

                        <Input
                          autoComplete="billing postal-code"
                          id="card_postal"
                          name="card_postal"
                          type="text"
                          required
                          value={cardPostal}
                          onChange={(e) => setCardPostal(e.target.value)}
                        />

                        <div className="flex items-center gap-1 mt-1 font-medium leading-3 text-xs text-zinc-300 sm:hidden">
                          <CircleAlert className="w-3 h-3" />
                          <span>must match card address</span>
                        </div>
                      </InputControl>
                    </div>
                  </>
                }
                onClick={() => onPaymentChange("credit-card")}
              />

              <CheckoutPaymentOption
                active={paymentMethod === "cash-app"}
                title="cash app"
                icons={<img alt="Cash App" className="h-5 rounded-xs" src="/img/cash-app.svg" />}
                content={<CheckoutCashAppContent total={total} />}
                onClick={() => onPaymentChange("cash-app")}
              />

              <CheckoutPaymentOption
                active={paymentMethod === "zelle"}
                title="zelle"
                icons={<img alt="Zelle" className="h-5 rounded-xs" src="/img/zelle.svg" />}
                content={<CheckoutZelleContent total={total} />}
                onClick={() => onPaymentChange("zelle")}
              />
            </div>
          </CheckoutSection>

          <Button className="hidden w-full md:flex" disabled={loading} onClick={onCheckoutClick}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>checkout</span>
                <MoveRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:col-span-2">
          <CheckoutSummary
            loading={loading}
            onCheckoutClick={onCheckoutClick}
            summary={{ subtotal, coupon: couponTotal, shipping: shippingTotal, total }}
          />
        </div>
      </div>
    </>
  );
}

function CheckoutSection({ title, children }: CheckoutSectionProps) {
  return (
    <BackgroundGradient gradientClassName="even:bg-gradient-to-t">
      <Card>
        <H2 className="pb-3 mb-2 border-b border-zinc-700 text-lg leading-5">{title}</H2>

        {children}
      </Card>
    </BackgroundGradient>
  );
}

function CheckoutShippingOption({ active, title, days, price, onClick }: CheckoutShippingOptionProps) {
  return (
    <button className="text-left" onClick={onClick}>
      <Card
        className={cn(
          "flex items-start gap-2 bg-transparent backdrop-blur-xs border-zinc-700",
          active && "bg-pink-950/25 border-pink-500",
        )}
      >
        <input className="mt-0.5 accent-pink-500" checked={active} readOnly type="radio" />

        <div className="flex flex-col">
          <p className="text-sm font-semibold leading-3.5">{title}</p>
          <p className="mt-1 text-zinc-300 text-xs leading-3">est. arrival by {getDeliveryEstimate(days)}</p>
        </div>

        <p className="ml-auto text-sm font-semibold leading-3.5">{price === 0 ? "free" : format.currency(price)}</p>
      </Card>
    </button>
  );
}

function CheckoutPaymentOption({ onClick, ...props }: CheckoutPaymentOptionProps) {
  return (
    <div className="flex flex-col">
      <button onClick={onClick}>
        <Card
          className={cn(
            "flex items-center gap-2 bg-transparent border-zinc-700 backdrop-blur-xs",
            props.active && "bg-pink-950/25 border-pink-500 rounded-b-none",
          )}
        >
          <input className="mt-0.25 accent-pink-500" checked={props.active} readOnly type="radio" />

          <p className="text-sm font-semibold leading-3.5">{props.title}</p>

          <div className="flex items-center justify-center gap-1 ml-auto">{props.icons}</div>
        </Card>
      </button>

      {props.active && (
        <Card className="flex flex-col gap-3 bg-transparent border-t-0 border-zinc-700 rounded-t-none backdrop-blur-xs">
          {props.content}
        </Card>
      )}
    </div>
  );
}

function CheckoutAppleCashContent({ total }: { total: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(true), []);

  if (!visible) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-2 text-center">
      <p className="text-sm">
        please send <span className="font-semibold">{format.currency(total)}</span> to the number below
      </p>

      <p className="mt-2 text-xl font-semibold font-mono leading-6">786-416-1137</p>

      <p className="mt-2 text-xs text-zinc-300 leading-4">complete the payment via apple cash, then click checkout.</p>
    </div>
  );
}

function CheckoutCashAppContent({ total }: { total: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(true), []);

  return (
    <div className="flex flex-col items-center justify-center py-2 text-center">
      <p className="text-sm">
        please send <span className="font-semibold">{format.currency(total)}</span> to the qr/tag below
      </p>

      {visible && (
        <div className="max-w-48 max-h-48 mt-4 mx-auto p-2 bg-white rounded-md">
          <QRCode className="h-full w-full" value="https://cash.app/$pufflyio?qr=1" />
        </div>
      )}

      <p className="mt-4 text-xl font-semibold font-mono leading-6">A at PFL</p>

      <p className="mt-1 text-xl font-semibold font-mono leading-6">
        <span className="text-[#00CF31]">$</span>pufflyio
      </p>

      <p className="mt-2 text-xs text-zinc-300 leading-4">complete the payment via cash app, then click checkout.</p>
    </div>
  );
}

function CheckoutZelleContent({ total }: { total: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(true), []);

  return (
    <div className="flex flex-col items-center justify-center py-2 text-center">
      <p className="text-sm">
        please send <span className="font-semibold">{format.currency(total)}</span> to the qr/number below
      </p>

      {visible && (
        <div className="max-w-48 max-h-48 mt-4 mx-auto p-2 bg-white rounded-md">
          <QRCode
            className="h-full w-full"
            value="https://www.zellepay.com/qr-codes/?data=eyJ0b2tlbiI6Ijc4Ni01NjYtMzMzMCIsIm5hbWUiOiJBTlRIT05ZIFJJVkVSTyJ9"
          />
        </div>
      )}

      <p className="mt-4 text-xl font-semibold font-mono leading-6">786-566-3330</p>

      <p className="mt-2 text-xs text-zinc-300 leading-4">complete the payment via zelle, then click checkout.</p>
    </div>
  );
}

function CheckoutSummary({ loading, summary, onCheckoutClick }: CheckoutSummaryProps) {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="h-full">
      <H2>order summary</H2>

      <CheckoutDeliveryThreshold />

      <CheckoutItems />

      <BackgroundGradient className="sticky top-24">
        <Card className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between gap-3">
            <p>subtotal</p>
            <p className="font-semibold">{format.currency(summary.subtotal)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>coupon</p>
            <p className={cn("font-semibold", data?.coupon && "text-green-500")}>
              {format.currency(data && data.coupon ? -summary.coupon : 0)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>shipping</p>
            <p className="font-semibold">{format.currency(summary.shipping)}</p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-zinc-700 text-lg font-semibold">
            <p>total</p>
            <p>{format.currency(summary.total)}</p>
          </div>
        </Card>

        <CheckoutCoupon />

        <Button className="w-full mt-2" disabled={loading} onClick={onCheckoutClick}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>checkout</span>
              <MoveRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center justify-center gap-1 px-4 py-1 bg-green-950 border border-green-500 rounded-full text-green-500 text-xs font-medium leading-3 select-none">
            <Lock className="w-3 h-3" />
            <span>secure and encrypted</span>
          </div>
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CheckoutDeliveryThreshold() {
  const data = useLoaderData<typeof loader>();

  const threshold = 40;
  const subtotal = data?.summary.subtotal || 0;
  const difference = threshold - subtotal;

  return (
    <Card className="mt-2">
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

function CheckoutItems() {
  const data = useLoaderData<typeof loader>();

  const [open, setOpen] = useState(false);

  const count = data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <BackgroundGradient className="mt-3">
      <Card className="p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="font-semibold text-base">
            {count} {format.plural(count, "item", "items")}
          </p>

          <Button className="gap-1.5 px-3 h-8 text-xs" variant="outline" onClick={() => setOpen(!open)}>
            <span>{open ? "hide" : "show"}</span>
            <ChevronDown className={cn("mt-0.5 w-4 h-4", open && "rotate-180")} />
          </Button>
        </div>

        {open && (
          <div className="flex flex-col p-3 border-t border-zinc-700">
            {data.items.map((item) => (
              <CheckoutItem key={item.id} {...item} />
            ))}
          </div>
        )}
      </Card>
    </BackgroundGradient>
  );
}

function CheckoutItem(props: CheckoutItemProps) {
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

function CheckoutCoupon() {
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
    await fetcher.submit({ action: "remove", order: data.order.id }, { action: "/checkout/coupon", method: "post" });

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

      <fetcher.Form action="/checkout/coupon" className="flex w-full" method="post">
        <input type="hidden" name="order" value={data.order.id} />

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

type CheckoutItemProps = {
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

type CheckoutSectionProps = {
  title: string;
  children: React.ReactNode;
};

type CheckoutShippingOptionProps = {
  active?: boolean;
  title: string;
  days: number;
  price: number;
  onClick?: () => void;
};

type CheckoutPaymentOptionProps = {
  active?: boolean;
  title: string;
  icons?: React.ReactNode;
  content?: React.ReactNode;
  onClick?: () => void;
};

type CheckoutSummaryProps = {
  summary: {
    subtotal: number;
    coupon: number;
    shipping: number;
    total: number;
  };
  loading: boolean;
  onCheckoutClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

declare global {
  interface Window {
    Accept?: AcceptJS;
  }
}

type AcceptJS = {
  dispatchData: AcceptJSDispatchData;
};

type AcceptJSDispatchData = (secureData: AcceptJSSecureData, onCardResponse: AcceptJSResponse) => void;

type AcceptJSAuthData = {
  apiLoginID: string;
  clientKey: string;
};

type AcceptJSCardData = {
  cardNumber: string;
  month: string;
  year: string;
  cardCode: string;
  zip: string;
  fullName: string;
};

type AcceptJSSecureData = {
  authData: AcceptJSAuthData;
  cardData: AcceptJSCardData;
};

type AcceptJSOpaqueData = {
  dataDescriptor: string;
  dataValue: string;
};

type AcceptJSResponseMessage = {
  code: string;
  text: string;
};

type AcceptJSResponseCode = "Ok" | "Error";

type AcceptJSResponseData = {
  opaqueData: AcceptJSOpaqueData;
  messages: {
    resultCode: AcceptJSResponseCode;
    message: AcceptJSResponseMessage[];
  };
};

type AcceptJSResponse = (response: AcceptJSResponseData) => void;
