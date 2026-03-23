"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDevelopmentMockEnabled } from "@/lib/api/dev-mock";

export async function logoutAction() {
  if (isDevelopmentMockEnabled()) {
    redirect("/");
  }

  const API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");

  if (sessionId) {
    try {
      await fetch(`${API_BASE}/api/v1/internal/auth/logout`, {
        method: "POST",
        headers: { Cookie: `session_id=${sessionId.value}` },
      });
    } catch {
      // Proceed even if backend logout fails
    }
  }

  redirect("/login");
}
