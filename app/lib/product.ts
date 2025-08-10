import prisma from "~/lib/prisma";

export async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      slug: true,
      name: true,
      price: true,
      images: {
        select: {
          alt: true,
          source: true,
        },
        orderBy: {
          alt: "asc",
        },
        take: 1,
      },
      brand: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
    where: {
      visible: true,
    },
  });

  const formatted = products.map((product) => {
    const image = product.images[0].source;

    return {
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      rating: 5,
      brand: product.brand,
    };
  });

  return formatted;
}
