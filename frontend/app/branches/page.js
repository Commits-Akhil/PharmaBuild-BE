import BranchSection from "../components/BranchSection";
import Header from "../components/header";
import Footer from "../components/footer"

export default function BranchesPage() {
  return (<>
  <Header/>
    <div className="bg-[#0B1220] min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-green-800 via-[#103A49] to-[#17233D] rounded-3xl px-10 py-10">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-medium">

            Multi-Branch Inventory Locator
          </div>

          <h1 className="text-5xl font-bold text-white mt-6">
            RxConnect Pharmacy Branches
          </h1>

          <p className="text-gray-300 text-lg mt-4 max-w-3xl">
            Choose your primary branch to optimize delivery speed and verify
            local medicine availability.
          </p>

        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8 mt-8">

          <div className="bg-[#161F33] rounded-[28px] h-[720px] overflow-hidden">

            <div className="px-8 pt-8 pb-5 border-b border-white/5">

              <h2 className="text-sm tracking-widest text-gray-400 uppercase">
                Available Branches (4)
              </h2>

            </div>

            <div className="h-[650px] overflow-y-auto px-5 pb-6 space-y-5">

                <BranchSection/>


            </div>

          </div>

          <div className="bg-[#161F33] rounded-[28px] overflow-hidden h-[720px]">

            <iframe
              src="https://maps.google.com/maps?q=Mangaluru&t=k&z=12&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full"
              loading="lazy"
            />

          </div>

        </div>

      </div>
    </div>
    <Footer/>
    </>
  );
}