"use client";

export default function StatCard({ title, value, icon: Icon, color = "emerald" }) {
  const bgGradients = {
    emerald: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400",
    blue: "from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
    amber: "from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400",
    rose: "from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400",
  };

  return (
    <div className={`bg-[#161F33] rounded-[24px] sm:rounded-[28px] border border-white/10 p-4 sm:p-6 flex items-center justify-between shadow-xl relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradients[color]} rounded-full filter blur-2xl opacity-20 pointer-events-none`} />
      
      <div>
        <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-2">
          {title}
        </p>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
          {value}
        </h3>
      </div>

      {Icon && (
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${bgGradients[color]} border shadow-inner shrink-0`}>
          <Icon size={22} className="sm:w-7 sm:h-7" />
        </div>
      )}
    </div>
  );
}