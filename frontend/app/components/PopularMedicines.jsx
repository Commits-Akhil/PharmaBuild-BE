"use client";

import { useEffect } from "react";
import MedicineCard from "./MedicineCard";
import useMedicineStore from "../Store/medicine";

export default function PopularMedicines() {
  const { medicines, loading, error, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    if (medicines.length === 0) {
      fetchMedicines();
    }
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#141B2D] rounded-3xl h-64 animate-pulse border border-gray-700"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="text-red-400 text-center py-8 text-sm sm:text-base">{error}</div>
      </section>
    );
  }

  const display = medicines.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {display.map((medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} />
        ))}
      </div>
    </section>
  );
}