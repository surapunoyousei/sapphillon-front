/**
 * @file BrowserOS API wrapper
 * This file provides a wrapper around the BrowserOS API for easier use within the application.
 */
import { getBrowserOS } from "./browser-os.ts";

// Keep track of the last created tab instance.
let currentInstanceId: string | null = null;

/**
 * Opens a new tab with the specified URL.
 * @param url The URL to open.
 */
export async function openUrl(url: string): Promise<void> {
  const api = getBrowserOS();
  console.log(`BrowserOS: Opening URL: ${url}`);
  currentInstanceId = await api.tmCreateInstance(url);
  if (!currentInstanceId) {
    throw new Error("Failed to create a new tab instance.");
  }
}

/**
 * Searches on a search engine with the specified query.
 * @param query The search query.
 */
export async function search(query: string): Promise<void> {
  const api = getBrowserOS();
  console.log(`BrowserOS: Searching for: ${query}`);
  const searchUrl = `https://www.google.com/search?q=${
    encodeURIComponent(query)
  }`;
  currentInstanceId = await api.tmCreateInstance(searchUrl);
  if (!currentInstanceId) {
    throw new Error("Failed to create a new tab instance for search.");
  }
}

/**
 * Clicks an element on the current page.
 * @param selector The CSS selector of the element to click.
 */
export async function clickElement(selector: string): Promise<void> {
  if (!currentInstanceId) {
    throw new Error("No active tab instance to click an element in.");
  }
  const api = getBrowserOS();
  console.log(`BrowserOS: Clicking element: ${selector}`);
  const success = await api.tmClickElement(currentInstanceId, selector);
  if (!success) {
    console.warn(`Failed to click element with selector: ${selector}`);
  }
}

/**
 * Takes a screenshot of the current viewport.
 * @returns A promise that resolves to a base64 encoded PNG data URL, or null on error.
 */
export async function takeScreenshot(): Promise<string> {
  if (!currentInstanceId) {
    throw new Error("No active tab instance to take a screenshot from.");
  }
  const api = getBrowserOS();
  console.log("BrowserOS: Taking screenshot");
  const dataUrl = await api.tmTakeScreenshot(currentInstanceId);
  if (!dataUrl) {
    throw new Error("Failed to take screenshot.");
  }
  return dataUrl;
}

/**
 * Waits for a specified amount of time.
 * @param ms The number of milliseconds to wait.
 */
export async function wait(ms: number): Promise<void> {
  if (!currentInstanceId) {
    // It's okay to wait even if there's no active tab.
    console.log(`BrowserOS: Waiting for ${ms}ms (no active tab)`);
    await new Promise((resolve) => setTimeout(resolve, ms));
    return;
  }
  const api = getBrowserOS();
  console.log(`BrowserOS: Waiting for ${ms}ms`);
  await api.tmWait(ms);
}
