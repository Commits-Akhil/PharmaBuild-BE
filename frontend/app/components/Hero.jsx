import Image from "next/image";
import { Search, Pill, Upload, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto mt-10">
      <div className="bg-gradient-to-br from-green-600 to-[#201d45] rounded-[35px] px-16 py-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-300/20 border border-green-500 px-5 py-2 rounded-full text-sm text-blue-200">
            ✨ Multi-Branch Smart Pharmacy Platform
          </div>

          <h1 className="text-6xl font-bold text-white leading-tight mt-8">
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

          <p className="text-gray-300 mt-8 text-lg leading-9">
            Search medicines, upload prescriptions for instant pharmacist
            verification, choose nearby branch stock, and receive guaranteed
            express delivery in minutes.
          </p>

          <div className="flex gap-5 mt-10">
            <button className="bg-blue-600 hover:bg-blue-700 transition px-8 py-4 rounded-full text-white font-semibold flex items-center gap-2">
              <Pill size={20} />
              Order Medicines Now
            </button>

            <button className="border border-gray-500 hover:bg-white/10 transition px-8 py-4 rounded-full text-white font-semibold flex items-center gap-2">
              <Upload size={20} />
              Upload Prescription
            </button>
          </div>

          <div className="mt-12 flex bg-[#121827] rounded-full overflow-hidden">
            <div className="flex items-center px-6">
              <Search className="text-gray-400" />
            </div>

            <input
              type="text"
              placeholder="Search medicine name, salt composition..."
              className="bg-transparent flex-1 py-5 text-white outline-none placeholder:text-gray-500"
            />

            <button className="bg-green-600 hover:bg-green-700 px-8 text-white font-semibold">
              Search
            </button>
          </div>
        </div>

        <div className="">
          <img
            // src="https://img.magnific.com/premium-vector/cute-cartoon-character-pills-healthcare-medicine-funny-tablets-with-smiley-face_41422-733.jpg"
            src="doctor .jpeg"
            width={600}
            height={700}
            alt="Doctor"
            className="rounded-[30px] object-cover w-full h-[520px] bg-black opacity-65"
          />
        </div>
      </div>
    </section>
  );
}
