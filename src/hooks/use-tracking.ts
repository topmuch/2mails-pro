"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "twomails_session_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export function usePageTracking() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  // Track page view on route change (skip /dashboard and /api)
  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId();
    if (!pathname) return;
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return;
    }

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "pageview",
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        userAgent: ua,
        sessionId: sessionIdRef.current,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  const trackClick = useCallback((type: "whatsapp" | "phone" | "email") => {
    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId();
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "click",
        type,
        page: path,
        sessionId: sessionIdRef.current,
      }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return { trackClick };
}
