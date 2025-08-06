import { useState } from "react";

import cn from "~/lib/cn";

type ScrollerProps = React.ComponentProps<"div">;

export default function Scroller({
  className,
  children,
  ...props
}: ScrollerProps) {
  const [showStartGradient, setShowStartGradient] = useState(false);
  const [showEndGradient, setShowEndGradient] = useState(true);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const scrolled = e.currentTarget.scrollLeft;
    const maxScroll = e.currentTarget.scrollWidth - e.currentTarget.clientWidth;

    setShowStartGradient(scrolled > 0);
    setShowEndGradient(scrolled < maxScroll - 1); // -1 to avoid showing gradient when at the end
  }

  return (
    <div className={cn("relative", className)} {...props}>
      <div className="overflow-auto no-scroll" onScroll={onScroll}>
        {children}
      </div>

      {showStartGradient && (
        <div className="absolute top-0 left-0 h-full w-1/10 bg-gradient-to-r from-zinc-950 to-transparent"></div>
      )}

      {showEndGradient && (
        <div className="absolute top-0 right-0 h-full w-1/10 bg-gradient-to-l from-zinc-950 to-transparent"></div>
      )}
    </div>
  );
}
