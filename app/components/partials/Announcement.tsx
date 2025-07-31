import { AlertCircle } from "lucide-react";

export default function Announcement() {
  return (
    <div className="flex items-center justify-center gap-1.5 relative w-full h-10 bg-zinc-800/25 border-b border-zinc-800 backdrop-blur-xl text-xs font-bold z-10">
      <AlertCircle className="w-4 h-4" />

      <p className="text-zinc-300">
        <strong className="text-white">warning:</strong> products may contain
        nicotine.
      </p>
    </div>
  );
}
