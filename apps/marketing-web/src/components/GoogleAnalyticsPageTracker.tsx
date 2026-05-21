import { useEffect } from "react";
import { useLocation } from "wouter";

const GA_MEASUREMENT_ID = "G-V4EMSTYP4R";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalyticsPageTracker() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: location,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);

  return null;
}

