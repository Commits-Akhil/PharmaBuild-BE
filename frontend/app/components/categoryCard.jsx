export default function CategoryCard({icon,title,count,color,}) {
  return (
    <div className="bg-[#141B2D] border border-gray-700 rounded-2xl p-6 hover:border-green-500 transition cursor-pointer hover:scale-105 ">

      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl ${color}`}
      >
        {icon}
      </div>

      <h3 className="text-white font-semibold mt-5 text-lg">
        {title}
      </h3>

      <p className="text-gray-400 text-sm">
        {count}
      </p>

    </div>
  );
}