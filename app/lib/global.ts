import { createContext } from "react";

export const GlobalContext = createContext<{
  cart: boolean;
  setCart: (cart: boolean) => void;
}>({ cart: false, setCart: () => {} });
