import Link from "next/link";

export const metadata = {
  title: "404 – Page Not Found | RxConnect",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Large decorative number */}
        <div className="relative mb-8">
          <p className="text-[180px] font-extrabold leading-none bg-gradient-to-br from-green-400 to-emerald-700 bg-clip-text text-transparent select-none">
            404
          </p>
          <span className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none">
            💊
          </span>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          The prescription for this page doesn&apos;t exist. It may have been
          moved, deleted, or the URL is incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 transition text-white px-8 py-4 rounded-2xl font-semibold"
          >
            Back to Home
          </Link>
          <Link
            href="/medicines"
            className="bg-[#161F33] border border-white/10 hover:border-green-500/50 transition text-white px-8 py-4 rounded-2xl font-semibold"
          >
            Browse Medicines
          </Link>
        </div>
      </div>
    </div>
  );
}
