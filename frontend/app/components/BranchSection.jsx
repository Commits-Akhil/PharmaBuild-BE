"use client";

import { useEffect, useState } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import api from "../lib/api";

/**
 * BranchSection component
 * Displays pharmacy branches fetched dynamically from backend.
 * Supports singleColumn layout mode for narrow sidebar containers.
 */
export default function BranchSection({ singleColumn = false }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      setError("");
      try {
        // Fetch medicines to retrieve a valid medicine ID
        const medRes = await api.get("/medicines");
        const medicinesList = medRes.data.medicines ?? medRes.data.data?.medicines ?? [];

        if (medicinesList.length > 0) {
          // Query stock check to fetch available branches directly from PostgreSQL
          const stockRes = await api.post("/orders/check-stock", {
            medicines: [{ medicineId: medicinesList[0].id, quantity: 1 }],
          });

          setBranches(stockRes.data.availableBranches ?? []);
        }
      } catch (err) {
        console.error("[BranchSection] Fetch Error:", err);
        setError("Unable to load pharmacy branches from server.");
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, []);

  // Grid layout class based on container context
  const gridClass = singleColumn
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // Loading state skeleton
  if (loading) {
    return (
      <div className={gridClass}>
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            className="bg-[#182236] border border-gray-700/60 rounded-2xl p-5 animate-pulse h-40"
          />
        ))}
      </div>
    );
  }

  // Error state banner
  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-center text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  // Empty state card
  if (branches.length === 0) {
    return (
      <div className="bg-[#182236] border border-gray-700 rounded-2xl p-6 text-center text-gray-400 text-sm">
        No active pharmacy branches currently available.
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {branches.map((branch, index) => {
        const id = branch.branchId || branch.id || index + 1;
        const name = branch.branchName || branch.name || `RxConnect Branch #${id}`;
        const location = branch.location || branch.address || "Express Delivery Center";

        return (
          <div
            key={id}
            className="bg-[#182236] border border-gray-700/80 rounded-2xl p-4 sm:p-5 hover:border-emerald-500 transition flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base leading-snug break-words">
                  {name}
                </h3>
                <span className="bg-emerald-600 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs text-white shrink-0 font-mono font-medium whitespace-nowrap">
                  Branch #{id}
                </span>
              </div>

              <p className="text-gray-400 mt-2 text-xs flex items-center gap-1.5 leading-tight">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            </div>

            <div>
              <hr className="border-gray-700/80 my-3.5 sm:my-4" />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-emerald-400 font-medium text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={12} /> Active Branch
                </span>
                <span className="text-blue-400 font-medium text-[11px] shrink-0">
                  Express Delivery
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}