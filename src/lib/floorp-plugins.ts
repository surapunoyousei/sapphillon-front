// Floorp plugin gRPC clients and convenience wrappers
//
// This module provides typed wrapper functions around the three Floorp plugins
// integrated as gRPC services on the backend: browser_info, tab_manager, and webscraper.
//
// Requirements to use:
// - Run codegen so the generated modules exist under `src/gen`:
//     deno task gen
// - Ensure the gRPC server is reachable from the browser over gRPC-Web
//   and set `VITE_GRPC_BASE_URL` if needed (defaults to http://localhost:50051).

import { createClient } from "@connectrpc/connect";
import { transport } from "./grpc-clients.ts";

// Generated service + message types
// Note: These files are produced by `buf generate` using buf.gen.yaml
// from proto under `vendor/Floorp_API/proto`.
import type { Message } from "@bufbuild/protobuf";

// browser_info
import {
  BrowserInfoService,
  type GetAllContextDataRequest,
  type GetAllContextDataResponse,
} from "@/gen/sapphillon/v1/browser_info_pb.ts";

// tab_manager
import {
  TabManagerService as TabManagerServiceApi,
  type CreateInstanceRequest as TM_CreateInstanceRequest,
  type CreateInstanceResponse as TM_CreateInstanceResponse,
  type ListTabsRequest as TM_ListTabsRequest,
  type ListTabsResponse as TM_ListTabsResponse,
  type NavigateRequest as TM_NavigateRequest,
  type NavigateResponse as TM_NavigateResponse,
  type GetHTMLRequest as TM_GetHTMLRequest,
  type GetHTMLResponse as TM_GetHTMLResponse,
} from "@/gen/sapphillon/v1/tab_manager_pb.ts";

// webscraper (package: sapphillon.v1.floorpWebscraper)
// Note: Current proto defines service name as TabManagerService in its package.
// We alias it locally as WebscraperService.
import {
  TabManagerService as WebscraperServiceApi,
  type CreateInstanceRequest as WS_CreateInstanceRequest,
  type CreateInstanceResponse as WS_CreateInstanceResponse,
  type GetHTMLRequest as WS_GetHTMLRequest,
  type GetHTMLResponse as WS_GetHTMLResponse,
} from "@/gen/sapphillon/v1/webscraper_pb.ts";

// -----------------------------
// Types
// -----------------------------

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export interface BrowserContextDataJson extends Record<string, unknown> {}

// -----------------------------
// Clients (lazily created per-call)
// -----------------------------

function browserInfoClient() {
  return createClient(BrowserInfoService, transport);
}

function tabManagerClient() {
  return createClient(TabManagerServiceApi, transport);
}

function webscraperClient() {
  return createClient(WebscraperServiceApi, transport);
}

// -----------------------------
// BrowserInfo wrappers
// -----------------------------

export async function browserInfoGetAllContextData(input?: {
  historyLimit?: number;
  downloadLimit?: number;
}): Promise<{
  raw: GetAllContextDataResponse;
  parsed: BrowserContextDataJson | null;
}> {
  const req: GetAllContextDataRequest = {} as Message as GetAllContextDataRequest;
  if (input && (input.historyLimit != null || input.downloadLimit != null)) {
    req.params = {} as Message as NonNullable<GetAllContextDataRequest["params"]>;
    if (input.historyLimit != null) req.params.historyLimit = input.historyLimit;
    if (input.downloadLimit != null) req.params.downloadLimit = input.downloadLimit;
  }
  const res = await browserInfoClient().getAllContextData(req);
  let parsed: BrowserContextDataJson | null = null;
  if (res.contextData) {
    try {
      parsed = JSON.parse(res.contextData) as BrowserContextDataJson;
    } catch (_err) {
      parsed = null;
    }
  }
  return { raw: res, parsed };
}

// -----------------------------
// TabManager wrappers
// -----------------------------

export async function tabManagerCreateInstance(url: string, opts?: { inBackground?: boolean }): Promise<{
  instanceId: string;
  raw: TM_CreateInstanceResponse;
}> {
  const req: TM_CreateInstanceRequest = {
    url,
    options: opts?.inBackground != null ? { inBackground: opts.inBackground } : undefined,
  } as TM_CreateInstanceRequest;
  const res = await tabManagerClient().createInstance(req);
  return { instanceId: res.instanceId, raw: res };
}

export async function tabManagerListTabs(): Promise<TM_ListTabsResponse> {
  const req: TM_ListTabsRequest = {} as TM_ListTabsRequest;
  return await tabManagerClient().listTabs(req);
}

export async function tabManagerNavigate(instanceId: string, url: string): Promise<TM_NavigateResponse> {
  const req: TM_NavigateRequest = { instanceId, url } as TM_NavigateRequest;
  return await tabManagerClient().navigate(req);
}

export async function tabManagerGetHTML(instanceId: string): Promise<string | null> {
  const req: TM_GetHTMLRequest = { instanceId } as TM_GetHTMLRequest;
  const res: TM_GetHTMLResponse = await tabManagerClient().getHTML(req);
  return res.html ?? null;
}

// -----------------------------
// Webscraper wrappers
// -----------------------------

export async function webscraperCreateInstance(url: string, opts?: { inBackground?: boolean }): Promise<{
  instanceId: string;
  raw: WS_CreateInstanceResponse;
}> {
  const req: WS_CreateInstanceRequest = {
    url,
    options: opts?.inBackground != null ? { inBackground: opts.inBackground } : undefined,
  } as WS_CreateInstanceRequest;
  const res = await webscraperClient().createInstance(req);
  return { instanceId: res.instanceId, raw: res };
}

export async function webscraperGetHTML(instanceId: string): Promise<string | null> {
  const req: WS_GetHTMLRequest = { instanceId } as WS_GetHTMLRequest;
  const res: WS_GetHTMLResponse = await webscraperClient().getHTML(req);
  return res.html ?? null;
}

// -----------------------------
// Example usage (not imported by default)
// -----------------------------
// import { browserInfoGetAllContextData, tabManagerListTabs } from "./floorp-plugins.ts";
// const info = await browserInfoGetAllContextData({ historyLimit: 10 });
// const tabs = await tabManagerListTabs();

