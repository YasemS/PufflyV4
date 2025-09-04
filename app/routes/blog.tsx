import { Search } from "lucide-react";
import { Link } from "react-router";

import BackgroundGradient from "~/components/BackgroundGradient";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Input from "~/components/Input";
import { H2, H3 } from "~/components/Heading";

export default function Blog() {
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
          <Link className="flex flex-col w-full group" to="/blog/1">
            <img
              src="https://www.puffly.io/img/geek-bar-pulse-banner.png"
              alt=""
              className="w-full h-full aspect-video rounded object-cover object-center"
            />

            <div className="flex items-center gap-1 mt-4 text-xs text-zinc-300 leading-3">
              <p>John Doe</p>
              <span>&bull;</span>
              <p>{new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <H3 className="mt-2 group-hover:underline">How to Keep My E-Liquid Safe</H3>

            <p className="mt-1 text-xs text-zinc-300">
              {`Protecting your e-liquid isn't just about preserving flavor, it's about safety and cost efficiency, too.
              Whether you're a casual vaper or a long-term enthusiast, storing your e-juice properly ensures freshness,
              potency, and peace of mind.`.slice(0, 170) + "..."}
            </p>

            <div className="flex items-center mt-3">
              <Link className="px-4 py-1 border rounded-full text-xs font-semibold" to="/blog/collection/e-liquid">
                E-Liquid
              </Link>
            </div>
          </Link>
        </div>
      </BackgroundGradient>
    </div>
  );
}
