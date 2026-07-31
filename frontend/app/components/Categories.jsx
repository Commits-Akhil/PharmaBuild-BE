import { Pill, ShieldPlus, HeartPulse, Heart, Baby } from "lucide-react";
import CategoryCard from "./categoryCard";
import Link from "next/link";

export default function Categories() {
  const categories = [
    {
      title: "Prescription",
      count: "1200+ Medicines",
      icon: <Pill size={28} />,
      color: "bg-blue-600",
    },
    {
      title: "OTC Medicines",
      count: "850+ Products",
      icon: <ShieldPlus size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Diabetes Care",
      count: "430+ Supplies",
      icon: <HeartPulse size={28} />,
      color: "bg-purple-500",
    },
    {
      title: "Wellness & Vits",
      count: "620+ Supplements",
      icon: <Heart size={28} />,
      color: "bg-orange-500",
    },
    {
      title: "Baby Care",
      count: "310+ Essentials",
      icon: <Baby size={28} />,
      color: "bg-pink-500",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Browse Health Categories
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">
            Explore authentic medicines from verified distributors.
          </p>
        </div>

        <Link href="/medicines" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((item, index) => (
          <CategoryCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}