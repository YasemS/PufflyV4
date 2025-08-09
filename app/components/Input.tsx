import cn from "~/lib/cn";

type InputProps = React.ComponentProps<"input">;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 px-3 bg-transparent border border-zinc-700 rounded outline-none text-sm hover:border-zinc-600 focus:border-zinc-500",
        className
      )}
      {...props}
    />
  );
}
