"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

/** Global toast store (module-level singleton) */
let toastListeners = [];
let toastQueue = [];
let nextId = 1;

export function toast(message, type = "success", duration = 3500) {
  const id = nextId++;
  const item = { id, message, type, duration };
  toastQueue = [...toastQueue, item];
  toastListeners.forEach((fn) => fn([...toastQueue]));
  setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  toastListeners.forEach((fn) => fn([...toastQueue]));
}

const icons = {
  success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
  warning: <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />,
};

const borders = {
  success: "border-green-500/40",
  error: "border-red-500/40",
  warning: "border-yellow-500/40",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 bg-[#1a2540] border ${
            borders[t.type] ?? borders.success
          } rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto animate-slideIn`}
        >
          {icons[t.type] ?? icons.success}
          <p className="text-white text-sm leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-white ml-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
