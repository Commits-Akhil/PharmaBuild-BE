"use client";

import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import api from "../lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data?.user ?? null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-[#0B1220] min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-white">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="text-gray-400 text-center py-16 text-sm sm:text-base">Loading profile…</div>
          )}

          {error && (
            <div className="text-red-400 text-center py-16 text-sm sm:text-base">{error}</div>
          )}

          {!loading && !error && user && (
            <>
              <div className="bg-gradient-to-r from-gray-900 via-[#162725] to-green-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 border border-white/10 shadow-xl">
                <img
                  src="https://i.pravatar.cc"
                  alt="profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/20 shadow-lg shrink-0"
                />

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{user.name}</h1>

                  <p className="text-gray-300 mt-1 text-xs sm:text-sm">
                    {user.email}
                    {user.id && ` • ID: ${user.id.slice(0, 8)}…`}
                  </p>

                  <div className="flex justify-center sm:justify-start gap-3 mt-3 sm:mt-4">
                    <span className="bg-emerald-600 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
                <div className="lg:col-span-2 bg-[#161F33] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 shadow-xl">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-white">
                    Personal Information
                  </h2>

                  <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    className="w-full bg-[#263149] p-3.5 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm text-white outline-none border border-white/5"
                    defaultValue={user.name || ""}
                    readOnly
                  />

                  <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-300">Email</label>
                  <input
                    className="w-full bg-[#263149] p-3.5 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm text-white outline-none border border-white/5"
                    defaultValue={user.email || ""}
                    readOnly
                  />

                  <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-300">Phone Number</label>
                  <input
                    className="w-full bg-[#263149] p-3.5 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm text-white outline-none border border-white/5"
                    defaultValue={user.phone || "—"}
                    readOnly
                  />

                  <label className="block mb-2 text-xs sm:text-sm font-medium text-gray-300">Address</label>
                  <textarea
                    rows="3"
                    className="w-full bg-[#263149] p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm text-white outline-none border border-white/5"
                    defaultValue={user.address || "—"}
                    readOnly
                  />

                  <p className="text-gray-400 text-xs mt-4">
                    Member since{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-[#161F33] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 shadow-xl">
                    <h3 className="text-gray-400 uppercase text-xs font-semibold tracking-wider">
                      Account &amp; Vault
                    </h3>

                    <div className="mt-6 space-y-2 text-xs sm:text-sm">
                      <p className="text-gray-300">
                        Role:{" "}
                        <span className="text-white font-semibold uppercase">
                          {user.role}
                        </span>
                      </p>
                      {user.branch_id && (
                        <p className="text-gray-300">
                          Branch ID:{" "}
                          <span className="text-white font-semibold">
                            #{user.branch_id}
                          </span>
                        </p>
                      )}
                    </div>

                    <a
                      href="/orders"
                      className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 transition text-white py-3 rounded-xl sm:rounded-2xl text-center block font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-900/40"
                    >
                      View My Orders
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
