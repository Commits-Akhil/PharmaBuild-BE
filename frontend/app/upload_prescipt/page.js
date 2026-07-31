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
      <div className="bg-[#0B1220] min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#161F33] rounded-[30px] p-8 border border-white/10">

            <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
              <Upload className="text-blue-500" />
              Upload Prescription Document
            </h2>

            {/* Order ID input */}
            <div className="mt-8">
              <label className="text-white block mb-3 font-medium">
                Order ID
              </label>
              <input
                type="number"
                placeholder="Enter your Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-[#111B2F] border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* File drop zone */}
            <div className="border-2 border-dashed border-gray-600 rounded-3xl mt-8 h-[260px] flex flex-col items-center justify-center">
              <div className="bg-blue-900 p-6 rounded-3xl">
                <Upload className="text-blue-500" size={40} />
              </div>

              <p className="text-white text-xl font-semibold mt-8">
                Click or drag doctor prescription file here
              </p>

              <p className="text-gray-400 mt-2">
                Supports JPEG, PNG, WebP, GIF — up to 5MB
              </p>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="mt-6 text-white"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && (
                <p className="text-green-400 mt-2 text-sm">{file.name}</p>
              )}
            </div>

            {/* Feedback */}
            {error && (
              <p className="text-red-400 mt-4">{error}</p>
            )}
            {success && (
              <p className="text-green-400 mt-4">
                ✓ Prescription uploaded successfully! Awaiting pharmacist review.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-8 w-full bg-blue-700 hover:bg-blue-800 transition rounded-full py-5 text-white text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck size={20} />
              {loading ? "Uploading…" : "Submit for Pharmacist Verification"}
            </button>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
