import cn from "~/lib/cn";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "outline";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 h-10 px-8 border rounded text-sm text-center font-semibold",
        variant === "primary" && "bg-pink-500 border-pink-500 text-white",
        variant === "outline" && "border-zinc-700 text-zinc-200",
        className
      )}
      {...props}
    />
  );
}
