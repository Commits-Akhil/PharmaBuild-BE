"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import api, { storeAuth } from "../lib/api";
import { toast } from "../components/Toast";

const SignupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["customer", "pharmacist", "admin"]),
    role_secret: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    branch_id: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if ((data.role === "admin" || data.role === "pharmacist") && !data.role_secret) {
        return false;
      }
      return true;
    },
    {
      message: "Secret key is required for Admin and Pharmacist roles",
      path: ["role_secret"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "pharmacist") {
        const n = Number(data.branch_id);
        return data.branch_id && Number.isInteger(n) && n > 0;
      }
      return true;
    },
    {
      message: "Pharmacists must select a valid Branch ID (positive integer)",
      path: ["branch_id"],
    }
  );

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [roleSecret, setRoleSecret] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [branchId, setBranchId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    const result = SignupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      role,
      role_secret: roleSecret,
      phone,
      address,
      branch_id: branchId,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(phone && { phone }),
        ...(address && { address }),
        ...((role === "admin" || role === "pharmacist") && { role_secret: roleSecret }),
        // branch_id is required for pharmacists, optional for others
        ...(branchId && { branch_id: Number(branchId) }),
      };

      const res = await api.post("/auth/register", payload);
      const { token, user } = res.data.data;
      storeAuth(token, user);

      toast("Account registered successfully!", "success");

      if (user.role === "admin") {
        router.push("/Admin");
      } else if (user.role === "pharmacist") {
        router.push("/branch");
      } else {
        router.push("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1120] p-6">
      <div className="grid min-h-[85vh] w-full max-w-7xl grid-cols-1 md:grid-cols-12 overflow-hidden rounded-3xl border border-gray-800 shadow-2xl">
        {/* Left Visual Section */}
        <div className="relative md:col-span-5 hidden md:block overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900">
          <Image
            src="/dr.jpeg"
            alt="Medical Illustration"
            fill
            priority
            className="object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />

          <div className="absolute bottom-12 left-10 right-10 z-10 text-white">
            <p className="mb-4 inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              💊 Multi-Branch Smart Pharmacy
            </p>

            <h1 className="text-4xl font-extrabold leading-tight">
              Join
              <br />
              RxConnect
            </h1>

            <p className="mt-4 text-base leading-relaxed text-emerald-100/80">
              Create your account to order medicines, track live deliveries, upload doctor prescriptions, or manage branch inventory.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:col-span-7 flex items-center justify-center bg-[#111827] px-6 py-10 md:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
              <p className="mt-2 text-sm text-gray-400">
                Enter your information to get started with RxConnect.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-300">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["customer", "pharmacist", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition ${
                        role === r
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                          : "bg-[#1f2937] border-gray-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Key for Staff */}
              {(role === "admin" || role === "pharmacist") && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-amber-400">
                    {role.toUpperCase()} Secret Key *
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${role} registration secret`}
                    value={roleSecret}
                    onChange={(e) => setRoleSecret(e.target.value)}
                    className="w-full rounded-xl border border-amber-500/40 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Branch ID — required for Pharmacists */}
              {role === "pharmacist" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-emerald-400">
                    Branch ID *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter your assigned Branch ID (e.g. 1, 2, 3)"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full rounded-xl border border-emerald-500/40 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-400"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Contact your administrator for your assigned Branch ID.
                  </p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-300">
                    Confirm Pass
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat pass"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#1f2937] px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 disabled:opacity-60 mt-4"
              >
                {loading ? "Registering Account..." : "Create Account →"}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/Login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}