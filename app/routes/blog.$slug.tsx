import { useEffect, useState } from "react";
import { Link, redirect, useLoaderData, useLocation } from "react-router";
import { marked } from "marked";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";

import type { Route } from "./+types/blog.$slug";

import BackgroundGradient from "~/components/BackgroundGradient";

import cn from "~/lib/cn";
import img from "~/lib/img";
import prisma from "~/lib/prisma.server";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  const { post } = data;

  const title = post.title;
  const description = post.description;
  const canonical = "https://www.puffly.io/blog/" + post.slug;

  return [
    { title },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:site_name",
      content: "Puffly",
    },
    {
      property: "og:url",
      content: canonical,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: post.image,
    },
    {
      name: "twitter:site",
      content: "@pufflyio",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:description",
      content: description,
    },
    {
      tagName: "link",
      rel: "canonical",
      href: canonical,
    },
    {
      "script:ld+json": [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "puffly",
          url: "https://www.puffly.io",
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "puffly",
          url: "https://www.puffly.io",
          logo: "https://cdn.puffly.io/img/logo.png",
          sameAs: [
            "https://www.x.com/pufflyio",
            "https://www.instagram.com/pufflyio",
            "https://www.tiktok.com/@pufflyio",
            "https://www.youtube.com/@pufflyio",
          ],
        },
      ],
    },
    {
      "script:ld+json": {
        "@context": "http://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.puffly.io",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonical,
          },
        ],
      },
    },
    {
      "script:ld+json": {
        "@context": "http://schema.org",
        "@type": "Article",
        name: title,
        headline: title,
        description: description,
        url: canonical,
        image: post.image,
        author: {
          "@type": "Person",
          name: post.author?.name,
        },
        publisher: {
          "@type": "Organization",
          name: "Puffly",
        },
        datePublished: post.created.toISOString(),
        dateModified: post.updated.toISOString(),
      },
    },
  ];
};

export async function loader({ params }: Route.LoaderArgs) {
  const { slug } = params;

  if (typeof slug !== "string") {
    return redirect("/blog");
  }

  const post = await prisma.blogPost.findUnique({
    where: {
      slug: slug,
    },
    select: {
      slug: true,
      image: true,
      title: true,
      description: true,
      content: true,
      created: true,
      updated: true,
      collections: {
        select: {
          slug: true,
          name: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!post) {
    return redirect("/blog");
  }

  return { post };
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();

  const [showToc, setShowToc] = useState(false);

  const location = useLocation();

  marked.use(gfmHeadingId());

  const mdHtml = marked.parse(post.content);
  const mdHeadings = getHeadingList();

  function getReadTime() {
    // Remove code blocks
    let text = post.content.replace(/```[\s\S]*?```/g, "");
    // Remove inline code
    text = text.replace(/`[^`]*`/g, "");
    // Remove images ![alt](url)
    text = text.replace(/!\[.*?\]\(.*?\)/g, "");
    // Remove links [text](url)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Remove headings, blockquotes, lists markers, emphasis
    text = text.replace(/[#>*_~\-]+/g, "");
    // Collapse multiple spaces/newlines
    text = text.replace(/\s+/g, " ").trim();

    const words = text.split(" ").filter(Boolean).length;
    const minutes = Math.ceil(words / 200);

    return minutes;
  }

  useEffect(() => {
    setShowToc(true);
  }, []);

  useEffect(() => {
    if (location.hash && mdHeadings.length > 0) {
      window.scroll({
        top: (document.getElementById(location.hash.slice(1)) as HTMLElement).offsetTop - 100,
        behavior: "smooth",
      });
    }
  }, [location.hash]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center relative pt-8 pb-12 text-center z-1">
        <div className="flex items-center justify-center gap-2">
          {post.collections.map((collection) => (
            <Link
              className="px-4 py-1 border rounded-full text-sm font-semibold select-none"
              key={collection.slug}
              to={"/blog/collection/" + collection.slug}
            >
              {collection.name}
            </Link>
          ))}
        </div>

        <h1 className="mt-4 text-2xl font-bold sm:text-4xl">{post.title}</h1>

        <div className="flex flex-col items-center justify-center gap-1 mt-4 text-sm text-zinc-300 sm:flex-row sm:gap-2">
          <div className="flex items-center gap-2">
            <p>{post.author?.name}</p>
            <span>&bull;</span>
            <p>{post.created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <span className="hidden sm:inline">&bull;</span>
          <p>{getReadTime()} min read</p>
        </div>
      </div>

      <BackgroundGradient>
        <img
          className="aspect-video w-full object-cover object-center rounded-xl"
          src={img.transform(post.image, { width: 1024 })}
          alt={post.title}
        />
      </BackgroundGradient>

      <div className="grid grid-cols-3 gap-8 mt-8">
        <div
          className={cn(
            "col-span-3 max-w-none prose prose-zinc prose-invert prose-sm md:prose-base",
            showToc && "md:col-span-2",
          )}
          dangerouslySetInnerHTML={{
            __html: mdHtml,
          }}
        ></div>

        {showToc && (
          <div className="hidden md:block">
            <div className="flex flex-col">
              <p className="font-semibold">Table of Contents</p>

              {mdHeadings.map((heading) => {
                if (heading.level === 3) return null;

                return (
                  <Link
                    className={cn(
                      "mt-2 text-sm font-semibold underline-offset-1",
                      location.hash === "#" + heading.id ? "underline" : "",
                    )}
                    to={`#${heading.id}`}
                    key={heading.id}
                  >
                    {heading.text}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
