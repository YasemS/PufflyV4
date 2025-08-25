type ContainerProps = React.ComponentProps<"div">;

export default function Container({ className, ...props }: ContainerProps) {
  return <div className="max-w-5xl w-full mx-auto" {...props} />;
}
