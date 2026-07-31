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
      <div className="bg-[#0B1220] min-h-screen p-8 text-white">
        <div className="max-w-7xl mx-auto">

          {loading && (
            <div className="text-gray-400 text-center py-20">Loading profile…</div>
          )}

          {error && (
            <div className="text-red-400 text-center py-20">{error}</div>
          )}

          {!loading && !error && user && (
            <>
              <div className="bg-gradient-to-r from-gray-900 to-green-500 rounded-3xl p-8 flex items-center gap-6">
                <img
                  src="https://i.pravatar.cc"
                  alt="profile"
                  className="w-24 h-24 rounded-full border-4 border-white"
                />

                <div>
                  <h1 className="text-4xl font-bold">{user.name}</h1>

                  <p className="text-gray-200 mt-1">
                    {user.email}
                    {user.id && ` • ID: ${user.id.slice(0, 8)}…`}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <span className="bg-green-600 px-4 py-1 rounded-full text-sm capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-[#161F33] rounded-3xl p-8">
                  <h2 className="text-2xl font-semibold mb-8">
                    Personal Information
                  </h2>

                  <label className="block mb-2">Full Name</label>
                  <input
                    className="w-full bg-[#263149] p-4 rounded-xl mb-6 outline-none"
                    defaultValue={user.name || ""}
                    readOnly
                  />

                  <label className="block mb-2">Email</label>
                  <input
                    className="w-full bg-[#263149] p-4 rounded-xl mb-6 outline-none"
                    defaultValue={user.email || ""}
                    readOnly
                  />

                  <label className="block mb-2">Phone Number</label>
                  <input
                    className="w-full bg-[#263149] p-4 rounded-xl mb-6 outline-none"
                    defaultValue={user.phone || "—"}
                    readOnly
                  />

                  <label className="block mb-2">Address</label>
                  <textarea
                    rows="3"
                    className="w-full bg-[#263149] p-4 rounded-xl outline-none"
                    defaultValue={user.address || "—"}
                    readOnly
                  />

                  <p className="text-gray-500 text-sm mt-4">
                    Member since{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="bg-[#161F33] rounded-3xl p-6">
                    <h3 className="text-gray-400 uppercase text-sm">
                      Account &amp; Vault
                    </h3>

                    <div className="mt-8">
                      <p className="text-gray-300">
                        Role:{" "}
                        <span className="text-white font-semibold capitalize">
                          {user.role}
                        </span>
                      </p>
                      {user.branch_id && (
                        <p className="text-gray-300 mt-2">
                          Branch ID:{" "}
                          <span className="text-white font-semibold">
                            {user.branch_id}
                          </span>
                        </p>
                      )}
                    </div>

                    <a
                      href="/orders"
                      className="mt-8 w-full bg-green-500 py-3 rounded-xl text-center block hover:bg-green-600"
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
