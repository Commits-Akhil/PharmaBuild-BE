"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/header";
import Footer from "../../components/footer";
import api, { getImageUrl } from "../../lib/api";
import { Upload, ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { toast } from "../../components/Toast";
import { SkeletonCard } from "../../components/Skeleton";

function StatusBadge({ status }) {
  const colours = {
    Placed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Verified: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Packed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "Out for Delivery": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    Cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return (
    <span className={`text-xs px-3.5 py-1 rounded-full border font-bold ${colours[status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
      {status}
    </span>
  );
}

function VerificationBadge({ status }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const colours = {
    Pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    Approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    Rejected: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  };
  return <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${colours[status] ?? "text-gray-400"}`}>{status}</span>;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prescription upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [prescFile, setPrescFile] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/customer/orders/${id}`);
        const d = res.data;
        setOrder(d.order ?? d.data?.order);
        setItems(d.items ?? d.data?.items ?? []);
        setPrescription(d.prescription ?? d.data?.prescription ?? null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpload = async () => {
    if (!prescFile) {
      setUploadError("Please select an image file first.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("orderId", String(id));
      formData.append("prescription", prescFile);
      const res = await api.post("/prescriptions/upload", formData);
      setPrescription(res.data.data?.prescription);
      toast("Prescription uploaded! Sent to pharmacist for review.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed.";
      setUploadError(msg);
      toast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push("/orders")}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 transition"
          >
            <ArrowLeft size={16} /> Back to Order History
          </button>

          {loading && (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {error && <div className="bg-rose-500/10 border border-rose-500/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-rose-400 text-center text-sm sm:text-base">{error}</div>}

          {!loading && !error && order && (
            <>
              {/* Order Header */}
              <div className="bg-[#161F33] rounded-[24px] sm:rounded-[30px] p-5 sm:p-8 mb-6 border border-white/10 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono text-gray-400 uppercase">Fulfillment Record</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      Order #{order.order_id}
                    </h1>
                  </div>
                  <div className="self-start sm:self-auto">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-300">
                  <div>
                    <p className="text-xs text-gray-400">Order Placed Date</p>
                    <p className="font-semibold text-white mt-1">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Assigned Pharmacy Branch</p>
                    <p className="font-semibold text-white mt-1">{order.branch_name} — <span className="text-gray-400 font-normal">{order.branch_location}</span></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-[#161F33] rounded-[24px] sm:rounded-[30px] p-5 sm:p-8 mb-6 border border-white/10 shadow-xl">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                  Purchased Items ({items.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                        <th className="pb-3 pr-4">Medicine Name</th>
                        <th className="pb-3 px-4">Quantity</th>
                        <th className="pb-3 pl-4">Classification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.item_id} className="border-b border-white/5">
                          <td className="py-3 pr-4 font-semibold text-white">{item.medicine_name}</td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{item.quantity}</td>
                          <td className="py-3 pl-4">
                            {item.is_prescription_required ? (
                              <span className="text-amber-400 text-[10px] sm:text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                                Rx Required
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                OTC
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prescription Section */}
              {order.requires_prescription && (
                <div className="bg-[#161F33] rounded-[24px] sm:rounded-[30px] p-5 sm:p-8 border border-white/10 shadow-xl">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                    Doctor Prescription Document
                  </h2>

                  {prescription ? (
                    <div>
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 flex-wrap">
                        <span className="text-xs sm:text-sm text-gray-300">Review Status:</span>
                        <VerificationBadge status={prescription.verification_status} />
                      </div>
                      <p className="text-xs text-gray-400 mb-4">
                        Uploaded on {new Date(prescription.uploaded_at).toLocaleString()}
                      </p>
                      {prescription.rejection_reason && (
                        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl mb-4 text-rose-300 text-xs sm:text-sm font-semibold">
                          Rejection Reason: {prescription.rejection_reason}
                        </div>
                      )}
                      <div className="bg-[#0D1527] p-3 sm:p-4 rounded-2xl border border-white/10 max-w-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(prescription.image_url)}
                          alt="Prescription Document"
                          className="w-full h-auto rounded-xl object-contain max-h-80"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0D1527] border border-amber-500/30 p-4 sm:p-6 rounded-2xl">
                      <p className="text-amber-300 text-xs sm:text-sm font-semibold mb-4">
                        ⚠️ Order Pending: Upload your doctor prescription image to allow pharmacist verification.
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        onChange={(e) => setPrescFile(e.target.files[0])}
                        className="text-white text-xs sm:text-sm mb-4 block w-full"
                      />
                      {uploadError && (
                        <p className="text-rose-400 text-xs mb-3 font-medium">{uploadError}</p>
                      )}
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !prescFile}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm disabled:opacity-50 shadow-lg shadow-emerald-900/40"
                      >
                        <Upload size={16} />
                        {uploading ? "Uploading Document..." : "Upload Prescription"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
