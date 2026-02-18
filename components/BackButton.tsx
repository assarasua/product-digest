"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push("/");
      }}
    >
      ← Volver
    </button>
  );
}
