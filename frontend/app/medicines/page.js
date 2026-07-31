"use client";

import { useEffect, useState } from "react";
import MedicineCard from "../components/MedicineCard";
import Header from "../components/header";
import Footer from "../components/footer";
import useMedicineStore from "../Store/medicine";
import { SkeletonMedicineGrid } from "../components/Skeleton";
import { Search } from "lucide-react";

export default function MedicinesPage() {
  const { medicines, loading, error, fetchMedicines } = useMedicineStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All | Prescription | OTC

  useEffect(() => {
    if (medicines.length === 0) fetchMedicines();
  }, []);

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All"
        ? true
        : filter === "Prescription"
        ? m.is_prescription_required
        : !m.is_prescription_required;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <section className="bg-gradient-to-r from-emerald-800 via-[#132838] to-[#161F33] rounded-[30px] p-8 md:p-10 border border-white/10 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Medicines Catalog
            </h1>
            <p className="text-gray-300 mt-2 text-base max-w-2xl">
              Browse genuine pharmaceutical medicines available across all RxConnect partner branches.
            </p>
          </section>

          {/* Search & Filter Bar */}
          <div className="bg-[#161F33] rounded-3xl p-6 border border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicine name (e.g. Paracetamol, Amoxicillin)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-gray-700 bg-[#0D1527] pl-12 pr-4 py-3.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="flex gap-2">
              {["All", "Prescription", "OTC"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition ${
                    filter === f
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                      : "bg-[#0D1527] border border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {f === "Prescription" ? "Rx Required" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Skeleton Loaders */}
          {loading && <SkeletonMedicineGrid count={8} />}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-12 text-center text-rose-400">
              <p className="font-semibold text-lg">{error}</p>
              <button
                onClick={fetchMedicines}
                className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-xl text-xs font-bold"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty Results */}
          {!loading && !error && filtered.length === 0 && (
            <div className="bg-[#161F33] rounded-3xl p-16 text-center text-gray-400 border border-white/10">
              <span className="text-4xl mb-2 block">🔍</span>
              <p className="text-lg font-semibold text-white">No medicines match your search.</p>
              <p className="text-xs text-gray-400 mt-1">Try clearing your search query or filter options.</p>
            </div>
          )}

          {/* Medicines Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
