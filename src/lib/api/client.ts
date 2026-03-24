import { cookies, headers } from "next/headers";
import { isDevelopmentMockEnabled, resolveDevelopmentMock, type MockApiErrorLike } from "./dev-mock";

const INTERNAL_API_BASE = process.env.INTERNAL_API_URL || "http://backend:8080";

interface FetchOptions extends Omit<RequestInit, "headers"> {
  withCookies?: boolean;
  timeout?: number;
  errorMode?: "navigate" | "throw";
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

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

function isUnsafeMethod(method: string | undefined): boolean {
  const normalizedMethod = (method ?? "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(normalizedMethod);
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    withCookies = false,
    timeout = 10_000,
    errorMode = "navigate",
    next,
    ...fetchOptions
  } = options;

  const url = `${INTERNAL_API_BASE}${path}`;
  const isFormDataBody = fetchOptions.body instanceof FormData;

  const requestHeaders: Record<string, string> = {};

  if (!isFormDataBody && fetchOptions.body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (withCookies) {
    const cookieStore = await cookies();
    requestHeaders["Cookie"] = cookieStore.toString();
  }

  if (isUnsafeMethod(fetchOptions.method)) {
    const headerStore = await headers();
    const frontendOrigin = resolveFrontendOrigin(headerStore);

    if (frontendOrigin) {
      requestHeaders["Origin"] = frontendOrigin;
      requestHeaders["Referer"] = `${frontendOrigin}/`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const getRetryPath = (pathname: "/too-many-requests" | "/service-unavailable", retryAfter: string | null) => {
    if (!retryAfter) {
      return pathname;
    }

    const query = new URLSearchParams({ retryAfter }).toString();
    return `${pathname}?${query}`;
  };

  const handleErrorStatus = async (status: number, retryAfter: string | null = null) => {
    if (status === 401) {
      const { unauthorized } = await import("next/navigation");
      unauthorized();
    }

    if (status === 403) {
      const { forbidden } = await import("next/navigation");
      forbidden();
    }

    if (status === 404) {
      const { notFound } = await import("next/navigation");
      notFound();
    }

    if (status === 429) {
      const { redirect } = await import("next/navigation");
      redirect(getRetryPath("/too-many-requests", retryAfter));
    }

    if ([502, 503, 504].includes(status)) {
      const { redirect } = await import("next/navigation");
      redirect(getRetryPath("/service-unavailable", retryAfter));
    }
  };

  const isMockError = (value: unknown): value is MockApiErrorLike => {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<MockApiErrorLike>;
    return typeof candidate.status === "number" && typeof candidate.code === "string";
  };

  try {
    if (isDevelopmentMockEnabled()) {
      try {
        return await resolveDevelopmentMock<T>(path, {
          ...fetchOptions,
          headers: requestHeaders,
        });
      } catch (error) {
        if (isMockError(error)) {
          await handleErrorStatus(error.status);
          throw new ApiError(error.status, error.code, error.message);
        }

        throw error;
      }
    }

    const res = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
      ...(next ? { next } : {}),
    }).catch(async () => {
      const { redirect } = await import("next/navigation");
      redirect("/service-unavailable");
      throw new Error("Unreachable");
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));

      if (errorMode === "navigate") {
        await handleErrorStatus(res.status, res.headers.get("retry-after"));
      }

      throw new ApiError(
        res.status,
        errorBody.error || errorBody.code || "UNKNOWN",
        errorBody.message
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${code}`);
    this.name = "ApiError";
  }
}
