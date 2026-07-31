import Categories from "./components/Categories";
import PopularMedicines from "./components/PopularMedicines";
import FeaturesSection from "./components/FeaturesSection";
import BranchSection from "./components/BranchSection";
import Hero from "./components/Hero";
import Header from "./components/header";
import Footer from "./components/footer";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <div className="bg-[#0A1020] pb-10">
        <Hero />

        <Categories />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Popular Medicines
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">
                Frequently ordered medicines across RxConnect.
              </p>
            </div>

            <Link
              href="/medicines"
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm"
            >
              View Catalogue →
            </Link>
          </div>
        </div>

        <PopularMedicines />

        <FeaturesSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-16">
          <div className="bg-[#131c2f] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Multi-Branch Network Availability
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">
                  Select your preferred branch for express home delivery.
                </p>
              </div>

              <Link href="/branches">
                <button className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 text-xs sm:text-sm font-semibold transition shadow-md shadow-green-900/30">
                  <MapPin size={16} />
                  Open Full Map View
                </button>
              </Link>
            </div>
            <BranchSection />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}