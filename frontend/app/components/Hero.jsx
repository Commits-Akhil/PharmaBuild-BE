import Image from "next/image";
import Link from "next/link";
import { Search, Pill, Upload } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
      <div className="bg-gradient-to-br from-green-600 to-[#201d45] rounded-[24px] sm:rounded-[35px] px-5 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-300/20 border border-green-500/50 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm text-blue-200">
            ✨ Multi-Branch Smart Pharmacy Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mt-6 sm:mt-8">
            Order Medicines
            <br />
            From Your
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              {" "}
              Nearest
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-green-400 bg-clip-text text-transparent">
              Pharmacy
            </span>
          </h1>

          <p className="text-gray-300 mt-4 sm:mt-8 text-sm sm:text-base lg:text-lg leading-relaxed sm:leading-8">
            Search medicines, upload prescriptions for instant pharmacist
            verification, choose nearby branch stock, and receive guaranteed
            express delivery in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-6 sm:mt-10">
            <Link href="/medicines" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 transition px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Pill size={18} />
                Order Medicines Now
              </button>
            </Link>

            <Link href="/upload_prescipt" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto justify-center border border-gray-500 hover:bg-white/10 transition px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Upload size={18} />
                Upload Prescription
              </button>
            </Link>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row bg-[#121827] rounded-2xl sm:rounded-full overflow-hidden border border-white/10 p-1.5 sm:p-0">
            <div className="flex items-center px-4 py-2 sm:py-0">
              <Search className="text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search medicine name, composition..."
                className="bg-transparent flex-1 py-2 sm:py-5 px-3 text-white text-sm outline-none placeholder:text-gray-500"
              />
            </div>

            <Link href="/medicines" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-6 sm:px-8 py-3 sm:py-5 text-white font-semibold text-sm rounded-xl sm:rounded-none">
                Search
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-4 lg:mt-0">
          <img
            src="doctor .jpeg"
            width={600}
            height={700}
            alt="Doctor"
            className="rounded-[20px] sm:rounded-[30px] object-cover w-full h-[280px] sm:h-[400px] lg:h-[520px] bg-black opacity-75"
          />
        </div>
      </div>
    </section>
  );
}

