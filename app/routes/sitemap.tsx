import { Link, useLoaderData } from "react-router";
import { H1 } from "~/components/Heading";

import prisma from "~/lib/prisma.server";

export async function loader() {
  const brands = await prisma.brand.findMany({
    where: {
      visible: true,
    },
    select: {
      name: true,
      slug: true,
    },
  });

  const products = await prisma.product.findMany({
    where: {
      visible: true,
    },
    select: {
      name: true,
      slug: true,
      variants: {
        select: {
          name: true,
          options: {
            select: {
              name: true,
              value: true,
            },
          },
        },
      },
    },
  });

  const blogPosts = await prisma.blogPost.findMany({
    select: {
      slug: true,
      title: true,
    },
    orderBy: {
      created: "desc",
    },
  });

  const blogCollections = await prisma.blogCollection.findMany({
    select: {
      slug: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const routes = [
    {
      name: "home",
      path: "/",
    },
    {
      name: "track your order",
      path: "/track",
    },
    {
      name: "help",
      path: "/help",
    },
    {
      name: "cart",
      path: "/cart",
    },
    {
      name: "privacy policy",
      path: "/legal/privacy",
    },
    {
      name: "refund policy",
      path: "/legal/refund",
    },
    {
      name: "shipping policy",
      path: "/legal/shipping",
    },
    {
      name: "terms of service",
      path: "/legal/terms",
    },
    {
      name: "blog",
      path: "/blog",
    },
    {
      name: "products",
      path: "/products",
    },
    ...brands.map((brand) => ({
      name: brand.name + " products",
      path: "/brand/" + brand.slug,
    })),
    ...blogPosts.map((blogPost) => ({
      name: blogPost.title.toLowerCase(),
      path: "/blog/" + blogPost.slug,
    })),
    ...blogCollections.map((blogCollection) => ({
      name: blogCollection.name.toLowerCase() + " blog posts",
      path: "/blog/collection/" + blogCollection.slug,
    })),
  ];

  for (const product of products) {
    routes.push({
      name: product.name,
      path: "/product/" + product.slug,
    });

    for (const variant of product.variants) {
      for (const option of variant.options) {
        routes.push({
          name: product.name + " - " + option.name + " " + variant.name,
          path: "/variant/" + product.slug + "/" + option.value,
        });
      }
    }
  }

  return { routes: routes.sort((a, b) => a.name.localeCompare(b.name)) };
}

export default function Sitemap() {
  const { routes } = useLoaderData<typeof loader>();

  return (
    <>
      <H1>sitemap</H1>

      <ul className="mt-4 list-inside list-disc text-sm text-pink-500 font-medium">
        {routes.map((route) => (
          <li className="mt-1 first:mt-0 " key={route.path}>
            <Link className="hover:underline" to={route.path}>
              {route.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
