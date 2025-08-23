export default function ProgressBar({ width }: ProgressBarProps) {
  return (
    <div className="w-full h-4 rounded-full bg-zinc-800/50 border border-zinc-800 backdrop-blur">
      <div className="w-0 h-full bg-pink-500 rounded-full" style={{ width }}></div>
    </div>
  );
}

type ProgressBarProps = {
  width: string;
};
