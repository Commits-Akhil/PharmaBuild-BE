import {Truck,ShieldCheck,Building2,Clock3,} from "lucide-react";

const features = [
  {
    icon: <Truck size={28} />,
    color: "bg-blue-600",
    title: "Fast Local Branch Delivery",
    desc: "Dispatched directly from your nearest RxConnect branch in under 30 minutes.",
  },
  {
    icon: <ShieldCheck size={28} />,
    color: "bg-green-600",
    title: "Verified Registered Pharmacists",
    desc: "Every prescription review is double checked by licensed professionals.",
  },
  {
    icon: <Building2 size={28} />,
    color: "bg-purple-600",
    title: "Multi-Branch Inventory Sync",
    desc: "Real-time stock reservation across all connected pharmacy branches.",
  },
  {
    icon: <Clock3 size={28} />,
    color: "bg-orange-500",
    title: "OTP Secured Delivery",
    desc: "End-to-end delivery verification using encrypted OTP.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto mt-20 bg-[#131c2f] rounded-3xl p-10">

      <h2 className="text-4xl font-bold text-center text-white">
        Why Patients & Doctors Trust RxConnect
      </h2>

      <p className="text-center text-gray-400 mt-2 mb-10">
        Combining multi-branch inventory speed with hospital-grade pharmaceutical standards.
      </p>

      <div className="grid md:grid-cols-4 gap-6">

        {features.map((item, index) => (

          <div
            key={index}
            className="border border-gray-700 rounded-2xl p-6 bg-[#182236] hover:border-green-500 transition hover:scale-101"
          >

            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${item.color}`}
            >
              {item.icon}
            </div>

            <h3 className="text-white font-semibold text-lg mt-5">
              {item.title}
            </h3>

            <p className="text-gray-400 mt-3">
              {item.desc}
            </p>

          </div>

        ))}

      </div>
    </section>
  );
}