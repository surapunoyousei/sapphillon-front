import type {
  GetVersionRequest,
  GetVersionResponse,
} from "@/gen/sapphillon/v1/version_pb.ts";

export function createMockVersionClient() {
  return {
    async getVersion(_req: GetVersionRequest): Promise<GetVersionResponse> {
      return {
        version: { version: "0.1.0-alpha (mock)" },
      } as GetVersionResponse;
    },
  };
}
