"use client";

import { useState } from "react";
import { Building2, Package, AlertTriangle, XCircle, Clock, ChevronDown, ChevronUp, Calendar } from "lucide-react";

export default function BranchCard({ branch, orders, onFetchTodayOrders }) {
  const [showStock, setShowStock] = useState(false);

  const stock = branch.stock || [];
  const totalMedicines = stock.length;
  const lowStock = stock.filter((m) => m.stock_status === "Low Stock").length;
  const outOfStock = stock.filter((m) => m.stock_status === "Out of Stock").length;

  const branchOrders = orders.filter((o) => o.branch_name === branch.name);
  const totalOrders = branchOrders.length;
  const pendingOrders = branchOrders.filter((o) => o.verification_status === "Pending").length;

  return (
    <div className="bg-[#161F33] rounded-[28px] border border-white/10 p-6 flex flex-col justify-between shadow-xl hover:border-emerald-500/30 transition">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{branch.name}</h3>
              <p className="text-xs text-gray-400">{branch.location}</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-[#0D1527] text-emerald-400 px-3 py-1 rounded-full border border-white/5">
            ID: #{branch.id}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-[#0D1527] p-3 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Package size={12} className="text-emerald-400" /> Total Catalog
            </p>
            <p className="text-lg font-bold text-white mt-1">{totalMedicines} Items</p>
          </div>

          <div className="bg-[#0D1527] p-3 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} className="text-yellow-400" /> Pending Review
            </p>
            <p className="text-lg font-bold text-yellow-400 mt-1">{pendingOrders} Orders</p>
          </div>

          <div className="bg-[#0D1527] p-3 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-400" /> Low Stock
            </p>
            <p className="text-lg font-bold text-amber-400 mt-1">{lowStock} Items</p>
          </div>

          <div className="bg-[#0D1527] p-3 rounded-2xl border border-white/5">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <XCircle size={12} className="text-rose-400" /> Out of Stock
            </p>
            <p className="text-lg font-bold text-rose-400 mt-1">{outOfStock} Items</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex gap-2">
          <button
            onClick={() => setShowStock(!showStock)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#24314C] hover:bg-[#2e3e5e] text-white py-2.5 rounded-xl text-xs font-semibold transition"
          >
            {showStock ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showStock ? "Hide Stock" : "Inventory Details"}
          </button>

          {onFetchTodayOrders && (
            <button
              onClick={() => onFetchTodayOrders(branch.id, branch.name)}
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Calendar size={14} /> Today&apos;s Orders
            </button>
          )}
        </div>

        {showStock && (
          <div className="mt-4 max-h-60 overflow-y-auto bg-[#0D1527] rounded-2xl border border-white/5 p-3">
            <table className="w-full text-left text-xs text-gray-300">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-2">Medicine</th>
                  <th className="pb-2 text-center">Stock</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.medicine_id} className="border-b border-white/5">
                    <td className="py-2 font-medium text-white">{item.medicine_name}</td>
                    <td className="py-2 text-center">{item.quantity_available}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          item.stock_status === "In Stock"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : item.stock_status === "Low Stock"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {item.stock_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}