import { describe, it, expect, vi } from "vitest";
import {
  requestIdInterceptor,
  metadataInterceptor,
  loggingInterceptor,
  errorNormalizeInterceptor,
} from "./grpc-clients";
import type {
  UnaryRequest,
  UnaryResponse,
} from "@connectrpc/connect";
import { ConnectError, createContextValues } from "@connectrpc/connect";
import type { DescMessage, DescMethodUnary, Message } from "@bufbuild/protobuf";
import { create } from "@bufbuild/protobuf";
import {
  VersionService,
  GetVersionRequestSchema,
  GetVersionResponseSchema,
  VersionSchema,
} from "@/gen/sapphillon/v1/version_pb";

type UReq = UnaryRequest<DescMessage, DescMessage>;
type URes = UnaryResponse<DescMessage, DescMessage>;

function makeReq(): UReq {
  const ctrl = new AbortController();
  const method =
    VersionService.method.getVersion as unknown as DescMethodUnary<DescMessage, DescMessage>;
  return {
    stream: false,
    header: new Headers(),
    requestMethod: "POST",
    url: "http://localhost:50051/sapphillon.v1.VersionService/GetVersion",
    signal: ctrl.signal,
    contextValues: createContextValues(),
    service: VersionService,
    method,
    message: create(GetVersionRequestSchema) as unknown as Message,
  };
}

function makeRes(): URes {
  const method =
    VersionService.method.getVersion as unknown as DescMethodUnary<DescMessage, DescMessage>;
  return {
    stream: false,
    header: new Headers(),
    trailer: new Headers(),
    service: VersionService,
    method,
    message: create(GetVersionResponseSchema, {
      version: create(VersionSchema, { version: "v0.0.0" }),
    }) as unknown as Message,
  };
}

describe("grpc interceptors", () => {
  it("requestIdInterceptor adds x-request-id when missing", async () => {
    const interceptor = requestIdInterceptor();
    const req = makeReq();
    type NextFn = Parameters<ReturnType<typeof requestIdInterceptor>>[0];
    const res = makeRes();
    const next: NextFn = async () => res;
    await interceptor(next)(req);

    expect(req.header.has("x-request-id")).toBe(true);
    const val = req.header.get("x-request-id");
    expect(val && val.length).toBeGreaterThan(0);
  });

  it("metadataInterceptor sets headers from getters lazily", async () => {
    const interceptor = metadataInterceptor({
      "x-foo": () => "bar",
      "x-empty": () => undefined,
    });
    const req = makeReq();
    type NextFn = Parameters<ReturnType<typeof metadataInterceptor>>[0];
    const res = makeRes();
    const next: NextFn = async () => res;
    await interceptor(next)(req);

    expect(req.header.get("x-foo")).toBe("bar");
    expect(req.header.has("x-empty")).toBe(false);
  });

  it("errorNormalizeInterceptor wraps unknown errors with ConnectError", async () => {
    const interceptor = errorNormalizeInterceptor();
    const req = makeReq();
    type NextFn = Parameters<ReturnType<typeof errorNormalizeInterceptor>>[0];
    const next: NextFn = async () => {
      throw "boom";
    };
    await expect(interceptor(next)(req)).rejects.toBeInstanceOf(ConnectError);
  });

  it("loggingInterceptor logs on success and error", async () => {
    const interceptor = loggingInterceptor();
    const req = makeReq();

    const dbg = vi.spyOn(console, "debug").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    // success
    type NextFn = Parameters<ReturnType<typeof loggingInterceptor>>[0];
    const res = makeRes();
    const nextOk: NextFn = async () => res;
    await interceptor(nextOk)(req);
    expect(dbg).toHaveBeenCalled();
    const lastDbg = String(dbg.mock.calls[dbg.mock.calls.length - 1]?.[0] ?? "");
    expect(lastDbg).toContain("VersionService.GetVersion");

    // failure
    const req2 = makeReq();
    const nextFail: NextFn = async () => {
      throw new Error("nope");
    };
    await expect(interceptor(nextFail)(req2)).rejects.toThrowError("nope");
    expect(err).toHaveBeenCalled();

    dbg.mockRestore();
    err.mockRestore();
  });
});
