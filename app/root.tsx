import { useEffect, useState } from "react";
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";

import type { Route } from "./+types/root";

import "~/app.css";

import Loader from "~/components/partials/Loader";
import Announcement from "~/components/partials/Announcement";
import Nav from "~/components/partials/Nav";
import MobileNav from "~/components/partials/MobileNav";
import Footer from "~/components/partials/Footer";
import AgePopup from "~/components/partials/AgePopup";
import Container from "~/components/Container";

import fbq from "~/lib/analytics/fbq.client";
import gtag from "~/lib/analytics/gtag.client";
import { cartCookie, getCart } from "~/lib/cart.server";
import { GlobalContext } from "~/lib/global";

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  let cartExists = false;

  const cookieHeader = request.headers.get("Cookie");
  const cartId = await cartCookie.parse(cookieHeader);

  if (cartId) {
    const cart = await getCart(cartId);

    if (cart && cart.items.length > 0) {
      cartExists = true;
    }
  }

  const keys = {
    analytics: {
      datafast: process.env.DATAFAST_WEBSITE_ID,
      google: process.env.GOOGLE_ANALYTICS_ID,
      meta: process.env.META_PIXEL_ID,
    },
  };

  return { cart: cartExists, keys };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <script type="text/javascript" src="https://js.authorize.net/v1/Accept.js"></script>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { cart: cartExists, keys } = useLoaderData<typeof loader>();

  const [cart, setCart] = useState(cartExists);

  useEffect(() => {
    // Add DataFast script
    const script = document.createElement("script");
    script.defer = true;
    script.setAttribute("data-website-id", keys.analytics.datafast || "");
    script.setAttribute("data-domain", "www.puffly.io");
    script.src = "/js/script.js";
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fbq.init(keys.analytics.meta || "");
    gtag.init(keys.analytics.google || "");
  }, []);

  return (
    <GlobalContext.Provider value={{ cart, setCart }}>
      <Loader />

      <Announcement />

      <Nav />
      <MobileNav />

      <main className="p-8 md:pb-16">
        <Container>
          <Outlet />
        </Container>
      </main>

      <AgePopup />

      <Footer />
    </GlobalContext.Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
