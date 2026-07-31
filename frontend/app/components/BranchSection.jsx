import { Star, MapPin } from "lucide-react";

const branches = [
  {
    name: "RxConnect Central - Healthcare Hub",
    address: "742 Park Avenue, Sector 18",
    rating: "4.9",
    reviews: "342",
    eta: "20 min ETA",
    distance: "1.2 km away",
  },
  {
    name: "RxConnect Westside Pharmacy",
    address: "108 West Blvd, Suite 4A",
    rating: "4.7",
    reviews: "189",
    eta: "35 min ETA",
    distance: "3.5 km away",
  },
  {
    name: "RxConnect North Care Express",
    address: "55 North Ridge Road",
    rating: "4.8",
    reviews: "215",
    eta: "45 min ETA",
    distance: "5.1 km away",
  },
];

export default function BranchSection() {
  return (
    
      <div className="flex flex-wrap gap-6 ">

        {branches.map((branch, index) => (

          <div
            key={index}
            className="bg-[#182236] border w-sm border-gray-700 rounded-2xl p-6 hover:border-green-500 transition"
          >

            <div className="flex justify-between">

              <h3 className="font-semibold text-white">
                {branch.name}
              </h3>

              <span className="bg-green-600 px-3 py-1 rounded-full text-xs text-white">
                {branch.eta}
              </span>

            </div>

            <p className="text-gray-400 mt-3">
              {branch.address}
            </p>

            <hr className="border-gray-700 my-5" />

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-2">

                <Star
                  size={16}
                  className="text-yellow-400 fill-yellow-400"
                />

                <span className="text-white">
                  {branch.rating}
                </span>

                <span className="text-gray-400">
                  ({branch.reviews})
                </span>

              </div>

              <span className="text-blue-400">
                {branch.distance}
              </span>

            </div>

          </div>

        ))}

      </div>
  );
}