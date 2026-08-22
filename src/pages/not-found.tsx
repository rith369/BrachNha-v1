import { Link } from "react-router";

/**
 * Next served its own 404. With a client-side router the catch-all is ours, and
 * it matters more than it looks: the drawer lists features that aren't built
 * yet, so a student can reach an unknown path from inside the app.
 */
export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-4xl">🧭</div>
      <div className="font-heading text-lg font-extrabold">
        This page isn&apos;t here
      </div>
      <p className="text-sm text-muted">
        It may not be built yet. Let&apos;s get you back on track.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-purple px-5 py-2 text-sm font-bold text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}
