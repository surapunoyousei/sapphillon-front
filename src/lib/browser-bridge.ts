// BrowserBridge responder: subscribes to backend requests and fulfills them via BrowserOS

import { createClient } from "@connectrpc/connect";
import { transport } from "./grpc-clients.ts";
import { getBrowserOS } from "./browser-os.ts";

import {
  type BridgeRequest,
  BrowserBridge as BrowserBridgeService,
  type CompleteRequest,
} from "@/gen/browser_bridge_pb.ts";

function client() {
  return createClient(BrowserBridgeService, transport);
}

async function handleRequest(req: BridgeRequest): Promise<CompleteRequest> {
  const os = getBrowserOS();
  const method = req.method || "";
  let success = false;
  let result_json: string | undefined;
  let error_message: string | undefined;

  try {
    const args = req.argsJson ? JSON.parse(req.argsJson) : {};

    switch (method) {
      case "browser_info.getAllContextData": {
        const r = await os.getAllContextData(args?.params ?? undefined);
        // Normalize: treat empty string as no data
        if (typeof r === "string" && r.trim().length > 0) {
          result_json = r;
          success = true;
        } else {
          result_json = undefined;
          success = false;
        }
        break;
      }
      default: {
        // Generic dynamic dispatch for future methods using prefix mapping
        // Example: "ws.getHTML" -> os.wsGetHTML(...), "tm.navigate" -> os.tmNavigate(...)
        const [prefix, name] = method.split(".");
        if (!prefix || !name) throw new Error(`Unknown method: ${method}`);
        const fnName = prefix + name.charAt(0).toUpperCase() + name.slice(1);
        const fn = (os as any)[fnName];
        if (typeof fn !== "function") {
          throw new Error(`Unsupported BrowserOS method: ${fnName}`);
        }

        // Convention: args_json provides { args: [] } for generic methods
        const argv: unknown[] = Array.isArray(args?.args) ? args.args : [];
        const out = await fn.apply(os, argv as any);
        result_json = out == null ? null : JSON.stringify(out);
        success = out != null || true; // consider void-return as success
      }
    }
  } catch (e) {
    error_message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    success = false;
  }

  return {
    id: req.id,
    success,
    resultJson: result_json,
    errorMessage: error_message,
  } as CompleteRequest;
}

export function startBrowserBridgeResponder() {
  const c = client();
  let stopped = false;
  (async () => {
    try {
      // Server-stream subscription
      // eslint-disable-next-line no-console
      console.debug("[BrowserBridge] subscribing to requests...");
      for await (const req of c.subscribeRequests({})) {
        // eslint-disable-next-line no-console
        console.debug("[BrowserBridge] received:", req.method, req.id);
        if (stopped) break;
        try {
          const done = await handleRequest(req);
          // eslint-disable-next-line no-console
          console.debug("[BrowserBridge] complete:", done.id, done.success);
          await c.complete(done);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[BrowserBridge] handler error", err);
          try {
            await c.complete({
              id: req.id,
              success: false,
              errorMessage: err instanceof Error
                ? `${err.name}: ${err.message}`
                : String(err),
            });
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      if (!stopped) {
        // eslint-disable-next-line no-console
        console.error("[BrowserBridge] subscribe failed", e);
      }
    }
  })();

  // Fallback long-poll loop for environments where gRPC-Web streaming is unreliable
  (async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let backoff = 300;
    const maxBackoff = 2000;
    while (!stopped) {
      try {
        // This unary call blocks server-side until a request is available
        const req = await c.waitForRequest({});
        // eslint-disable-next-line no-console
        console.debug("[BrowserBridge] polled:", req.method, req.id);
        const done = await handleRequest(req);
        await c.complete(done);
        backoff = 300;
      } catch (e) {
        // Idle or transient error; backoff and retry
        await sleep(backoff);
        backoff = Math.min(maxBackoff, Math.floor(backoff * 1.5));
      }
    }
  })();

  return () => {
    stopped = true;
  };
}
