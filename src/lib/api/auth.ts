import { cookies } from "next/headers";
import { cache } from "react";
import { apiClient } from "./client";
import { isDevelopmentMockEnabled, resolveDevelopmentMock } from "./dev-mock";
import type { AuthMe } from "./types";

const API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";

export const getMe = cache(async function getMeCached(): Promise<AuthMe | null> {
  if (isDevelopmentMockEnabled()) {
    return resolveDevelopmentMock<AuthMe>("/api/v1/internal/auth/me", { method: "GET" });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");
  if (!sessionId) return null;

  try {
    const res = await fetch(`${API_BASE}/api/v1/internal/auth/me`, {
      headers: { Cookie: `session_id=${sessionId.value}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
});

export const requireMe = cache(async function requireMeCached(): Promise<AuthMe> {
  if (isDevelopmentMockEnabled()) {
    return resolveDevelopmentMock<AuthMe>("/api/v1/internal/auth/me", { method: "GET" });
  }

  return apiClient("/api/v1/internal/auth/me", {
    cache: "no-store",
    withCookies: true,
  });
});
