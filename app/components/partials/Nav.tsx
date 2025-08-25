import { ShoppingCart } from "lucide-react";
import { useContext } from "react";
import { Link, NavLink as RNavLink, type NavLinkProps } from "react-router";

import cn from "~/lib/cn";
import { GlobalContext } from "~/lib/global";

export default function Nav() {
  const { cart } = useContext(GlobalContext);

  return (
    <nav className="flex items-center justify-center sticky top-0 left-0 w-full h-16 px-8 bg-zinc-800/25 border-b border-zinc-800 backdrop-blur-xl z-10 sm:h-20 sm:justify-between">
      <Link className="font-bold leading-9 text-4xl pb-2" to="/">
        <p className="inline">puff</p>
        <p className="inline text-pink-500">ly</p>
      </Link>

      <div className="hidden items-center gap-8 sm:flex">
        <NavLink to="/products">products</NavLink>
        <NavLink to="/track">track order</NavLink>
        <NavLink to="/help">help</NavLink>

        <Link className="relative" to="/cart">
          <ShoppingCart className={cn("w-5 h-5", cart ? "fill-white" : "text-zinc-300")} />

          {cart && <span className="absolute top-0 -right-0.5 w-2 h-2 bg-pink-500 rounded-full"></span>}
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ to, children, ...props }: NavLinkProps) {
  return (
    <RNavLink
      className={({ isActive }) => cn("underline-offset-2 hover:underline", isActive ? "underline" : "text-zinc-300")}
      to={to}
      {...props}
    >
      {children}
    </RNavLink>
  );
}

type NavProps = {
  cart?: boolean;
};
