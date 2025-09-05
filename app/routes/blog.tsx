import { Search } from "lucide-react";
import { Form, useLoaderData } from "react-router";

import type { Route } from "./+types/blog";

import BackgroundGradient from "~/components/BackgroundGradient";
import BlogPostCard from "~/components/Blog";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import { H2 } from "~/components/Heading";

import prisma from "~/lib/prisma.server";
import format from "~/lib/format";

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.query ? `Search blog for "${data.query}" - Puffly` : "Blog - Puffly" }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q");

  const where = q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : undefined;

  const posts = await prisma.blogPost.findMany({
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
    where,
    orderBy: {
      created: "desc",
    },
  });

  return { posts, query: q };
}

export default function Blog() {
  const { posts, query } = useLoaderData<typeof loader>();

  return (
    <div>
      <BackgroundGradient>
        <Card className="flex flex-col items-center justify-center relative py-16 text-center z-1">
          <div className="flex items-center justify-center">
            <p className="px-4 py-1 border rounded-full text-sm font-semibold">Blog</p>
          </div>

          <h1 className="mt-4 text-4xl font-bold">Discover our blog posts</h1>

          <Form className="flex items-center justify-center mt-6 w-full max-w-sm" method="get">
            <Input
              className="w-full rounded-r-none"
              defaultValue={query || ""}
              placeholder="search posts..."
              type="search"
              name="q"
            />

            <Button className="rounded-l-none" type="submit">
              <Search className="w-4 h-4" />
            </Button>
          </Form>
        </Card>
      </BackgroundGradient>

      <BackgroundGradient className="mt-8" gradientClassName="opacity-5">
        <div className="pb-4 border-b border-zinc-700">
          <H2 className="text-2xl">{query ? "🔍 Search Results" : "📜 Latest Posts"}</H2>

          {query && (
            <p className="mt-1 text-sm text-zinc-300">
              Found {posts.length} {format.plural(posts.length, "result", "results")} for{" "}
              <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 mt-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
        </div>
      </BackgroundGradient>
    </div>
  );
}
