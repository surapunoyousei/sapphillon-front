/**
 * Global browser-automation API injected into window as `window.BrowserOS`.
 *
 * Naming convention:
 * - "ws*" methods operate on a HiddenFrame (headless, offscreen content)
 * - "tm*" methods operate on visible tabs managed by the Tab Manager
 *
 * Notes:
 * - Methods that interact with page DOM run in the page context via a JSWindowActor.
 * - Some sites enforce strict CSP. In such cases, `executeScript` may be blocked
 *   (and by design this API never returns a value for script execution; it is
 *   side-effect only). Prefer dedicated getters like `getValue`, `getElementText`, etc.
 */
export interface BrowserOSAPI {
  // Browser Info
  /**
   * Returns a JSON string containing recent history, tabs and downloads (or null on error).
   */
  getAllContextData(
    params?: { historyLimit?: number; downloadLimit?: number },
  ): Promise<string | null>;

  // WebScraper (HiddenFrame)
  /** Create a new HiddenFrame instance and return its instanceId. */
  wsCreate(): Promise<string>;
  /** Destroy an existing HiddenFrame instance. */
  wsDestroy(instanceId: string): Promise<void>;
  /** Navigate the HiddenFrame to the given URL and wait for load completion. */
  wsNavigate(instanceId: string, url: string): Promise<void>;
  /** Get current URI of the HiddenFrame (null if still about:blank). */
  wsGetURI(instanceId: string): Promise<string | null>;
  /** Get full document HTML (outerHTML of the documentElement). */
  wsGetHTML(instanceId: string): Promise<string | null>;
  /** Get the first matched element's outerHTML by CSS selector. */
  wsGetElement(instanceId: string, selector: string): Promise<string | null>;
  /** Get the first matched element's textContent by CSS selector. */
  wsGetElementText(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Get the first matched input/textarea value by CSS selector. */
  wsGetValue(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Synthesize a click on the first matched element by CSS selector. */
  wsClickElement(instanceId: string, selector: string): Promise<boolean>;
  /** Wait until an element matching the selector appears or timeout elapses. */
  wsWaitForElement(
    instanceId: string,
    selector: string,
    timeout?: number,
  ): Promise<boolean>;
  /**
   * Execute arbitrary JavaScript in the page context (side-effect only).
   * This function never returns the evaluated value. CSP may block execution on some sites.
   */
  wsExecuteScript(instanceId: string, script: string): Promise<void>;
  /** Capture a PNG dataURL screenshot of the current viewport. */
  wsTakeScreenshot(instanceId: string): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of a specific element. */
  wsTakeElementScreenshot(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of the full page. */
  wsTakeFullPageScreenshot(instanceId: string): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of a specific region. */
  wsTakeRegionScreenshot(
    instanceId: string,
    rect?: { x?: number; y?: number; width?: number; height?: number },
  ): Promise<string | null>;
  /** Fill inputs/textareas by a map of selector -> value (fires input/change/blur). */
  wsFillForm(
    instanceId: string,
    formData: Record<string, string>,
  ): Promise<boolean>;
  /** Submit a form (selector may be a form or a descendant element contained in a form). */
  wsSubmit(
    instanceId: string,
    selector: string,
  ): Promise<boolean>;

  // Tab Manager (Visible tabs)
  /** Open a new visible tab and return its instanceId (Tab Manager). */
  tmCreateInstance(
    url: string,
    options?: { inBackground?: boolean },
  ): Promise<string>;
  /** Attach to an existing visible tab by its browserId and return a new instanceId. */
  tmAttachToTab(browserId: string): Promise<string | null>;
  /** Get visible tabs list as a JSON string. */
  tmListTabs(): Promise<string | null>;
  /** Get aggregated information (URI, title, favicon, HTML, screenshot) as JSON string. */
  tmGetInstanceInfo(instanceId: string): Promise<string | null>;
  /** Close the tab associated with the instance. */
  tmDestroyInstance(instanceId: string): Promise<void>;
  /** Navigate the visible tab to the given URL and wait for load completion. */
  tmNavigate(instanceId: string, url: string): Promise<void>;
  /** Get current URI of the visible tab. */
  tmGetURI(instanceId: string): Promise<string>;
  /** Get full document HTML (outerHTML of the documentElement). */
  tmGetHTML(instanceId: string): Promise<string | null>;
  /** Get the first matched element's outerHTML by CSS selector. */
  tmGetElement(instanceId: string, selector: string): Promise<string | null>;
  /** Get the first matched element's textContent by CSS selector. */
  tmGetElementText(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Get the first matched input/textarea value by CSS selector. */
  tmGetValue(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Synthesize a click on the first matched element by CSS selector. */
  tmClickElement(instanceId: string, selector: string): Promise<boolean>;
  /** Wait until an element matching the selector appears or timeout elapses. */
  tmWaitForElement(
    instanceId: string,
    selector: string,
    timeout?: number,
  ): Promise<boolean>;
  /**
   * Execute arbitrary JavaScript in the page context (side-effect only).
   * This function never returns the evaluated value. CSP may block execution on some sites.
   */
  tmExecuteScript(instanceId: string, script: string): Promise<void>;
  /** Capture a PNG dataURL screenshot of the current viewport. */
  tmTakeScreenshot(instanceId: string): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of a specific element. */
  tmTakeElementScreenshot(
    instanceId: string,
    selector: string,
  ): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of the full page. */
  tmTakeFullPageScreenshot(instanceId: string): Promise<string | null>;
  /** Capture a PNG dataURL screenshot of a specific region. */
  tmTakeRegionScreenshot(
    instanceId: string,
    rect?: { x?: number; y?: number; width?: number; height?: number },
  ): Promise<string | null>;
  /** Fill inputs/textareas by a map of selector -> value (fires input/change/blur). */
  tmFillForm(
    instanceId: string,
    formData: Record<string, string>,
  ): Promise<boolean>;
  /** Submit a form (selector may be a form or a descendant element contained in a form). */
  tmSubmit(
    instanceId: string,
    selector: string,
  ): Promise<boolean>;
  /** Sleep helper. */
  tmWait(ms: number): Promise<void>;
}

declare interface Window {
  BrowserOS?: BrowserOSAPI;
}
