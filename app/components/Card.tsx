import cn from "~/lib/cn";

export type CardProps = React.ComponentProps<"div">;

export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "w-full p-3 bg-zinc-800/50 border border-zinc-800 backdrop-blur-xl rounded-lg",
        className
      )}
      {...props}
    />
  );
}
