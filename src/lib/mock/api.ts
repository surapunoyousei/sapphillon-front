import type {
  GetVersionRequest,
  GetVersionResponse,
} from "@/gen/sapphillon/v1/version_pb.ts";
import type {
  FixWorkflowRequest,
  FixWorkflowResponse,
  GenerateWorkflowRequest,
  GenerateWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";

export interface VersionServiceClient {
  getVersion(req: GetVersionRequest): Promise<GetVersionResponse>;
}

export interface WorkflowServiceClient {
  generateWorkflow(
    req: GenerateWorkflowRequest,
  ): AsyncIterable<GenerateWorkflowResponse>;
  fixWorkflow(req: FixWorkflowRequest): AsyncIterable<FixWorkflowResponse>;
}

export type SapphillonClients = {
  version: VersionServiceClient;
  workflow: WorkflowServiceClient;
};
