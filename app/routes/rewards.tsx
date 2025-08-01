import { Badge, Globe, Lock, MoveRight, ShoppingBag } from "lucide-react";
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

      <RewardsItems />

      <RewardsEarn />
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
  const [authed, setAuthed] = useState(false);

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

function RewardsItem() {
  return (
    <div className="min-w-1/2 p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg">
      <img
        src="https://cdn.puffly.io/img/products/geek-bar-pulse/blue-razz-ice.png"
        alt=""
      />

      <p className="mt-3 pt-2 border-t border-zinc-700 text-sm text-center font-semibold leading-5">
        geek bar pulse
      </p>

      <p className="text-zinc-300 text-xs text-center leading-3">
        1,000 points
      </p>
    </div>
  );
}

function RewardsItemScroller() {
  const [showStartGradient, setShowStartGradient] = useState(false);
  const [showEndGradient, setShowEndGradient] = useState(false);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const scrolled = e.currentTarget.scrollLeft;
    const maxScroll = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;

    setShowStartGradient(scrolled > 0);
    setShowEndGradient(scrolled < maxScroll - 1); // -1 to avoid showing gradient when at the end
  }

  return (
    <div className="relative mt-4">
      <div className="flex gap-2 overflow-auto no-scroll" onScroll={onScroll}>
        <RewardsItem />

        <RewardsItem />

        <RewardsItem />

        <RewardsItem />
      </div>

      {showStartGradient && (
        <div className="absolute top-0 left-0 h-full w-1/8 bg-gradient-to-r from-zinc-950 to-transparent"></div>
      )}

      {showEndGradient && (
        <div className="absolute top-0 right-0 h-full w-1/8 bg-gradient-to-l from-zinc-950 to-transparent"></div>
      )}
    </div>
  );
}

function RewardsItems() {
  return (
    <div className="mt-12">
      <H2>reward items</H2>

      <RewardsItemScroller />
    </div>
  );
}

function RewardsEarn() {
  return (
    <div className="relative mt-12">
      <H2>ways to earn</H2>

      <div className="grid grid-cols-1 gap-2 relative mt-4 z-1">
        <RewardsEarnCard
          icon={<Globe />}
          title="refer friends"
          description="earn points for every dollar spend by friends you refer."
        />

        <RewardsEarnCard
          icon={<ShoppingBag />}
          title="place an order"
          description="gain points for every dollar spent on products you purchase."
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-pink-500 to-purple-500 blur-3xl opacity-20 rounded-bl-full"></div>
    </div>
  );
}

type RewardsEarnCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function RewardsEarnCard({ title, description, icon }: RewardsEarnCardProps) {
  return (
    <div className="flex flex-col relative w-full p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="flex items-center w-5 h-5 text-pink-500">{icon}</div>

        <H3 className="text-base leading-4">{title}</H3>
      </div>

      <p className="mt-2 pt-2 border-t border-zinc-700 text-zinc-300 text-xs font-medium leading-4">
        {description}
      </p>
    </div>
  );
}
