import { create } from "@bufbuild/protobuf";
import type { ServiceImpl } from "@connectrpc/connect";
import { VersionService } from "@/gen/sapphillon/v1/version_pb";
import type { GetVersionResponse } from "@/gen/sapphillon/v1/version_pb";
import {
  GetVersionResponseSchema,
  VersionSchema,
} from "@/gen/sapphillon/v1/version_pb";

/**
 * VersionServiceのモックハンドラー実装
 */
export const versionHandler: ServiceImpl<typeof VersionService> = {
  async getVersion(): Promise<GetVersionResponse> {
    return create(GetVersionResponseSchema, {
      version: create(VersionSchema, {
        version: "v1.0.0-mock",
      }),
    });
  },
};
