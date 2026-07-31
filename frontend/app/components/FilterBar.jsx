import CategoryFilter from "./CategoryFilter"

export default function FilterBar() {
  return (
    <div className="bg-[#151D30] rounded-3xl p-8 mt-8">
      <CategoryFilter />

      <hr className="border-gray-700 my-8" />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <span className="text-gray-400">Filter Type:</span>

          <button className="bg-white text-black px-4 py-2 rounded-xl">
            All
          </button>

          <button className="text-gray-300">OTC</button>

          <button className="text-gray-300">Prescription</button>
        </div>

        <div className="flex items-center gap-8">


          <span className="text-gray-400">Showing 7 items</span>
        </div>
      </div>
    </div>
  );
}
