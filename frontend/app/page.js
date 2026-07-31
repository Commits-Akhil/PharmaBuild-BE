import Categories from "./components/Categories";
import PopularMedicines from "./components/PopularMedicines";
import FeaturesSection from "./components/FeaturesSection";
import BranchSection from "./components/BranchSection";
import Hero from "./components/Hero";
import Header from "./components/header";
import { MapPin } from "lucide-react";

import Footer from "./components/footer"; 


export default function Home() {
  return (<>
    <Header/>
    <div className="bg-[#0A1020] pb-5">
      <Hero />

      <Categories />

      <div className="max-w-7xl mx-auto pt-4">
        <div className="flex justify-between items-center ">

        <div>

          <h2 className="text-4xl font-bold text-white">
            Popular Medicines
          </h2>

          <p className="text-gray-400 mt-2">
            Frequently ordered medicines across RxConnect.
          </p>

        </div>

        <button className="text-green-500 hover:text-green-600 hover:scale-90 transition-transform">
          View Catalogue →
        </button>

      </div>
      </div>
      <PopularMedicines />

      <FeaturesSection />
          

         <div className="max-w-7xl mx-auto mt-20 bg-[#131c2f] rounded-3xl p-10">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-4xl font-bold text-white">
            Multi-Branch Network Availability
          </h2>

          <p className="text-gray-400">
            Select your preferred branch for express home delivery.
          </p>

        </div>

        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full flex items-center gap-2">
          <MapPin size={18} />
          Open Full Map View
        </button>

      </div>
            <BranchSection />

      </div>

    </div>
    <Footer/>
    </>
  );
}