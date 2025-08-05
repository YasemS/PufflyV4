import cn from "~/lib/cn";

type BackgroundGradientProps = React.ComponentProps<"div"> & {
  gradientClassName?: string;
};

export default function BackgroundGradient({
  className,
  children,
  gradientClassName,
  ...props
}: BackgroundGradientProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="relative z-1">{children}</div>

      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-1/2 w-full h-full bg-gradient-to-b from-pink-500 to-purple-500 blur-3xl opacity-20 z-0",
          gradientClassName
        )}
      ></div>
    </div>
  );
}
