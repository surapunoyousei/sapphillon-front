import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

// Import service definition that you want to connect to.
import { VersionService } from "../gen/sapphillon/v1/version_pb.ts";

// Use a relative base URL and let the dev server or a grpc-web proxy handle
// grpc-web -> gRPC translation and CORS headers.
// - In development: Vite can proxy /api to a grpc-web proxy (e.g. grpcwebproxy or Envoy).
// - In production: point this to your grpc-web gateway (not the raw gRPC server port).
const transport = createConnectTransport({
  baseUrl: "http://localhost:50051",
});

export const versionClient = createClient(VersionService, transport);
