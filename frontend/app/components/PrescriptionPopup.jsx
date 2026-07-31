"use client";

import { Upload, ShieldCheck } from "lucide-react";
import { useState } from "react";
import api from "../lib/api";

/**
 * PrescriptionPopup is shown when a customer needs to upload a prescription
 * for an existing order. It receives the orderId as a prop.
 *
 * Props:
 *  - showPopup: boolean
 *  - setShowPopup: fn
 *  - orderId: number | null (if null, asks the user to enter one)
 */
export default function PrescriptionPopup({ showPopup, setShowPopup, orderId: propOrderId }) {
  const [file, setFile] = useState(null);
  const [orderId, setOrderId] = useState(propOrderId ? String(propOrderId) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!showPopup) return null;

  const handleSubmit = async () => {
    setError("");
    if (!orderId || isNaN(Number(orderId))) {
      setError("Please enter a valid Order ID.");
      return;
    }
    if (!file) {
      setError("Please select a prescription file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", String(orderId));
      formData.append("prescription", file);
      await api.post("/prescriptions/upload", formData);
      setSuccess(true);
      setTimeout(() => {
        setShowPopup(false);
        setSuccess(false);
        setFile(null);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161F33] w-full max-w-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl p-1 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center z-10"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-3xl font-semibold text-white flex items-center gap-2.5 sm:gap-3 pr-8">
          <Upload className="text-blue-500 shrink-0" size={24} />
          Upload Prescription
        </h2>

        {/* Order ID (editable if not passed as prop) */}
        {!propOrderId && (
          <div className="mt-4 sm:mt-6">
            <label className="text-white block mb-2 text-xs sm:text-sm font-medium">Order ID</label>
            <input
              type="number"
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#111B2F] border border-gray-700 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="border-2 border-dashed border-gray-600 rounded-2xl sm:rounded-3xl mt-6 sm:mt-8 min-h-[200px] sm:min-h-[230px] p-4 flex flex-col justify-center items-center text-center">
          <div className="bg-blue-900/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4">
            <Upload className="text-blue-400" size={32} />
          </div>

          <p className="text-white text-base sm:text-lg font-semibold">
            Click or Drag Prescription Here
          </p>

          <p className="text-gray-400 text-xs sm:text-sm mt-1">JPG, PNG, WebP (Max 5MB)</p>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="mt-4 sm:mt-6 text-xs sm:text-sm text-white max-w-full"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <p className="text-emerald-400 text-xs sm:text-sm mt-2 font-medium">{file.name}</p>
          )}
        </div>

        {error && <p className="text-rose-400 mt-4 text-xs sm:text-sm font-medium">{error}</p>}
        {success && (
          <p className="text-emerald-400 mt-4 text-xs sm:text-sm font-medium">
            ✓ Uploaded! Awaiting pharmacist review.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 sm:mt-8 bg-blue-600 hover:bg-blue-500 py-3 sm:py-4 rounded-xl sm:rounded-full text-white text-xs sm:text-sm font-semibold flex justify-center items-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/30"
        >
          <ShieldCheck size={18} />
          {loading ? "Uploading…" : "Submit for Pharmacist Verification"}
        </button>
      </div>
    </div>
  );
}

