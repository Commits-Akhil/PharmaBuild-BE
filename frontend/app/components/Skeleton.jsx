/** Reusable skeleton loader components */

export function SkeletonBox({ className = "" }) {
  return (
    <div className={`bg-[#1f2f48] animate-pulse rounded-xl ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#161F33] rounded-3xl p-6 border border-white/10">
      <SkeletonBox className="h-5 w-1/2 mb-3" />
      <SkeletonBox className="h-4 w-3/4 mb-2" />
      <SkeletonBox className="h-4 w-1/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-3">
                <SkeletonBox className="h-4 w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-white/5">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="p-3">
                  <SkeletonBox className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonMedicineGrid({ count = 8 }) {
  return (
    <div className="grid md:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#141B2D] rounded-3xl overflow-hidden border border-gray-700 animate-pulse"
        >
          <div className="w-full h-36 bg-[#1f2f48]" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-[#1f2f48] rounded w-1/2" />
            <div className="h-5 bg-[#1f2f48] rounded w-3/4" />
            <div className="h-8 bg-[#1f2f48] rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
