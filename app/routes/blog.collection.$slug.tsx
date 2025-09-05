import { Link, redirect, useLoaderData } from "react-router";
import { MoveLeft } from "lucide-react";

import type { Route } from "./+types/blog.collection.$slug";

import BlogPostCard from "~/components/Blog";
import { H1 } from "~/components/Heading";

import prisma from "~/lib/prisma.server";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  return [{ title: data.collection.name + " Posts - Puffly" }];
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  if (typeof slug !== "string") {
    return redirect("/blog");
  }

  const collection = await prisma.blogCollection.findUnique({
    where: {
      slug: slug,
    },
    select: {
      slug: true,
      name: true,
      posts: {
        select: {
          slug: true,
          image: true,
          title: true,
          description: true,
          created: true,
          author: {
            select: {
              name: true,
            },
          },
          collections: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!collection) {
    return redirect("/blog");
  }

  return { collection };
}

export default function BlogCollection() {
  const { collection } = useLoaderData<typeof loader>();

  return (
    <>
      <Link className="flex items-center gap-2 text-sm text-zinc-300" to="/blog">
        <MoveLeft className="w-4 h-4" />
        <span>Back to blog</span>
      </Link>

      <H1 className="mt-4">{collection.name} Collection</H1>

      <div className="grid grid-cols-3 mt-4">
        {collection.posts.map((post) => (
          <BlogPostCard key={post.slug} {...post} />
        ))}
      </div>
    </>
  );
}
