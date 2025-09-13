import prisma from "~/lib/prisma.server";

export async function getProducts(brandSlug?: string | null, limit?: number | null) {
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
      brandSlug: brandSlug || undefined,
    },
    take: limit || undefined,
  });

  const results = [];

  for (const product of products) {
    const image = product.images[0]?.source || "";

    const reviewStats = await prisma.productReview.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        status: "APPROVED",
        productSlug: product.slug,
      },
    });

    results.push({
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      rating: reviewStats._avg.rating,
      brand: product.brand,
    });
  }

  return results;
}

export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    select: {
      slug: true,
      name: true,
      tagline: true,
      description: true,
      price: true,
      visible: true,
      seoDescription: true,
      created: true,
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
              seoDescription: true,
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
        // take: 6,
      },
    },
    where: {
      slug,
    },
  });

  if (!product) return null;

  // get number of review and average rating
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

  // get count of reviews by rating (1-5)
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

  // map the counts to a ratings map
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

  const results = [];

  for (const product of products) {
    const image = product.images[0]?.source || "";

    const reviewStats = await prisma.productReview.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        status: "APPROVED",
        productSlug: product.slug,
      },
    });

    results.push({
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      rating: reviewStats._avg.rating,
      brand: product.brand,
    });
  }

  return results;
}
