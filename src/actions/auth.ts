"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDevelopmentMockEnabled } from "@/lib/api/dev-mock";

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) {
    return null;
  }

  try {
    const normalized = new URL(trimmed);
    return normalized.origin;
  } catch {
    return null;
  }
}

function firstForwardedValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();
  return first && first.length > 0 ? first : null;
}

function resolveFrontendOrigin(headerStore: Headers): string | null {
  const configuredOrigin =
    process.env.FRONTEND_ORIGIN?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  const forwardedHost =
    firstForwardedValue(headerStore.get("x-forwarded-host")) ??
    firstForwardedValue(headerStore.get("host"));
  if (!forwardedHost) {
    return null;
  }

  const forwardedProto = firstForwardedValue(headerStore.get("x-forwarded-proto")) ?? "http";
  return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
}

function isSecureCookie(frontendOrigin: string | null): boolean {
  if (frontendOrigin) {
    return frontendOrigin.startsWith("https://");
  }

  const configuredSecure = process.env.COOKIE_SECURE?.trim().toLowerCase();
  return !new Set(["0", "false", "off"]).has(configuredSecure ?? "");
}

export async function logoutAction() {
  if (isDevelopmentMockEnabled()) {
    redirect("/");
  }

  const API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";
  const cookieStore = await cookies();
  const headerStore = await headers();
  const sessionId = cookieStore.get("session_id");
  const frontendOrigin = resolveFrontendOrigin(headerStore);

  if (sessionId) {
    try {
      await fetch(`${API_BASE}/api/v1/internal/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionId.value}`,
          ...(frontendOrigin ? { Origin: frontendOrigin, Referer: `${frontendOrigin}/` } : {}),
        },
      });
    } catch {
      // Proceed even if backend logout fails
    }
  }

  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  cookieStore.set("session_id", "", {
    httpOnly: true,
    secure: isSecureCookie(frontendOrigin),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  redirect("/login");
}
