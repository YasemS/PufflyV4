import cn from "~/lib/cn";

type LabelProps = React.ComponentProps<"label"> & {
  htmlFor: string;
};

export default function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-zinc-300 text-xs font-medium", className)}
      {...props}
    />
  );
}
