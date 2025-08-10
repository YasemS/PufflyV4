import {
  APIProvider,
  Map,
  Marker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { act, useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Headset,
  Home,
  Mail,
  Phone,
  User,
} from "lucide-react";

import BackgroundGradient from "~/components/BackgroundGradient";
import Card from "~/components/Card";
import { H1, H2, H3 } from "~/components/Heading";
import Scroller from "~/components/Scroller";
import cn from "~/lib/cn";
import Button from "~/components/Button";
import { Link } from "react-router";

export default function Order() {
  return (
    <>
      <H1>your order</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        est. delivery 24 jun 2025
      </p>

      <OrderItemsScroller />

      <OrderMap />

      <OrderStatus />

      <OrderInformation />
    </>
  );
}

function OrderItemsScroller() {
  return (
    <BackgroundGradient className="mt-4" gradientClassName="h-3/4 w-1/2">
      <Scroller>
        <div className="flex items-center gap-1">
          <Card className="min-w-20 w-20 h-20 p-2">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            />
          </Card>

          <Card className="min-w-20 w-20 h-20 p-2">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            />
          </Card>

          <Card className="min-w-20 w-20 h-20 p-2">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            />
          </Card>

          <Card className="min-w-20 w-20 h-20 p-2">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            />
          </Card>

          <Card className="min-w-20 w-20 h-20 p-2">
            <img
              alt=""
              className="w-full h-full object-contain"
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
            />
          </Card>
        </div>
      </Scroller>
    </BackgroundGradient>
  );
}

function OrderMap() {
  return (
    <BackgroundGradient className="mt-2" gradientClassName="h-1/2">
      <Card className="relative w-full h-100 p-0 overflow-hidden">
        <APIProvider apiKey={"AIzaSyCAKJnuSa3PDUxJtb1qsoHH4zy7vUOGsCM"}>
          <AddressMarker address="10000 Santa Monica Blvd, Los Angeles, CA, 90067" />
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
    >
      <Marker position={coords} />
    </Map>
  );
}

function OrderStatus() {
  return (
    <BackgroundGradient className="mt-2" gradientClassName="bg-gradient-to-r">
      <Card className="flex flex-col p-4">
        <H2 className="text-center">processing</H2>

        <div className="flex mt-5 pb-6 relative">
          <div className="w-full h-4 mx-6 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
            <div className="w-2/3 h-full bg-pink-500 rounded-full"></div>
          </div>

          <div className="flex justify-between absolute -top-1 left-0 w-full">
            <OrderStatusItem active status="ordered" />

            <OrderStatusItem active status="paid" />

            <OrderStatusItem active status="processing" />

            <OrderStatusItem status="shipped" />
          </div>
        </div>
      </Card>
    </BackgroundGradient>
  );
}

function OrderStatusItem({
  active,
  status,
}: {
  active?: boolean;
  status: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-12">
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full drop-shadow",
          active ? "bg-pink-500" : "bg-zinc-800"
        )}
      >
        {active && <Check className="w-4 h-4" />}
      </div>

      <p className={cn("mt-1 text-xs font-medium", !active && "text-zinc-400")}>
        {status}
      </p>
    </div>
  );
}

function OrderInformation() {
  return (
    <BackgroundGradient className="mt-2">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <H3 className="text-base leading-4">order - 123456789</H3>
            <p className="mt-0.5 text-xs text-zinc-300 font-medium leading-3">
              placed on 1 jun 2025
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
            <p>john doe</p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Home />}>
            <p>10000 Santa Monica Blvd</p>
            <p>Los Angeles, CA 90067</p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Mail />}>
            <p>john@example.com</p>
          </OrderInformationRow>

          <OrderInformationRow icon={<Phone />}>
            <p>(123) 456-7890</p>
          </OrderInformationRow>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-zinc-700 text-sm leading-4">
          <p className="text-zinc-300">payment method</p>

          <div className="flex items-center justify-center gap-1.5">
            <p className="font-medium">credit card</p>

            <CreditCard className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </BackgroundGradient>
  );
}

type OrderInformationRowProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
};

function OrderInformationRow({ icon, children }: OrderInformationRowProps) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center w-4 h-4 text-zinc-300">{icon}</div>

      <div className="flex flex-col gap-1 pt-0.25 text-sm font-medium leading-3.5 lowercase">
        {children}
      </div>
    </div>
  );
}
