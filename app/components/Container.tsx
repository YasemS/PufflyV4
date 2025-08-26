import cn from "~/lib/cn";

type ContainerProps = React.ComponentProps<"div">;

export default function Container({ className, ...props }: ContainerProps) {
  return <div className={cn("max-w-5xl w-full mx-auto", className)} {...props} />;
}
