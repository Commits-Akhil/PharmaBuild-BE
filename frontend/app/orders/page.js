"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../lib/api";
import { useRouter } from "next/navigation";

function StatusBadge({ status }) {
  const colours = {
    Placed: "bg-blue-700",
    Verified: "bg-indigo-700",
    Packed: "bg-purple-700",
    "Out for Delivery": "bg-yellow-600",
    Delivered: "bg-green-700",
    Rejected: "bg-red-600",
    Cancelled: "bg-gray-600",
  };
  return (
    <span
      className={`text-white text-xs px-3 py-1 rounded-full ${colours[status] ?? "bg-gray-600"}`}
    >
      {status}
    </span>
  );
}

function OrderCard({ order }) {
  const router = useRouter();
  return (
    <div className="bg-[#161F33] rounded-[28px] border border-white/10 p-7 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">
            Order #{order.order_id}
          </h2>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-gray-400 mt-3">
          {new Date(order.created_at).toLocaleString()} • Branch:
          <span className="text-white font-medium"> {order.branch_name}</span>
        </p>

        {order.status === "Rejected" && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400 font-semibold">Rejected by Pharmacist</p>
          </div>
        )}

        {order.requires_prescription && (
          <p className="text-yellow-400 text-sm mt-2">
            Prescription required
          </p>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={() => router.push(`/orders/${order.order_id}`)}
          className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center hover:border-green-500 transition"
        >
          <Eye className="text-white" size={18} />
        </button>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/customer/orders");
        // Backend returns { success: true, orders: [...] }
        const data = res.data.orders ?? res.data.data?.orders ?? [];
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = String(o.order_id).includes(search) ||
      o.branch_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ? true : o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["All", "Placed", "Verified", "Packed", "Out for Delivery", "Delivered", "Rejected"];

  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen px-6 py-10">
        <div className="max-w-7xl mx-auto">

          <section className="bg-gradient-to-r from-green-700 to-[#1A2341] rounded-[32px] px-10 py-10">
            <h1 className="text-5xl font-bold text-white">
              Order History &amp; Reorders
            </h1>
            <p className="text-gray-300 mt-4 text-lg">
              View past medicine deliveries and track current orders.
            </p>
          </section>

          {/* Search + Filter */}
          <div className="bg-[#161F33] rounded-[28px] px-6 py-5 mt-8 border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="relative w-full lg:w-[360px]">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  placeholder="Search order ID or branch…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#24314C] rounded-full py-3 pl-12 pr-4 outline-none text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-300">Status:</span>
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      statusFilter === s
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading && (
            <div className="text-gray-400 text-center py-20">Loading orders…</div>
          )}

          {error && (
            <div className="text-red-400 text-center py-20">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-gray-400 text-center py-20">No orders found.</div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="mt-10 space-y-6">
              {filtered.map((order) => (
                <OrderCard key={order.order_id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
