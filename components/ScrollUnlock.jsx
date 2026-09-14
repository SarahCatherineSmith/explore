"use client";

import { useEffect } from "react";

// The root layout keeps html/body clipped (see globals.css) because the ring
// is fixed full-screen and never scrolls. A project page is ordinary
// scrolling content, so unlock it for as long as one is mounted and hand
// the previous value back on the way out, rather than assuming "hidden".
export default function ScrollUnlock() {
  useEffect(() => {
    const html = document.documentElement.style;
    const body = document.body.style;
    const prevHtml = html.overflow;
    const prevBody = body.overflow;
    html.overflow = "auto";
    body.overflow = "auto";
    return () => {
      html.overflow = prevHtml;
      body.overflow = prevBody;
    };
  }, []);

  return null;
}
