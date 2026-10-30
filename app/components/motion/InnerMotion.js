"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// A cached module still needs fresh listeners for every mounted page.
export default function InnerMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const page = document.querySelector("[data-motion-page]");
    if (!page) return;
    let cancelled = false;
    let cleanup;

    import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ "/scripts/inner-pages.js"
    )
      .then(({ setupInnerPage }) => {
        if (!cancelled && page.isConnected) cleanup = setupInnerPage(page);
      })
      .catch((error) => {
        // Content is visible without the optional motion enhancement.
        console.error("Unable to initialize inner-page motion:", error);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
