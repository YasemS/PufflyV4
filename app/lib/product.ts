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

export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    select: {
      slug: true,
      name: true,
      tagline: true,
      description: true,
      price: true,
      brand: {
        select: {
          slug: true,
          name: true,
        },
      },
      images: {
        select: {
          id: true,
          alt: true,
          source: true,
        },
        orderBy: {
          alt: "asc",
        },
      },
      metadata: {
        select: {
          key: true,
          value: true,
        },
      },
      variants: {
        select: {
          id: true,
          name: true,
          options: {
            select: {
              name: true,
              value: true,
              stock: true,
              imageId: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        orderBy: { name: "asc" },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          name: true,
          title: true,
          content: true,
          verified: true,
          created: true,
        },
        where: {
          status: "APPROVED",
        },
        orderBy: {
          rating: "desc",
        },
        take: 6,
      },
    },
    where: {
      slug,
    },
  });

  if (!product) return null;

  // get number of review and average rating from all reviews not just the first 6
  const reviewStats = await prisma.productReview.aggregate({
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      status: "APPROVED",
      productSlug: product.slug,
    },
  });

  const reviewCountByRating = await prisma.productReview.groupBy({
    by: ["rating"],
    _count: {
      rating: true,
    },
    where: {
      productSlug: product.slug,
      status: "APPROVED", // only approved reviews
    },
    orderBy: {
      rating: "desc",
    },
  });

  const ratingsMap: Record<number, number> = {};
  for (let i = 1; i <= 5; i++) {
    const match = reviewCountByRating.find((c) => c.rating === i);
    ratingsMap[i] = match?._count.rating ?? 0;
  }

  return {
    ...product,
    reviews: {
      list: product.reviews,
      stats: {
        count: reviewStats._count.rating,
        average: reviewStats._avg.rating,
        ratings: ratingsMap,
      },
    },
  };
}

export async function getSimilarProducts(slug: string) {
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
      slug: {
        not: slug,
      },
      visible: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 4,
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
