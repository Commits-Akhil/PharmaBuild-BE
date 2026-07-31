"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  Users,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Calendar,
  X,
  Package,
} from "lucide-react";
import api, { clearAuth } from "../lib/api";
import StatCard from "../adminComponents/statcard";
import BranchCard from "../adminComponents/branchcard";
import OrdersTable from "../adminComponents/ordertable";
import UsersTable from "../adminComponents/usertable";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast } from "../components/Toast";
import { SkeletonCard, SkeletonTable } from "../components/Skeleton";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview"); // overview | lowStock | failures
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [lowStockData, setLowStockData] = useState(null);
  const [failureData, setFailureData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal for today's orders by branch
  const [selectedBranchToday, setSelectedBranchToday] = useState(null);
  const [todayOrdersModal, setTodayOrdersModal] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);

  const fetchCoreData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [branchRes, orderRes, userRes] = await Promise.all([
        api.get("/admin/branches"),
        api.get("/admin/orders"),
        api.get("/admin/users"),
      ]);

      setBranches(branchRes.data.branches ?? branchRes.data.data?.branches ?? []);
      setOrders(orderRes.data.orders ?? orderRes.data.data?.orders ?? []);
      setUsers(userRes.data.users ?? userRes.data.data?.users ?? []);
      setFetchFailed(false);
    } catch (err) {
      console.error("[Admin] fetchCoreData error:", err.message);
      const msg = err.response?.data?.message || "Failed to load admin data.";
      setErrorMsg(msg);
      setFetchFailed(true);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockReport = async () => {
    try {
      const res = await api.get("/admin/branches/low-stock");
      setLowStockData(res.data.data ?? res.data);
    } catch (err) {
      toast("Failed to load low stock report.", "error");
    }
  };

  const fetchFulfillmentFailures = async () => {
    try {
      const res = await api.get("/admin/branches/fulfillment-failures");
      setFailureData(res.data.data ?? res.data);
    } catch (err) {
      toast("Failed to load fulfillment failure metrics.", "error");
    }
  };

  const handleFetchTodayOrders = async (branchId, branchName) => {
    setTodayLoading(true);
    setSelectedBranchToday({ id: branchId, name: branchName });
    try {
      const res = await api.get(`/admin/branches/${branchId}/today-orders`);
      setTodayOrdersModal(res.data.data ?? res.data);
    } catch (err) {
      toast("Failed to load today's orders for branch.", "error");
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  useEffect(() => {
    if (activeTab === "lowStock" && !lowStockData) {
      fetchLowStockReport();
    } else if (activeTab === "failures" && !failureData) {
      fetchFulfillmentFailures();
    }
  }, [activeTab]);

  const handleLogout = () => {
    clearAuth();
    toast("Logged out successfully.", "warning");
    router.push("/Login");
  };

  const pendingVerification = orders.filter((o) => o.verification_status === "Pending").length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B1220] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Banner */}
          <section className="bg-gradient-to-r from-emerald-900 via-[#13253B] to-[#161F33] rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 mb-6 sm:mb-10 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
                <ShieldCheck size={14} /> Executive Admin Console
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Network & Analytics Dashboard
              </h1>
              <p className="text-gray-300 mt-2 text-xs sm:text-base">
                Real-time multi-branch stock monitoring, global orders, and system health metrics.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={fetchCoreData}
                disabled={loading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#24314C] hover:bg-[#2e3e5e] transition text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm border border-white/10"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 transition text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm shadow-lg shadow-rose-900/30"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "bg-[#161F33] text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <Building2 size={16} /> Network Overview
            </button>

            <button
              onClick={() => setActiveTab("lowStock")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                activeTab === "lowStock"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40"
                  : "bg-[#161F33] text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <AlertTriangle size={16} /> Low Stock Audit
            </button>

            <button
              onClick={() => setActiveTab("failures")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
                activeTab === "failures"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                  : "bg-[#161F33] text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <TrendingDown size={16} /> Fulfillment Failure Analytics
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
                <StatCard title="Active Branches" value={branches.length} icon={Building2} color="emerald" />
                <StatCard title="Total System Orders" value={orders.length} icon={FileText} color="blue" />
                <StatCard title="Registered Accounts" value={users.length} icon={Users} color="purple" />
                <StatCard title="Pending Rx Reviews" value={pendingVerification} icon={AlertTriangle} color="amber" />
              </div>

              {/* Error Message Banner */}
              {fetchFailed && (
                <div className="mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-xs sm:text-sm font-medium">
                  {errorMsg || "Failed to fetch admin data. Make sure you are logged in as admin."}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              )}

              {/* Branches Section */}
              {!loading && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <Building2 className="text-emerald-400" size={22} /> Branch Inventory Status
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {branches.map((branch) => (
                      <BranchCard
                        key={branch.id}
                        branch={branch}
                        orders={orders}
                        onFetchTodayOrders={handleFetchTodayOrders}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Table */}
              {!loading && (
                <div className="mb-8 sm:mb-12">
                  <OrdersTable orders={orders} fetchFailed={fetchFailed} />
                </div>
              )}

              {/* Users Table */}
              {!loading && (
                <div className="mb-8 sm:mb-12">
                  <UsersTable users={users} fetchFailed={fetchFailed} />
                </div>
              )}
            </>
          )}

          {/* TAB 2: LOW STOCK REPORT */}
          {activeTab === "lowStock" && (
            <div className="bg-[#161F33] rounded-[24px] sm:rounded-[28px] border border-white/10 p-5 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="text-amber-400" size={22} /> Low Stock Inventory Audit Report
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Items across branches where available stock is below or equal to safety thresholds.
                  </p>
                </div>
                {lowStockData && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold font-mono shrink-0">
                    Critical Count: {lowStockData.total_low_stock_items ?? 0} Items
                  </span>
                )}
              </div>

              {!lowStockData ? (
                <SkeletonTable rows={4} cols={4} />
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {(lowStockData.branches || []).map((b) => (
                    <div key={b.branch_id} className="bg-[#0D1527] p-4 sm:p-6 rounded-2xl border border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-white/10 pb-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white">{b.branch_name}</h3>
                          <p className="text-xs text-gray-400">{b.branch_location}</p>
                        </div>
                        <span className="self-start sm:self-auto text-[11px] sm:text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                          {b.low_stock_items?.length || 0} Low Stock Alerts
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                          <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-white/10">
                              <th className="pb-2 pr-4">Medicine</th>
                              <th className="pb-2 px-3">Rx Required?</th>
                              <th className="pb-2 px-3">Available</th>
                              <th className="pb-2 px-3">Threshold</th>
                              <th className="pb-2 pl-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(b.low_stock_items || []).map((item) => (
                              <tr key={item.medicine_id} className="border-b border-white/5">
                                <td className="py-2.5 pr-4 font-semibold text-white">{item.medicine_name}</td>
                                <td className="py-2.5 px-3 text-xs text-gray-400">
                                  {item.is_prescription_required ? "Yes (Rx)" : "No (OTC)"}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-amber-400 font-bold whitespace-nowrap">
                                  {item.quantity_available} units
                                </td>
                                <td className="py-2.5 px-3 font-mono text-gray-400 whitespace-nowrap">
                                  {item.low_stock_threshold} units
                                </td>
                                <td className="py-2.5 pl-3">
                                  <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                                    {item.stock_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FULFILLMENT FAILURE METRICS */}
          {activeTab === "failures" && (
            <div className="bg-[#161F33] rounded-[24px] sm:rounded-[28px] border border-white/10 p-5 sm:p-8 shadow-xl">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingDown className="text-rose-400" size={22} /> Branch Fulfillment Failure Analytics
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Analysis of order rejection rates, stock-out incidents, and delivery failures per branch.
                </p>
              </div>

              {!failureData ? (
                <SkeletonTable rows={3} cols={6} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 px-3">Branch</th>
                        <th className="pb-3 px-3">Total Orders</th>
                        <th className="pb-3 px-3">Failed / Rejected</th>
                        <th className="pb-3 px-3">Failure Rate</th>
                        <th className="pb-3 px-3">Stock Outs</th>
                        <th className="pb-3 px-3">Low Stock Warnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(failureData.failing_branches_summary || []).map((fb) => (
                        <tr key={fb.branch_id} className="border-b border-white/5 hover:bg-[#1f2d47]/50 transition">
                          <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                            {fb.branch_name}
                            <span className="block text-[11px] text-gray-400 font-normal">{fb.branch_location}</span>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-white">{fb.total_orders}</td>
                          <td className="py-3.5 px-3 font-mono text-rose-400 font-bold">{fb.failed_orders}</td>
                          <td className="py-3.5 px-3">
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono whitespace-nowrap">
                              {fb.failure_rate_percentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-rose-400">{fb.out_of_stock_count}</td>
                          <td className="py-3.5 px-3 font-mono text-amber-400">{fb.low_stock_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S ORDERS MODAL */}
      {selectedBranchToday && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#161F33] rounded-[24px] sm:rounded-[30px] border border-white/20 p-5 sm:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => {
                setSelectedBranchToday(null);
                setTodayOrdersModal(null);
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white bg-black/40 p-2 rounded-full z-10"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-2 pr-8">
              <Calendar className="text-emerald-400 shrink-0" size={20} /> Today&apos;s Orders — {selectedBranchToday.name}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Orders placed today for target branch location.
            </p>

            {todayLoading ? (
              <SkeletonTable rows={3} cols={4} />
            ) : !todayOrdersModal || (todayOrdersModal.orders || []).length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 bg-[#0D1527] rounded-2xl text-xs sm:text-sm">
                No orders received today for this branch yet.
              </div>
            ) : (
              <div className="space-y-4">
                {(todayOrdersModal.orders || []).map((o) => (
                  <div key={o.order_id} className="bg-[#0D1527] p-4 sm:p-5 rounded-2xl border border-white/5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400">Order #{o.order_id}</span>
                        <h4 className="text-base sm:text-lg font-bold text-white">{o.customer_name}</h4>
                        <p className="text-xs text-gray-400">{o.customer_email} • {o.customer_phone || "No phone"}</p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {o.status}
                      </span>
                    </div>

                    {/* Line Items */}
                    <div className="border-t border-white/5 pt-3 mt-3">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Items Ordered:</p>
                      <div className="space-y-1">
                        {(o.items || []).map((item) => (
                          <div key={item.item_id} className="flex justify-between text-xs text-gray-300">
                            <span>• {item.medicine_name}</span>
                            <span className="font-mono text-white">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      <Footer />
    </>
  );
}
