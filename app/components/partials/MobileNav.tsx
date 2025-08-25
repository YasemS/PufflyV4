import { CircleQuestionMark, ShoppingBag, ShoppingCart, Truck } from "lucide-react";
import { useContext } from "react";
import { NavLink, type NavLinkProps } from "react-router";

import cn from "~/lib/cn";
import { GlobalContext } from "~/lib/global";

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
          isActive && to !== "#" && "text-white underline underline-offset-2",
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
  const { cart } = useContext(GlobalContext);

  return (
    <nav className="grid grid-cols-4 fixed bottom-0 left-0 w-full h-16 bg-zinc-800/25 border-y border-zinc-800 backdrop-blur-xl z-10 sm:hidden">
      <MobileNavLink icon={<ShoppingBag />} text="products" to="/products" />
      {/* <MobileNavLink icon={<Gem />} text="rewards" to="/rewards" /> */}
      <MobileNavLink icon={<Truck />} text="track" to="/track" />
      <MobileNavLink icon={<CircleQuestionMark />} text="help" to="/help" />
      <MobileNavLink
        icon={
          <div className="relative">
            <ShoppingCart className={cn("w-5 h-5", cart ? "fill-white" : "text-zinc-300")} />

            {cart && <span className="absolute top-0 -right-0.5 w-2 h-2 bg-pink-500 rounded-full"></span>}
          </div>
        }
        text="cart"
        to="/cart"
      />
    </nav>
  );
}
