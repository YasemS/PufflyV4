import { Link } from "react-router";

export default function Nav() {
  return (
    <nav className="flex items-center justify-center sticky top-0 left-0 w-full h-16 bg-zinc-950 border-b border-zinc-800 z-10">
      <Link className="font-bold leading-9 text-4xl pb-2" to="/">
        <p className="inline">puff</p>
        <p className="inline text-pink-500">ly</p>
      </Link>
    </nav>
  );
}
