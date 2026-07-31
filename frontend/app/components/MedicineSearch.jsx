import { Search } from "lucide-react";

export default function MedicineSearch() {
  return (
    <section className="bg-gradient-to-r from-green-600 to-[#201d45] rounded-3xl p-10">
      <h1 className="text-5xl font-bold text-white">
        RxConnect Pharmacy Store
      </h1>

      <p className="text-gray-300 mt-4">
        Search authentic pharmaceutical medicines with real-time stock
        indicators across all branches.
      </p>

      <div className="mt-8 relative">
        <Search className="absolute left-6 top-5 text-gray-500" />

        <input
          type="text"
          placeholder="Search medicine name, generic salt composition..."
          className="w-full py-5 pl-16 rounded-full bg-white outline-none text-black"
        />
      </div>
    </section>
  );
}
