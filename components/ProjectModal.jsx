"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Wraps whatever's intercepted into app/@modal — currently just the project
// page. router.back() rather than push("/"): the interception only added a
// history entry, it never actually left "/", so going back is what closes
// it and un-masks the URL in one step (forward/back both keep working too).
export default function ProjectModal({ children }) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // close() only reads router.back(), which next/navigation guarantees is
    // referentially stable — nothing is gained by re-subscribing on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="modal-backdrop absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm"
      />
      <div className="modal-panel relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-[#fafafa] p-6 shadow-2xl sm:p-10">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-base leading-none text-[#fafafa] opacity-90 transition-opacity hover:opacity-100 sm:right-6 sm:top-6"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
