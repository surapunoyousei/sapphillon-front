import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";

// Helper to build objects compatible with the generated Workflow message.
// The generated protobuf Message may expect additional internal fields
// (e.g. $typeName) in some contexts; for tests we provide the minimal
// shape used by components: `workflowCode: Array<{ code: string }>`.

export function makeWorkflowMock(codeEntries: string[] | string): Workflow {
  const codes = Array.isArray(codeEntries) ? codeEntries : [codeEntries];
  const obj = {
    workflowCode: codes.map((c) => ({ code: c })),
  } as unknown as Workflow;
  return obj;
}
