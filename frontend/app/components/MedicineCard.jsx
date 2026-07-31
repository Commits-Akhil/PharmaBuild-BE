"use client";

import useCartStore from "../Store/cart";
import { toast } from "./Toast";
import { ShoppingCart } from "lucide-react";

export default function MedicineCard({ medicine }) {
  const addToCart = useCartStore((state) => state.addToCart);

  if (!medicine) return null;

  const { name, is_prescription_required, price, image_url } = medicine;

  const handleAdd = () => {
    addToCart(medicine);
    toast(`Added "${name}" to cart!`, "success");
  };

  return (
    <div className="bg-[#141B2D] rounded-3xl overflow-hidden border border-gray-700 hover:border-emerald-500 transition hover:scale-[1.02] shadow-xl flex flex-col justify-between">
      <div>
        <div className="relative">
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url}
              alt={name}
              className="w-full h-36 object-cover"
            />
          ) : (
            <div className="w-full h-36 bg-[#1f2937] flex items-center justify-center">
              <span className="text-4xl">💊</span>
            </div>
          )}

          <span
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${
              is_prescription_required ? "bg-amber-600" : "bg-emerald-600"
            }`}
          >
            {is_prescription_required ? "Rx Required" : "OTC"}
          </span>
        </div>

        <div className="p-5">
          <p className="text-gray-400 uppercase text-xs font-semibold">
            {is_prescription_required ? "Prescription Only" : "Over The Counter"}
          </p>

          <h3 className="text-white font-bold text-lg mt-1 line-clamp-2">{name}</h3>
        </div>
      </div>

      <div className="p-5 pt-0 flex justify-between items-center mt-2">
        <div>
          {price ? (
            <span className="text-emerald-400 text-2xl font-extrabold">₹{price}</span>
          ) : (
            <span className="text-gray-400 text-xs">Price on request</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-600 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/30"
        >
          <ShoppingCart size={16} /> Add
        </button>
      </div>
    </div>
  );
}
