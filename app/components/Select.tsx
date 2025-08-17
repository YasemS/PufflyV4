import cn from "~/lib/cn";

type SelectProps = React.ComponentProps<"select">;

export default function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 px-3 appearance-none bg-transparent border border-zinc-700 rounded outline-none text-sm hover:border-zinc-600 focus:border-zinc-500",
        className,
      )}
      {...props}
    />
  );
}
