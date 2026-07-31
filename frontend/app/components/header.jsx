"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getStoredUser } from "../lib/api";
import useCartStore from "../Store/cart";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push("/Login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-green-500 flex flex-row">
              <p className="text-3xl font-extrabold text-black items-center">
                RX
              </p>
              <p>Connect</p>
            </h1>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/medicines">Medicines</Link>
          <Link href="/branches">Branches</Link>
          <Link href="/cart" className="relative">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/orders">Orders</Link>
          {user?.role === "pharmacist" && (
            <Link href="/branch">Pharmacist</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/Admin">Admin</Link>
          )}
        </nav>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <Link
                href="/profile"
                className="font-semibold text-gray-900 hover:text-green-600"
              >
                {user.name || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/Login">
                <button className="font-semibold text-gray-900">Login</button>
              </Link>
              <Link href="/Signup">
                <button className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-700">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
