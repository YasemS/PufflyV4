import {
  CircleQuestionMark,
  Gem,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { NavLink, type NavLinkProps } from "react-router";

import cn from "~/lib/cn";

type MobileNavLinkProps = {
  icon: React.ReactNode;
  text: string;
} & NavLinkProps;

function MobileNavLink({ icon, text, to, ...props }: MobileNavLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex flex-col gap-1 items-center justify-center border-r border-zinc-800 text-zinc-300 last:border-r-0",
          isActive && to !== "#" && "text-white underline underline-offset-2"
        )
      }
      to={to}
      {...props}
    >
      <span className="flex items-center justify-center w-5 h-5">{icon}</span>

      <span className="text-xs font-semibold">{text}</span>
    </NavLink>
  );
}

export default function MobileNav() {
  return (
    <nav className="grid grid-cols-4 fixed bottom-0 left-0 w-full h-16 bg-zinc-800/25 border-y border-zinc-800 backdrop-blur-xl z-10">
      <MobileNavLink icon={<ShoppingBag />} text="products" to="/products" />
      <MobileNavLink icon={<Gem />} text="rewards" to="/rewards" />
      <MobileNavLink icon={<CircleQuestionMark />} text="help" to="/help" />
      <MobileNavLink
        icon={<ShoppingCart />}
        text="cart"
        to="/cart"
        // onClick={(e) => e.preventDefault()}
      />
    </nav>
  );
}
