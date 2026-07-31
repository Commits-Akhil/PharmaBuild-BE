/**
 * Centralized Axios instance for the RxConnect backend.
 * Automatically attaches JWT from localStorage on every request.
 * Handles 401 by clearing local auth and redirecting to /Login.
 */

import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request interceptor ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Only runs in the browser (Next.js SSR safety)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rx_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response &&
      error.response.status === 401
    ) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("rx_token");
      localStorage.removeItem("rx_user");
      window.location.href = "/Login";
    }
    return Promise.reject(error);
  }
);

export default api;

/** Helpers ---------------------------------------------------------- */

/** Returns the full URL for a relative prescription image path. */
export function getImageUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
}

/** Read user from localStorage (parsed JSON). */
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("rx_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Store token and user after login / registration. */
export function storeAuth(token, user) {
  localStorage.setItem("rx_token", token);
  localStorage.setItem("rx_user", JSON.stringify(user));
}

/** Clear auth (logout). */
export function clearAuth() {
  localStorage.removeItem("rx_token");
  localStorage.removeItem("rx_user");
}
