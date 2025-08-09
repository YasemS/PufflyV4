import cn from "~/lib/cn";

type InputControlProps = React.ComponentProps<"div">;

export default function InputControl({
  className,
  ...props
}: InputControlProps) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}
