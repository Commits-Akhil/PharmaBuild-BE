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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#161F33] w-full max-w-2xl rounded-3xl p-8 border border-white/10 relative">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-5 right-5 text-gray-400 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <Upload className="text-blue-500" />
          Upload Prescription
        </h2>

        {/* Order ID (editable if not passed as prop) */}
        {!propOrderId && (
          <div className="mt-6">
            <label className="text-white block mb-2">Order ID</label>
            <input
              type="number"
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#111B2F] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="border-2 border-dashed border-gray-600 rounded-3xl mt-8 h-[230px] flex flex-col justify-center items-center">
          <div className="bg-blue-900 p-5 rounded-3xl">
            <Upload className="text-blue-500" size={40} />
          </div>

          <p className="text-white text-lg font-semibold mt-6">
            Click or Drag Prescription Here
          </p>

          <p className="text-gray-400 mt-2">JPG, PNG, WebP (Max 5MB)</p>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="mt-6 text-white"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <p className="text-green-400 text-sm mt-1">{file.name}</p>
          )}
        </div>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        {success && (
          <p className="text-green-400 mt-4 text-sm">
            ✓ Uploaded! Awaiting pharmacist review.
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-4 rounded-full text-white font-semibold flex justify-center items-center gap-2 disabled:opacity-60"
        >
          <ShieldCheck size={20} />
          {loading ? "Uploading…" : "Submit for Pharmacist Verification"}
        </button>
      </div>
    </div>
  );
}
