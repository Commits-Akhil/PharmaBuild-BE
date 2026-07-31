"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getStoredUser } from "../lib/api";
import useCartStore from "../Store/cart";
import { Menu, X, ShoppingCart } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/Login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu}>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-green-500 flex flex-row items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-black">
                RX
              </span>
              <span>Connect</span>
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link href="/medicines" className="hover:text-green-600 transition">
            Medicines
          </Link>
          <Link href="/branches" className="hover:text-green-600 transition">
            Branches
          </Link>
          <Link href="/cart" className="relative hover:text-green-600 transition">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/orders" className="hover:text-green-600 transition">
            Orders
          </Link>
          {user?.role === "pharmacist" && (
            <Link href="/branch" className="hover:text-green-600 transition">
              Pharmacist
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/Admin" className="hover:text-green-600 transition">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex gap-3 items-center">
          {user ? (
            <>
              <Link
                href="/profile"
                className="font-semibold text-gray-900 hover:text-green-600 transition"
              >
                {user.name || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/Login">
                <button className="font-semibold text-gray-900 hover:text-green-600 px-3 py-2 text-sm">
                  Login
                </button>
              </Link>
              <Link href="/Signup">
                <button className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right Controls */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/cart" onClick={closeMenu} className="relative p-2 text-gray-700">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-green-600 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4 shadow-lg animate-slideIn">
          <nav className="flex flex-col gap-3 font-medium text-gray-800">
            <Link
              href="/"
              onClick={closeMenu}
              className="py-2 border-b border-gray-100 hover:text-green-600"
            >
              Home
            </Link>
            <Link
              href="/medicines"
              onClick={closeMenu}
              className="py-2 border-b border-gray-100 hover:text-green-600"
            >
              Medicines
            </Link>
            <Link
              href="/branches"
              onClick={closeMenu}
              className="py-2 border-b border-gray-100 hover:text-green-600"
            >
              Branches
            </Link>
            <Link
              href="/cart"
              onClick={closeMenu}
              className="py-2 border-b border-gray-100 hover:text-green-600 flex justify-between items-center"
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-green-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {cartCount} items
                </span>
              )}
            </Link>
            <Link
              href="/orders"
              onClick={closeMenu}
              className="py-2 border-b border-gray-100 hover:text-green-600"
            >
              Orders
            </Link>
            {user?.role === "pharmacist" && (
              <Link
                href="/branch"
                onClick={closeMenu}
                className="py-2 border-b border-gray-100 text-green-600 font-semibold"
              >
                Pharmacist Dashboard
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/Admin"
                onClick={closeMenu}
                className="py-2 border-b border-gray-100 text-purple-600 font-semibold"
              >
                Admin Console
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="py-2 border-b border-gray-100 hover:text-green-600 font-semibold"
                >
                  My Profile ({user.name || "User"})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500 font-semibold hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/Login"
                  onClick={closeMenu}
                  className="w-full text-center bg-gray-100 text-gray-900 py-2.5 rounded-xl font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/Signup"
                  onClick={closeMenu}
                  className="w-full text-center bg-green-500 text-white py-2.5 rounded-xl font-semibold shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

