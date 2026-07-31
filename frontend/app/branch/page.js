"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, FileText, User, Mail, MapPin, Clock, Eye, AlertTriangle } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import api, { getImageUrl } from "../lib/api";
import { toast } from "../components/Toast";
import { SkeletonCard } from "../components/Skeleton";

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReason, setShowReason] = useState({});
  const [reason, setReason] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  async function fetchPrescriptions() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/pharmacist/pending-prescriptions");
      const data =
        res.data.prescriptions ??
        res.data.data?.prescriptions ??
        [];
      setPrescriptions(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load prescriptions.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  async function approvePrescription(prescriptionId) {
    setActionLoading((prev) => ({ ...prev, [prescriptionId]: true }));
    try {
      await api.post("/pharmacist/approve", { prescriptionId });
      setPrescriptions((prev) =>
        prev.filter((p) => p.prescription_id !== prescriptionId)
      );
      toast(`Prescription #${prescriptionId} approved successfully!`, "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Approve failed.";
      toast(msg, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [prescriptionId]: false }));
    }
  }

  async function rejectPrescription(prescriptionId) {
    const rejReason = reason[prescriptionId] || "Illegible prescription or invalid details";
    setActionLoading((prev) => ({ ...prev, [prescriptionId]: true }));
    try {
      await api.post("/pharmacist/reject", {
        prescriptionId,
        rejectionReason: rejReason,
      });
      setPrescriptions((prev) =>
        prev.filter((p) => p.prescription_id !== prescriptionId)
      );
      toast(`Prescription #${prescriptionId} rejected. Inventory released back to stock.`, "warning");
    } catch (err) {
      const msg = err.response?.data?.message || "Reject failed.";
      toast(msg, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [prescriptionId]: false }));
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B1220] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero / Header */}
          <section className="bg-gradient-to-r from-emerald-800 via-[#132A38] to-[#161F33] rounded-[32px] p-8 md:p-10 mb-10 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Pharmacist Review Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Pending Prescriptions
              </h1>
              <p className="text-gray-300 mt-2">
                Verify customer prescriptions to confirm order eligibility and dispatch.
              </p>
            </div>
            <button
              onClick={fetchPrescriptions}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh Queue
            </button>
          </section>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error Banner */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400">
              <AlertTriangle className="mx-auto mb-2" size={32} />
              <p className="font-semibold text-lg">{error}</p>
              <button
                onClick={fetchPrescriptions}
                className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty Queue */}
          {!loading && !error && prescriptions.length === 0 && (
            <div className="bg-[#161F33] rounded-[30px] p-16 text-center border border-white/10">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-emerald-400" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Queue is All Clear!</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                No pending customer prescriptions require verification right now.
              </p>
            </div>
          )}

          {/* Prescriptions Grid */}
          {!loading && !error && prescriptions.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.map((presc) => (
                <div
                  key={presc.prescription_id}
                  className="bg-[#161F33] rounded-[28px] border border-white/10 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition shadow-xl"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-xs text-gray-400 font-mono">ORDER #{presc.order_id}</span>
                        <h3 className="text-xl font-bold text-white">
                          Rx #{presc.prescription_id}
                        </h3>
                      </div>
                      <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs px-3 py-1 rounded-full font-medium">
                        Pending
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-gray-300 mb-6">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-emerald-400" />
                        <span>{presc.customer_name || "Customer"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-emerald-400" />
                        <span className="truncate">{presc.email || presc.customer_email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-emerald-400" />
                        <span>{presc.branch_name || "Branch"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-emerald-400" />
                        <span>{new Date(presc.uploaded_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div className="relative group rounded-2xl overflow-hidden bg-[#0D1527] border border-white/10 mb-6 h-48 flex items-center justify-center">
                      <img
                        src={getImageUrl(presc.image_url)}
                        alt="Prescription Document"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        onClick={() => setSelectedImage(getImageUrl(presc.image_url))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium gap-2"
                      >
                        <Eye size={20} /> Inspect Full Screen
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {!showReason[presc.prescription_id] ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => approvePrescription(presc.prescription_id)}
                          disabled={actionLoading[presc.prescription_id]}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setShowReason((prev) => ({
                              ...prev,
                              [presc.prescription_id]: true,
                            }))
                          }
                          disabled={actionLoading[presc.prescription_id]}
                          className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white transition py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-[#0D1527] p-4 rounded-2xl border border-red-500/30">
                        <label className="text-xs text-red-300 font-medium block">
                          Reason for Rejection:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Doctor signature missing or blurred"
                          value={reason[presc.prescription_id] || ""}
                          onChange={(e) =>
                            setReason((prev) => ({
                              ...prev,
                              [presc.prescription_id]: e.target.value,
                            }))
                          }
                          className="w-full bg-[#161F33] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-red-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => rejectPrescription(presc.prescription_id)}
                            disabled={actionLoading[presc.prescription_id]}
                            className="flex-1 bg-red-600 hover:bg-red-700 transition text-white py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                          >
                            {actionLoading[presc.prescription_id] ? "Processing..." : "Confirm Rejection"}
                          </button>
                          <button
                            onClick={() =>
                              setShowReason((prev) => ({
                                ...prev,
                                [presc.prescription_id]: false,
                              }))
                            }
                            className="px-3 py-2 bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-[#161F33] rounded-3xl p-4 border border-white/20 flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Prescription Full Screen"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
