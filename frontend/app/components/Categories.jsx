import {  Pill,  ShieldPlus,  HeartPulse,  Heart,  Baby,} from "lucide-react";

import CategoryCard from "./categoryCard";

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
    <section className="max-w-7xl mx-auto py-16">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-4xl font-bold text-white">
            Browse Health Categories
          </h2>

          <p className="text-gray-400 mt-2">
            Explore authentic medicines from verified distributors.
          </p>

        </div>

        <button className="text-green-500 hover:text-green-600 transition-transform hover:scale-90">
          View All →
        </button>

      </div>

      <div className="grid md:grid-cols-5 gap-6">

        {categories.map((item, index) => (
          <CategoryCard key={index} {...item} />
        ))}

      </div>

    </section>
  );
}