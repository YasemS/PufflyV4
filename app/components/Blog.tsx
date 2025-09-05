import { Link } from "react-router";

import { H3 } from "~/components/Heading";

export default function BlogPostCard(post: BlogPostCardProps) {
  return (
    <Link className="flex flex-col w-full group" to={"/blog/" + post.slug}>
      <div className="w-full aspect-video overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full rounded object-cover object-center" />
      </div>

      <div className="flex items-center gap-1 mt-4 text-xs text-zinc-300 leading-3">
        <p>{post.author?.name}</p>
        <span>&bull;</span>
        <p>{post.created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <H3 className="mt-2 group-hover:underline">{post.title}</H3>

      <p className="mt-1 text-xs text-zinc-300">{post.description}</p>

      <div className="flex items-center gap-1 mt-3">
        {post.collections.map((collection) => (
          <p className="px-4 py-1 border rounded-full text-xs font-semibold select-none" key={collection.slug}>
            {collection.name}
          </p>
        ))}
      </div>
    </Link>
  );
}

type BlogPostCardProps = {
  title: string;
  slug: string;
  image: string;
  description: string;
  created: Date;
  collections: {
    slug: string;
    name: string;
  }[];
  author: {
    name: string;
  } | null;
};
