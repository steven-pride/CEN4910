import "server-only";
import { cookies, headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol =
    h.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

// GET one of our own API routes from a Server Component
export async function apiGet<T>(path: string): Promise<T | null> {
  const [baseUrl, cookieStore] = await Promise.all([
    getBaseUrl(),
    cookies(),
  ]);

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });

  if (response.status === 400 || response.status === 404) {
    return null;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error || `Request failed (${response.status}).`
    );
  }

  return result.data as T;
}