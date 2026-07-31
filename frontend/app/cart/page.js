"use client";

import { useState } from "react";
import { Building2, Minus, Plus, Trash2, ShieldCheck, Upload } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import useCartStore from "../Store/cart";
import api from "../lib/api";
import { useRouter } from "next/navigation";
import { toast } from "../components/Toast";

// ── Order Summary Sidebar ──────────────────────────────────────────────
function OrderSummary({ cart, onCheckout, loading }) {
  const total = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
    0
  );

  return (
    <div className="bg-[#161F33] rounded-[30px] p-8 h-fit border border-white/10 shadow-xl">
      <h2 className="text-3xl font-bold text-white">Order Summary</h2>
      <hr className="my-6 border-white/10" />
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.medicineId} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {item.name} × {item.quantity}
            </span>
            <span className="text-white font-semibold">
              ₹{((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-base pt-2 border-t border-white/5">
          <span className="text-gray-300">Express Branch Delivery:</span>
          <span className="text-emerald-400 font-semibold">FREE</span>
        </div>
      </div>
      <hr className="my-6 border-white/10" />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Total Amount:</h2>
        <h2 className="text-3xl font-extrabold text-emerald-400">
          ₹{total.toFixed(2)}
        </h2>
      </div>
      <button
        onClick={onCheckout}
        disabled={loading || cart.length === 0}
        className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 transition py-4 rounded-2xl text-white text-lg font-bold disabled:opacity-60 shadow-lg shadow-emerald-900/40"
      >
        {loading ? "Checking Stock..." : "Proceed to Branch Selection →"}
      </button>
    </div>
  );
}

// ── Branch Picker Modal ───────────────────────────────────────────────
function BranchModal({
  branches,
  requiresPrescription,
  prescFile,
  setPrescFile,
  onPlace,
  onClose,
  loading,
  error,
}) {
  const [selectedBranch, setSelectedBranch] = useState(
    branches[0]?.branchId ?? null
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161F33] w-full max-w-xl rounded-[32px] p-8 border border-white/10 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white bg-black/40 p-2 rounded-full"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Building2 className="text-emerald-400" />
          Fulfillment Branch Selection
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Branches with complete stock availability for your cart items.
        </p>

        {branches.length === 0 ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center text-rose-300">
            No branches currently have all requested items in stock. Please reduce item quantities or modify your cart.
          </div>
        ) : (
          <>
            <label className="text-xs uppercase text-gray-400 font-semibold mb-2 block">
              Available Branch Locations ({branches.length})
            </label>
            <select
              className="w-full bg-[#0D1527] border border-gray-700 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 mb-6 font-medium"
              value={selectedBranch ?? ""}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
            >
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName} — {b.location}
                </option>
              ))}
            </select>

            {requiresPrescription && (
              <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl">
                <p className="text-amber-300 text-xs font-semibold flex items-center gap-2 mb-3">
                  ⚠️ Doctor Prescription Required for one or more medicines in your cart.
                </p>
                <label className="text-white text-xs block mb-2 font-medium">
                  Attach Prescription Image (Optional now — can upload after placement)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => setPrescFile(e.target.files[0])}
                  className="text-white text-xs file:bg-emerald-600 file:border-0 file:rounded-xl file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>
            )}

            {error && (
              <div className="text-rose-400 text-sm mb-4 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={() => onPlace(selectedBranch)}
              disabled={loading || !selectedBranch}
              className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl text-white font-bold flex justify-center items-center gap-2 disabled:opacity-60 transition shadow-lg shadow-emerald-900/40"
            >
              <ShieldCheck size={20} />
              {loading ? "Placing Order..." : "Confirm & Place Order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Cart Page ────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [prescFile, setPrescFile] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckLoading(true);
    try {
      const medicines = cart.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
      }));
      const res = await api.post("/orders/check-stock", { medicines });
      // Backend returns flat: { prescriptionRequired, availableBranches } — NOT nested under .data
      const rxRequired = res.data.prescriptionRequired ?? false;
      const branches = res.data.availableBranches ?? [];
      setRequiresPrescription(rxRequired);
      setAvailableBranches(branches);
      setShowModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Stock check failed.";
      toast(msg, "error");
    } finally {
      setCheckLoading(false);
    }
  };

  const handlePlaceOrder = async (branchId) => {
    setPlaceLoading(true);
    setModalError("");
    try {
      const items = cart.map((item) => ({
        medicine_id: item.medicineId,
        quantity: item.quantity,
      }));

      const orderRes = await api.post("/orders/place", {
        branchId,
        requiresPrescription,
        items,
      });

      // Backend returns flat: { success, orderId, message, nextStep } — NOT nested under .data
      const orderId = orderRes.data.orderId ?? orderRes.data.data?.orderId;

      // Upload prescription if required and file selected
      if (requiresPrescription && prescFile) {
        const formData = new FormData();
        formData.append("orderId", String(orderId));
        formData.append("prescription", prescFile);
        await api.post("/prescriptions/upload", formData);
        toast("Prescription uploaded automatically!", "success");
      }

      clearCart();
      setShowModal(false);
      toast(`Order #${orderId} placed successfully!`, "success");
      router.push(`/orders/${orderId}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order.";
      setModalError(msg);
      toast(msg, "error");
    } finally {
      setPlaceLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <BranchModal
          branches={availableBranches}
          requiresPrescription={requiresPrescription}
          prescFile={prescFile}
          setPrescFile={setPrescFile}
          onPlace={handlePlaceOrder}
          onClose={() => setShowModal(false)}
          loading={placeLoading}
          error={modalError}
        />
      )}

      <Header />

      <div className="bg-[#0B1220] min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <section className="bg-gradient-to-r from-emerald-800 to-[#1A2341] rounded-[30px] p-8 md:p-10 border border-white/10">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Shopping Cart & Checkout
            </h1>
            <p className="text-gray-300 mt-2">
              Review your selected medicines and check branch stock availability.
            </p>
          </section>

          {cart.length === 0 ? (
            <div className="bg-[#161F33] rounded-[30px] p-16 text-center border border-white/10 mt-10">
              <span className="text-6xl mb-4 block">🛒</span>
              <p className="text-gray-300 text-xl font-medium mb-4">
                Your shopping cart is empty.
              </p>
              <a
                href="/medicines"
                className="inline-block bg-emerald-600 hover:bg-emerald-500 transition text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/40"
              >
                Browse Medicines Catalog
              </a>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.45fr_1fr] gap-8 mt-10">
              <div className="bg-[#161F33] rounded-[30px] overflow-hidden border border-white/10 shadow-xl">
                {cart.map((item) => (
                  <div
                    key={item.medicineId}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-white/10 gap-4"
                  >
                    <div>
                      <h3 className="text-white text-xl font-bold max-w-sm">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.is_prescription_required ? (
                          <span className="text-amber-400 font-semibold">⚠️ Doctor Prescription Required</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Over The Counter (OTC)</span>
                        )}
                      </p>
                      {item.price && (
                        <p className="text-emerald-400 mt-2 font-bold text-lg">
                          ₹{item.price} / unit
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="flex items-center bg-[#0D1527] border border-white/10 rounded-2xl px-3 py-1.5 gap-4">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              toast(`Removed "${item.name}" from cart`, "warning");
                            }
                            updateQuantity(item.medicineId, item.quantity - 1);
                          }}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-white font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.medicineId, item.quantity + 1)
                          }
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.medicineId);
                          toast(`Removed "${item.name}" from cart`, "warning");
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <OrderSummary
                cart={cart}
                onCheckout={handleCheckout}
                loading={checkLoading}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
