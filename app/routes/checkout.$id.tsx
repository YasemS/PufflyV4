import { useState } from "react";
import { Form } from "react-router";
import { AlertCircle, ChevronDown, CircleAlert, CircleQuestionMark, MoveRight, Trash } from "lucide-react";

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
import { getDeliveryEstimate } from "~/lib/shipping";

export default function Checkout() {
  const [shippingMethod, setShippingMethod] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  return (
    <>
      <H1>checkout</H1>

      <div className="flex flex-col gap-4 mt-4">
        <CheckoutDeliveryThreshold />

        <CheckoutSection title="contact">
          <InputControl>
            <Label htmlFor="email">email</Label>

            <Input id="email" name="email" type="email" required />
          </InputControl>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="" id="" />

            <label className="leading-4 text-sm text-zinc-300" htmlFor="">
              email me with news and offers
            </label>
          </div>
        </CheckoutSection>

        <CheckoutSection title="address">
          <div className="flex flex-col gap-3">
            <InputControl>
              <Label htmlFor="first_name">first name</Label>

              <Input id="first_name" name="first_name" type="text" required />
            </InputControl>

            <InputControl>
              <Label htmlFor="last_name">last name</Label>

              <Input id="last_name" name="last_name" type="text" required />
            </InputControl>

            <InputControl>
              <Label htmlFor="address_line_1">address</Label>

              <Input id="address_line_1" name="address_line_1" type="text" required />
            </InputControl>

            <InputControl>
              <Label htmlFor="address_line_2">apt / suite / unit</Label>

              <Input id="address_line_2" placeholder="optional" name="address_line_2" type="text" />
            </InputControl>

            <InputControl>
              <Label htmlFor="country">country</Label>

              <Select defaultValue="" id="country" name="country" required>
                <option value="" disabled></option>
                <option value="US">united states</option>
              </Select>
            </InputControl>

            <InputControl>
              <Label htmlFor="city">city</Label>

              <Input id="city" name="city" type="text" required />
            </InputControl>

            <InputControl>
              <Label htmlFor="state">state</Label>

              <Select defaultValue="" id="state" name="state" required>
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

              <Input id="postal" name="postal" type="text" required />
            </InputControl>

            <InputControl>
              <Label htmlFor="phone">phone</Label>

              <Input id="phone" placeholder="optional" name="phone" type="text" />
            </InputControl>
          </div>
        </CheckoutSection>

        <CheckoutSection title="shipping">
          <div className="flex flex-col gap-1.5">
            <CheckoutShippingOption
              active={shippingMethod === "standard"}
              title="standard shipping"
              days={5}
              price={2.99}
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
              active={paymentMethod === "credit-card"}
              title="credit card"
              icons={
                <>
                  <img alt="visa" className="h-5 rounded-xs" src="/img/visa.svg" />
                  <img alt="mastercard" className="h-5 rounded-xs" src="/img/mastercard.svg" />
                  <img alt="amex" className="h-5 rounded-xs" src="/img/amex.svg" />

                  <p className="pl-1 font-medium leading-3 text-center text-xs">+2</p>
                </>
              }
              content={
                <>
                  <InputControl>
                    <Label htmlFor="card_number">card number</Label>

                    <Input id="card_number" name="card_number" type="text" required />
                  </InputControl>

                  <div className="grid grid-cols-2 gap-2">
                    <InputControl>
                      <Label htmlFor="expiry_date">expiration date</Label>

                      <Input id="expiry_date" name="expiry_date" placeholder="mm/yy" type="text" required />
                    </InputControl>

                    <InputControl>
                      <Label htmlFor="security_code">security code</Label>

                      <Input id="security_code" name="security_code" type="text" required />
                    </InputControl>
                  </div>

                  <InputControl>
                    <Label htmlFor="card_holder">name on card</Label>

                    <Input id="card_holder" name="card_holder" type="text" required />
                  </InputControl>

                  <InputControl>
                    <Label htmlFor="card_postal">billing zip</Label>

                    <Input id="card_postal" name="card_postal" type="text" required />

                    <div className="flex items-center gap-1 mt-1 font-medium leading-3 text-xs text-zinc-300">
                      <CircleAlert className="w-3 h-3" />
                      <span>must match card address</span>
                    </div>
                  </InputControl>
                </>
              }
              onClick={() => setPaymentMethod("credit-card")}
            />
          </div>
        </CheckoutSection>
      </div>

      <div className="flex flex-col mt-12">
        <CheckoutUpsell />

        <CheckoutSummary />
      </div>
    </>
  );
}

function CheckoutDeliveryThreshold() {
  // const data = useLoaderData<typeof loader>();

  const threshold = 40;
  const subtotal = 10;
  // const subtotal = data?.summary.subtotal || 0;
  const difference = threshold - subtotal;

  return (
    <Card>
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
          <p className="mt-1 text-zinc-300 text-xs leading-3">est. to arrive by {getDeliveryEstimate(days)}</p>
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
          <input className="mt-0.5 accent-pink-500" checked={props.active} readOnly type="radio" />

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

function CheckoutSummary() {
  return (
    <div className="mt-8">
      <H2>order summary</H2>

      <CheckoutItems />

      <BackgroundGradient>
        <Card className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between gap-3">
            <p>subtotal</p>
            <p className="font-semibold">{format.currency(0)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>coupon</p>
            <p className={cn("font-semibold text-green-500")}>{format.currency(-5)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p>shipping</p>
            <p className="font-semibold">{format.currency(2.99)}</p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-zinc-700 text-lg font-semibold">
            <p>total</p>
            <p>{format.currency(0)}</p>
          </div>
        </Card>

        <CheckoutCoupon />

        <div className="flex flex-col mt-2">
          <Form action="/checkout" method="post">
            <Button className="w-full">
              <span>pay now</span>
              <MoveRight className="w-4 h-4" />
            </Button>
          </Form>
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CheckoutItems() {
  const [open, setOpen] = useState(false);

  return (
    <BackgroundGradient className="mt-3">
      <Card className="p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="font-semibold text-base">5 items</p>

          <Button className="gap-1.5 px-3 h-8 text-xs" variant="outline" onClick={() => setOpen(!open)}>
            <span>{open ? "hide" : "show"}</span>
            <ChevronDown className={cn("mt-0.5 w-4 h-4", open && "rotate-180")} />
          </Button>
        </div>

        {open && (
          <div className="flex flex-col p-3 border-t border-zinc-700">
            <CheckoutItem />

            <CheckoutItem />
          </div>
        )}
      </Card>
    </BackgroundGradient>
  );
}

function CheckoutItem() {
  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-700 first:mt-0 first:pt-0 first:border-t-0">
      <Card className="relative min-w-16 w-16 h-16 p-2 border-zinc-700">
        <img
          alt=""
          className="w-full h-full object-contain"
          src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
        />

        <span className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full text-xs text-center font-semibold leading-4">
          1
        </span>
      </Card>

      <div className="flex flex-col">
        <p className="font-bold leading-4">geek bar pulse x</p>

        <p className="mt-1 text-zinc-300 text-xs font-medium leading-3">
          <span>
            flavour: <span className="font-semibold">blue razz ice</span>
          </span>
        </p>
      </div>

      <p className="ml-auto font-bold leading-4">{format.currency(5)}</p>
    </div>
  );
}

function CheckoutUpsell() {
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
          {/* <CartMysteryItem /> */}
        </div>
      </BackgroundGradient>
    </div>
  );
}

function CartMysteryItem(props: CheckoutMysteryItemProps) {
  // const data = useLoaderData<typeof loader>();

  // const fetcher = useFetcher();
  // const loading = fetcher.state !== "idle";

  // const exists = data?.items.find((item) => item.slug === props.slug);

  const loading = false;

  const exists = { id: 1 };

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

          <Form action={exists ? "/cart/update" : "/cart/add"} method="post">
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
          </Form>
        </div>
      </div>
    </Card>
  );
}

function CheckoutCoupon() {
  // const data = useLoaderData<typeof loader>();

  // const fetcher = useFetcher();
  const loading = false;
  const error = null;

  const [edit, setEdit] = useState(false);
  const [code, setCode] = useState("");

  // function onEditClick() {
  //   if (data && data.coupon) {
  //     setCode(data.coupon.code);
  //   }

  //   setEdit(true);
  // }

  // async function onRemoveClick() {
  //   await fetcher.submit({ action: "remove" }, { action: "/cart/coupon", method: "post" });

  //   setEdit(false);
  //   setCode("");
  // }

  // useEffect(() => {
  //   if (data && data.coupon) {
  //     setEdit(false);
  //     setCode(data.coupon.code);
  //   }
  // }, [data]);

  // if (data && data.coupon && !edit) {
  //   return (
  //     <Card className="flex items-center gap-2 mt-2">
  //       <CheckCircle className="w-4 h-4 text-green-500" />

  //       <p className="text-sm font-medium leading-4">
  //         coupon <strong>{data.coupon.code}</strong> applied for{" "}
  //         {data.coupon.type === "PERCENTAGE" ? `${data.coupon.discount}%` : `${format.currency(data.coupon.discount)}`}{" "}
  //         off
  //       </p>

  //       <Button variant="outline" className="w-6 h-6 ml-auto px-0" onClick={onEditClick}>
  //         <Pencil className="w-3 h-3" />
  //       </Button>
  //     </Card>
  //   );
  // }

  return (
    <Card className="flex flex-col items-start mt-2">
      {error && (
        <div className="flex items-center gap-2 w-full px-3 py-2 mb-2 bg-red-950/50 border border-red-500 rounded text-red-500">
          <AlertCircle className="min-w-4 w-4 h-4" />
          <p className="text-sm font-semibold leading-4">{error}</p>
        </div>
      )}

      <Form action="/cart/coupon" className="flex w-full" method="post">
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
      </Form>

      {/* {edit && (
        <button className="mt-1 text-xs text-zinc-300 font-medium leading-3" disabled={loading} onClick={onRemoveClick}>
          remove coupon
        </button>
      )} */}
    </Card>
  );
}

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

type CheckoutMysteryItemProps = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
};
