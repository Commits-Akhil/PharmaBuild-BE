import { Clock3, Check, Truck } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

const trackingSteps = [
  {
    title: "Prescription Uploaded",
    status: "Completed",
    desc: "Your prescription has been uploaded successfully.",
    done: true,
  },
  {
    title: "Waiting for Pharmacist Verification",
    status: "Completed",
    desc: "Our pharmacist has received your prescription and is reviewing it.",
    done: true,
  },
  {
    title: "Prescription Approved",
    status: "Completed",
    desc: "Prescription verified successfully. Your order has been approved.",
    done: true,
  },

  // If rejected, replace the above object with the one below:
  // {
  //   title: "Prescription Rejected",
  //   status: "Rejected",
  //   desc: "Reason: Prescription image is blurred. Please upload a clear prescription.",
  //   done: false,
  // },

  {
    title: "Order Placed",
    status: "Completed",
    desc: "Your medicines have been reserved successfully.",
    done: true,
  },
  {
    title: "Packed",
    status: "Completed",
    desc: "Your medicines have been packed and are ready for dispatch.",
    done: true,
  },
  {
    title: "Out For Delivery",
    status: "Current",
    desc: "Delivery partner is on the way to your location.",
    done: true,
  },
  {
    title: "Delivered",
    status: "Pending",
    desc: "Waiting for delivery confirmation.",
    done: false,
  },
];

function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-700  to-[#1B2342] rounded-[32px] p-10">
      <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-5 py-2 text-emerald-300">
        <Truck size={18} />
        Express Chain Delivery
      </div>

      <h1 className="text-white text-5xl font-bold mt-6">
        Order Live Tracking #RX-99412
      </h1>
    </section>
  );
}

function Timeline() {
  return (
    <div className="bg-[#161F33] rounded-[30px] p-8">
      <div className="flex items-center gap-3 mb-10">
        <Clock3 className="text-blue-500" />

        <h2 className="text-3xl font-semibold text-white">
          Live Delivery Progress
        </h2>
      </div>

      <div className="space-y-8">
        {trackingSteps.map((step, index) => (
          <div key={index} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.done
                    ? "bg-emerald-500"
                    : step.status === "Rejected"
                      ? "bg-red-600"
                      : "bg-[#263149]"
                }`}
              >
                {step.done ? (
                  <Check size={16} className="text-white" />
                ) : step.status === "Rejected" ? (
                  <span className="text-white text-sm">✕</span>
                ) : (
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                )}
              </div>

              {index !== trackingSteps.length - 1 && (
                <div className="w-[2px] h-12 bg-[#2E3958]" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-white text-xl font-semibold">
                  {step.title}
                </h3>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    step.status === "Completed"
                      ? "bg-green-600 text-white"
                      : step.status === "Current"
                        ? "bg-blue-600 text-white"
                        : step.status === "Pending"
                          ? "bg-gray-600 text-white"
                          : "bg-red-600 text-white"
                  }`}
                >
                  {step.status}
                </span>
              </div>

              <p className="text-gray-400 mt-2">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteCard() {
  return (
    <div className="bg-[#161F33] rounded-[30px] h-[340px] border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <Truck size={50} className="mx-auto text-emerald-400" />

        <h2 className="text-white text-3xl font-semibold mt-8">
          Live Delivery Route Active
        </h2>
      </div>
    </div>
  );
}
function DriverCard() {
  return (
    <div className="bg-[#161F33] rounded-[30px] border border-blue-600 p-7">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl">
            👤
          </div>

          <div>
            <h2 className="text-white text-2xl font-semibold">
              Michael Miller
            </h2>
          </div>
        </div>

        <div className="border border-blue-600 rounded-3xl px-8 py-5 text-center">
          <p className="text-gray-400 text-sm">DELIVERY OTP</p>

          <h2 className="text-blue-500 text-4xl font-bold mt-2">4829</h2>
        </div>
      </div>

      <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 transition py-4 rounded-full text-white font-semibold">
        📞 Call
      </button>
    </div>
  );
}

function OrderActions() {
  return (
    <div className="bg-[#161F33] rounded-[30px] p-8 border border-white/10">
      <h2 className="text-gray-400 uppercase tracking-widest mb-8">
        Order Actions
      </h2>

      <button className="w-full mt-5 bg-red-200 text-red-600 rounded-full py-4 font-semibold">
        Cancel Order
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Hero />

          <div className="grid lg:grid-cols-[1.35fr_0.95fr] gap-8 mt-10">
            <div className="space-y-8">
              <Timeline />

              <DriverCard />
            </div>

            <div className="space-y-8">
              <RouteCard />

              <OrderActions />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
