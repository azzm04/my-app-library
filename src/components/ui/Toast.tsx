// components/ui/Toast.tsx
"use client";

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded transition-colors"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}