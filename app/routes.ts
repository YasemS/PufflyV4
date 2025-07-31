import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("rewards", "routes/rewards.tsx"),
  route("products", "routes/products.tsx"),
] satisfies RouteConfig;
