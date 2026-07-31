"use client";

import { Eye, FileText } from "lucide-react";

export default function OrdersTable({ orders, fetchFailed }) {
  if (fetchFailed) {
    return (
      <div className="bg-[#161F33] rounded-[28px] border border-red-500/30 p-6 text-center text-red-400">
        Failed to fetch global orders. Please ensure you are logged in as Admin.
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => b.order_id - a.order_id);

  return (
    <div className="bg-[#161F33] rounded-[28px] border border-white/10 p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-emerald-400" size={24} /> System Orders
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Global real-time listing of customer orders across all branches.
          </p>
        </div>
        <span className="bg-[#0D1527] text-emerald-400 text-xs px-4 py-1.5 rounded-full border border-white/5 font-mono">
          Total: {orders.length} Orders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-3 px-3">Order ID</th>
              <th className="pb-3 px-3">Customer</th>
              <th className="pb-3 px-3">Branch</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Rx Review</th>
              <th className="pb-3 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No orders recorded in system yet.
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order.order_id} className="border-b border-white/5 hover:bg-[#1f2d47]/50 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">#{order.order_id}</td>
                  <td className="py-3.5 px-3 font-medium text-white">{order.customer_name || "Customer"}</td>
                  <td className="py-3.5 px-3 text-gray-300">{order.branch_name || "Branch"}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : order.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    {order.requires_prescription ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.verification_status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : order.verification_status === "Rejected"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {order.verification_status || "Pending"}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Not Required</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
