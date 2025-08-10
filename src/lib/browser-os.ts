import type { BrowserOSAPI } from "../types/window.d.ts";

export function getBrowserOS(): BrowserOSAPI {
  const api = (globalThis as unknown as {
    window?: Window & { BrowserOS?: BrowserOSAPI };
  }).window?.BrowserOS;
  if (!api) {
    throw new Error(
      "BrowserOS API is not available. Open this UI inside the Browser host or ensure the actor is loaded.",
    );
  }
  return api;
}
