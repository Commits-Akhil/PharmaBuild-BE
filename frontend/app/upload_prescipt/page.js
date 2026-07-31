"use client";

import { useState } from "react";
import { Upload, ShieldCheck } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../lib/api";

export default function Page() {
  const [orderId, setOrderId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

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
      // Do NOT set Content-Type — browser sets multipart boundary automatically
      await api.post("/prescriptions/upload", formData);
      setSuccess(true);
      setOrderId("");
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#161F33] rounded-[24px] sm:rounded-[30px] p-5 sm:p-8 border border-white/10 shadow-xl">

            <h2 className="text-xl sm:text-3xl font-semibold text-white flex items-center gap-2.5 sm:gap-3">
              <Upload className="text-blue-500 shrink-0" size={24} />
              Upload Prescription Document
            </h2>

            {/* Order ID input */}
            <div className="mt-6 sm:mt-8">
              <label className="text-white block mb-2 sm:mb-3 text-xs sm:text-sm font-medium">
                Order ID
              </label>
              <input
                type="number"
                placeholder="Enter your Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-[#111B2F] border border-gray-700 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* File drop zone */}
            <div className="border-2 border-dashed border-gray-600 rounded-2xl sm:rounded-3xl mt-6 sm:mt-8 min-h-[220px] sm:min-h-[260px] p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6">
                <Upload className="text-blue-400" size={32} />
              </div>

              <p className="text-white text-base sm:text-xl font-semibold">
                Click or drag doctor prescription file here
              </p>

              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                Supports JPEG, PNG, WebP, GIF — up to 5MB
              </p>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="mt-4 sm:mt-6 text-xs sm:text-sm text-white max-w-full"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && (
                <p className="text-emerald-400 mt-2 text-xs sm:text-sm font-medium">{file.name}</p>
              )}
            </div>

            {/* Feedback */}
            {error && (
              <p className="text-rose-400 text-xs sm:text-sm mt-4 font-medium">{error}</p>
            )}
            {success && (
              <p className="text-emerald-400 text-xs sm:text-sm mt-4 font-medium">
                ✓ Prescription uploaded successfully! Awaiting pharmacist review.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 sm:mt-8 w-full bg-blue-600 hover:bg-blue-500 transition rounded-xl sm:rounded-full py-3.5 sm:py-4 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/30"
            >
              <ShieldCheck size={18} />
              {loading ? "Uploading…" : "Submit for Pharmacist Verification"}
            </button>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
