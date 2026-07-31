import { Truck, ShieldCheck, Building2, Clock3 } from "lucide-react";

const features = [
  {
    icon: <Truck size={26} />,
    color: "bg-blue-600",
    title: "Fast Local Branch Delivery",
    desc: "Dispatched directly from your nearest RxConnect branch in under 30 minutes.",
  },
  {
    icon: <ShieldCheck size={26} />,
    color: "bg-green-600",
    title: "Verified Registered Pharmacists",
    desc: "Every prescription review is double checked by licensed professionals.",
  },
  {
    icon: <Building2 size={26} />,
    color: "bg-purple-600",
    title: "Multi-Branch Inventory Sync",
    desc: "Real-time stock reservation across all connected pharmacy branches.",
  },
  {
    icon: <Clock3 size={26} />,
    color: "bg-orange-500",
    title: "OTP Secured Delivery",
    desc: "End-to-end delivery verification using encrypted OTP.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-16">
      <div className="bg-[#131c2f] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/5">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white">
          Why Patients & Doctors Trust RxConnect
        </h2>

        <p className="text-center text-gray-400 mt-2 mb-8 text-sm sm:text-base max-w-2xl mx-auto">
          Combining multi-branch inventory speed with hospital-grade pharmaceutical standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="border border-gray-700/70 rounded-2xl p-5 sm:p-6 bg-[#182236] hover:border-green-500 transition"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white ${item.color}`}
              >
                {item.icon}
              </div>

              <h3 className="text-white font-semibold text-base sm:text-lg mt-4 sm:mt-5">
                {item.title}
              </h3>

              <p className="text-gray-400 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}