const categories = [
  "All",
  "Prescription",
  "OTC",
  "Wellness",
  "Baby Care",
  "Personal Care",
  "Diabetes",
];

export default function CategoryFilter() {
  return (
    <div className="flex flex-wrap gap-4">
      {categories.map((item, index) => (
        <button
          key={index}
          className={`px-6 py-3 rounded-full transition ${
            index === 0
              ? "bg-green-500 text-white"
              : "bg-[#263149] text-gray-300 hover:bg-green-800"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
