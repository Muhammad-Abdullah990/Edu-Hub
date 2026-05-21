import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixelPageTracker() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window.fbq !== "function") {
      return;
    }

    window.fbq("track", "PageView");
  }, [location]);

  return null;
}

