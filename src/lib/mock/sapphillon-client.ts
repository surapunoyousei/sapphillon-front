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

// --- Configuration: toggle to use a real backend for testing ----------------
export const USE_REAL_BACKEND = false;
export const BACKEND_HOST = "localhost";
export const BACKEND_PORT = 50051;
export const BACKEND_BASE = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
export const BACKEND_GENERATE_PATH = "/api/v1/workflow/generate"; // POST { prompt }
export const BACKEND_FIX_PATH = "/api/v1/workflow/fix"; // POST { workflowDefinition, description }
// ----------------------------------------------------------------------------

export function createMockVersionClient(): VersionServiceClient {
  return {
    getVersion(_req: GetVersionRequest): Promise<GetVersionResponse> {
      return Promise.resolve({
        version: { version: "0.1.0-alpha (mock)" },
      } as GetVersionResponse);
    },
  };
}

async function fetchAndParseJsonOrNdjson<T>(
  url: string,
  body: unknown
): Promise<T[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    // Attempt to parse error message
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed?.message || parsed?.error || res.statusText);
    } catch {
      throw new Error(res.statusText || "Request failed");
    }
  }
  // Try parse whole-body JSON
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as T[];
    return [parsed as T];
  } catch {
    // Fallback: treat as NDJSON (one JSON object per line)
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const out: T[] = [];
    for (const line of lines) {
      try {
        out.push(JSON.parse(line) as T);
      } catch {
        // ignore unparsable lines
      }
    }
    return out;
  }
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
  if (USE_REAL_BACKEND) {
    // Real-backend passthrough implementation: return an AsyncIterable that will yield fetched items.
    return {
      generateWorkflow(
        req: GenerateWorkflowRequest
      ): AsyncIterable<GenerateWorkflowResponse> {
        const url = `${BACKEND_BASE}${BACKEND_GENERATE_PATH}`;
        // Return an async iterable that performs fetch when iterated
        return {
          async *[Symbol.asyncIterator]() {
            const arr =
              await fetchAndParseJsonOrNdjson<GenerateWorkflowResponse>(url, {
                prompt: req.prompt,
              });
            for (const item of arr) {
              yield item;
            }
          },
        };
      },
      fixWorkflow(req: FixWorkflowRequest): AsyncIterable<FixWorkflowResponse> {
        const url = `${BACKEND_BASE}${BACKEND_FIX_PATH}`;
        return {
          async *[Symbol.asyncIterator]() {
            const arr = await fetchAndParseJsonOrNdjson<FixWorkflowResponse>(
              url,
              {
                workflowDefinition: req.workflowDefinition,
                description: req.description,
              }
            );
            for (const item of arr) {
              yield item;
            }
          },
        };
      },
    };
  }

  return {
    generateWorkflow(
      req: GenerateWorkflowRequest
    ): AsyncIterable<GenerateWorkflowResponse> {
      const prompt = req.prompt?.trim() ?? "";
      if (!prompt) {
        return createAsyncIterable(
          [
            {
              workflowDefinition: "",
              status: { code: 3, message: "INVALID_ARGUMENT: prompt is empty" },
            } as GenerateWorkflowResponse,
          ],
          0
        );
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
            steps: [{ id: "start" }, { id: "action", prompt }, { id: "end" }],
          }),
        } as GenerateWorkflowResponse,
      ];
      return createAsyncIterable(partials, 120);
    },
    fixWorkflow(req: FixWorkflowRequest): AsyncIterable<FixWorkflowResponse> {
      const definition = req.workflowDefinition?.trim() ?? "";
      const description = req.description?.trim() ?? "";
      if (!definition || !description) {
        return createAsyncIterable(
          [
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
          ],
          0
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(definition);
      } catch {
        return createAsyncIterable(
          [
            {
              fixedWorkflowDefinition: definition,
              changeSummary: "",
              status: { code: 9, message: "FAILED_PRECONDITION: invalid JSON" },
            } as FixWorkflowResponse,
          ],
          0
        );
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
