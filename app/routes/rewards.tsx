import { Badge, Lock, MoveRight } from "lucide-react";
import cn from "~/lib/cn";

import { H1, H2, H3 } from "~/components/Heading";
import { useState } from "react";

export default function Rewards() {
  return (
    <>
      <H1>rewards</H1>
      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        unlock free products with puffly rewards!
      </p>

      <RewardsHero />

      <div className="mt-12">
        <H2>items</H2>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="w-full p-4 bg-zinc-900 rounded-lg opacity-25">
            <img
              src="https://cdn.puffly.io/img/products/geek-bar-pulse/blue-razz-ice.png"
              alt=""
            />

            <p className="mt-2 text-sm text-center font-semibold leading-5">
              geek bar pulse
            </p>

            <p className="text-zinc-300 text-xs text-center leading-3">
              1,000 points
            </p>
          </div>

          <div className="w-full p-4 bg-zinc-900 rounded-lg opacity-25">
            <img
              src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
              alt=""
            />

            <p className="mt-2 text-sm text-center font-semibold leading-5">
              geek bar pulse x
            </p>

            <p className="text-zinc-300 text-xs text-center leading-3">
              4,000 points
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function RewardsHeroImage() {
  return (
    <div className="relative w-full aspect-square">
      <img
        alt=""
        className="relative z-1"
        src="https://cdn.puffly.io/img/products/geek-bar-pulse-x/blue-razz-ice.png"
      />

      <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full h-full bg-gradient-to-br from-pink-500 to-blue-500 rounded-full blur-3xl opacity-20"></div>
    </div>
  );
}

function RewardsHeroContent() {
  return (
    <div className="flex flex-col items-start">
      <p className="flex px-2 py-1 bg-pink-950 border border-pink-500 rounded-sm text-pink-500 text-sm font-semibold leading-4">
        level 1
      </p>

      <H2 className="mt-3">geek bar pulse x</H2>

      <p className="mt-1 text-zinc-300 text-sm font-medium leading-4">
        enjoy the latest tech from geek bar
      </p>

      <button className="h-10 mt-4 px-12 bg-pink-500 rounded-md text-sm font-semibold">
        claim!
      </button>
    </div>
  );
}

function RewardsHero() {
  const [authed, setAuthed] = useState(true);

  return (
    <div className="relative">
      <div className={cn(!authed && "blur")}>
        <div className="flex flex-col gap-4 mt-12">
          <RewardsHeroImage />

          <RewardsHeroContent />
        </div>

        <RewardsBar />
      </div>

      {!authed && <RewardsLogin />}
    </div>
  );
}

function RewardsBarBadge() {
  return (
    <div className="relative">
      <Badge
        className="w-10 h-10 fill-pink-950 stroke-pink-500"
        strokeWidth={1}
      />

      <p className="absolute top-1/2 left-1/2 -translate-1/2 text-pink-500 font-semibold">
        1
      </p>
    </div>
  );
}

function RewardsBar() {
  return (
    <div className="flex items-center mt-8">
      <RewardsBarBadge />

      <div className="w-full pt-1.5 px-2">
        <div className="w-full bg-pink-950 border border-pink-500 rounded-sm h-3">
          <div className="w-1/2 h-full bg-pink-500"></div>
        </div>

        <div className="flex items-center justify-between w-full mt-1 text-zinc-300 text-xs font-medium leading-4">
          <p>level 1</p>

          <p>
            <span className="text-white">0</span> / 1,000 points
          </p>
        </div>
      </div>

      <RewardsBarBadge />
    </div>
  );
}

function RewardsLogin() {
  return (
    <div className="flex flex-col items-center justify-center absolute top-0 left-0 h-full w-full">
      <div className="flex flex-col w-full p-4 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg">
        <H3 className="text-base text-center mb-3 pb-3 border-b border-zinc-700">
          login to redeem rewards
        </H3>

        <div className="flex flex-col gap-1">
          <label className="text-zinc-300 text-xs font-medium" htmlFor="email">
            email address
          </label>

          <input
            className="h-10 px-3 bg-transparent border border-zinc-700 rounded outline-none text-sm focus:border-zinc-500"
            type="text"
          />
        </div>

        <div className="mt-4">
          <button className="bg-pink-500 text-sm font-semibold flex items-center justify-center gap-2 h-10 w-full rounded-md">
            <span>continue</span>
            <MoveRight />
          </button>
        </div>
      </div>
    </div>
  );
}
