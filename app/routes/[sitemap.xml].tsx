import prisma from "~/lib/prisma.server";

const date = new Date();

export async function loader() {
  const origin = "https://www.puffly.io";

  const brands = await prisma.brand.findMany({
    where: {
      visible: true,
    },
    select: {
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
    },
    orderBy: {
      created: "desc",
    },
  });

  const blogCollections = await prisma.blogCollection.findMany({
    select: {
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const routes = [
    {
      path: "/",
      lastmod: date,
    },
    {
      path: "/track",
      lastmod: date,
    },
    {
      path: "/help",
      lastmod: date,
    },
    {
      path: "/cart",
      lastmod: date,
    },
    {
      path: "/legal/privacy",
      lastmod: date,
    },
    {
      path: "/legal/refund",
      lastmod: date,
    },
    {
      path: "/legal/shipping",
      lastmod: date,
    },
    {
      path: "/legal/terms",
      lastmod: date,
    },
    {
      path: "/sitemap",
      lastmod: date,
    },
    {
      path: "/blog",
      lastmod: date,
    },
    {
      path: "/products",
      lastmod: date,
    },
    ...brands.map((brand) => ({
      path: "/brand/" + brand.slug,
      lastmod: date,
    })),
    ...blogPosts.map((blogPost) => ({
      path: "/blog/" + blogPost.slug,
      lastmod: date,
    })),
    ...blogCollections.map((blogCollection) => ({
      path: "/blog/collection/" + blogCollection.slug,
      lastmod: date,
    })),
  ];

  for (const product of products) {
    routes.push({
      path: "/product/" + product.slug,
      lastmod: date,
    });

    for (const variant of product.variants) {
      for (const option of variant.options) {
        routes.push({
          path: "/variant/" + product.slug + "/" + option.value,
          lastmod: date,
        });
      }
    }
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${routes
    .map(
      (route) => `
<url>
  <loc>${origin + route.path}</loc>
  <lastmod>${route.lastmod.toISOString()}</lastmod>
</url>`,
    )
    .join("\n")}

</urlset>`,
    {
      headers: { "content-type": "application/xml" },
    },
  );
}
