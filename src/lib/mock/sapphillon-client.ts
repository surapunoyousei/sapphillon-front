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
import type {
  SapphillonClients,
  VersionServiceClient,
  WorkflowServiceClient,
} from "../mock/api.ts";

export function createMockVersionClient(): VersionServiceClient {
  return {
    getVersion(_req: GetVersionRequest): Promise<GetVersionResponse> {
      return Promise.resolve({
        version: { version: "0.1.0-alpha (mock)" },
      } as GetVersionResponse);
    },
  };
}

function createAsyncIterable<T>(items: T[], delayMs = 150): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) {
        await new Promise((r) => setTimeout(r, delayMs));
        yield item;
      }
    },
  };
}

export function createMockWorkflowClient(): WorkflowServiceClient {
  return {
    generateWorkflow(
      req: GenerateWorkflowRequest,
    ): AsyncIterable<GenerateWorkflowResponse> {
      const prompt = req.prompt?.trim() ?? "";
      if (!prompt) {
        return createAsyncIterable([
          {
            workflowDefinition: "",
            status: { code: 3, message: "INVALID_ARGUMENT: prompt is empty" },
          } as GenerateWorkflowResponse,
        ], 0);
      }
      const partials: GenerateWorkflowResponse[] = [
        {
          workflowDefinition: JSON.stringify({
            steps: [{ id: "start", info: "draft" }],
          }),
        } as GenerateWorkflowResponse,
        {
          workflowDefinition: JSON.stringify({
            steps: [{ id: "start" }, { id: "action" }],
          }),
        } as GenerateWorkflowResponse,
        {
          workflowDefinition: JSON.stringify({
            steps: [
              { id: "start" },
              { id: "action", prompt },
              { id: "end" },
            ],
          }),
        } as GenerateWorkflowResponse,
      ];
      return createAsyncIterable(partials, 120);
    },
    fixWorkflow(req: FixWorkflowRequest): AsyncIterable<FixWorkflowResponse> {
      const definition = req.workflowDefinition?.trim() ?? "";
      const description = req.description?.trim() ?? "";
      if (!definition || !description) {
        return createAsyncIterable([
          {
            fixedWorkflowDefinition: definition,
            changeSummary: "",
            status: {
              code: 3,
              message: !definition
                ? "INVALID_ARGUMENT: workflow_definition is empty"
                : "INVALID_ARGUMENT: description is empty",
            },
          } as FixWorkflowResponse,
        ], 0);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(definition);
      } catch {
        return createAsyncIterable([
          {
            fixedWorkflowDefinition: definition,
            changeSummary: "",
            status: { code: 9, message: "FAILED_PRECONDITION: invalid JSON" },
          } as FixWorkflowResponse,
        ], 0);
      }

      const fixed = {
        ...(typeof parsed === "object" && parsed
          ? (parsed as Record<string, unknown>)
          : {}),
        notes: ["fixed by mock", description],
      } as Record<string, unknown>;

      const partials: FixWorkflowResponse[] = [
        {
          fixedWorkflowDefinition: JSON.stringify({ ...fixed, draft: true }),
          changeSummary: "Collecting issues",
        } as FixWorkflowResponse,
        {
          fixedWorkflowDefinition: JSON.stringify(fixed),
          changeSummary: "Applied fixes",
        } as FixWorkflowResponse,
      ];
      return createAsyncIterable(partials, 120);
    },
  };
}

export function createMockClients(): SapphillonClients {
  return {
    version: createMockVersionClient(),
    workflow: createMockWorkflowClient(),
  };
}
