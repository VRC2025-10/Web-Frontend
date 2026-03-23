"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDevelopmentMockEnabled } from "@/lib/api/dev-mock";

function resolveFrontendOrigin(headerStore: Headers): string | null {
  const configuredOrigin =
    process.env.FRONTEND_ORIGIN?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!forwardedHost) {
    return null;
  }

  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${forwardedProto}://${forwardedHost}`;
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
