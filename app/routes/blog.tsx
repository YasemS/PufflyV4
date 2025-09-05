import { Search } from "lucide-react";
import { useLoaderData } from "react-router";

import BackgroundGradient from "~/components/BackgroundGradient";
import BlogPostCard from "~/components/Blog";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import { H2 } from "~/components/Heading";

import prisma from "~/lib/prisma.server";

export async function loader() {
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
    orderBy: {
      created: "desc",
    },
  });

  return { posts };
}

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div>
      <BackgroundGradient>
        <Card className="flex flex-col items-center justify-center relative py-16 text-center z-1">
          <div className="flex items-center justify-center">
            <p className="px-4 py-1 border rounded-full text-sm font-semibold">Blog</p>
          </div>

          <h1 className="mt-4 text-4xl font-bold">Discover our blog posts</h1>

          <div className="flex items-center justify-center mt-6 w-full max-w-sm">
            <Input className="w-full rounded-r-none" placeholder="search posts..." />

            <Button className="rounded-l-none">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </BackgroundGradient>

      <BackgroundGradient className="mt-8" gradientClassName="opacity-5">
        <H2 className="pb-4 text-2xl border-b border-zinc-700">📜 latest posts</H2>

        <div className="grid grid-cols-3 mt-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
        </div>
      </BackgroundGradient>
    </div>
  );
}
