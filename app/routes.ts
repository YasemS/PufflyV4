import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("help", "routes/help.tsx"),
  route("rewards", "routes/rewards.tsx"),
  route("products", "routes/products.tsx"),
  route("product/:slug", "routes/product.$slug.tsx"),
  route("track", "routes/track.tsx"),
  route("order/:id", "routes/order.$id.tsx"),
  route("cart", "routes/cart.tsx"),
  route("cart/add", "routes/cart.add.tsx"),
  route("cart/update", "routes/cart.update.tsx"),
  route("cart/coupon", "routes/cart.coupon.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("checkout/:id", "routes/checkout.$id.tsx"),
] satisfies RouteConfig;
