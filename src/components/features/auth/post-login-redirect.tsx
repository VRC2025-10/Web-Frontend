"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PostLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    const path = localStorage.getItem("redirect_after_login");
    if (path) {
      localStorage.removeItem("redirect_after_login");
      router.replace(path);
    }
  }, [router]);

  return null;
}
