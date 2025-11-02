import React from "react";
import { clients } from "@/lib/grpc-clients";
import type { GetWorkflowRequest } from "@/gen/sapphillon/v1/workflow_service_pb";
import { create } from "@bufbuild/protobuf";
import { GetWorkflowRequestSchema } from "@/gen/sapphillon/v1/workflow_service_pb";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";

export function useWorkflow(workflowId: string) {
  const [workflow, setWorkflow] = React.useState<Workflow | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(undefined);

  const fetchWorkflow = React.useCallback(async () => {
    if (!workflowId) return;

    setLoading(true);
    setError(undefined);
    try {
      const request: GetWorkflowRequest = create(GetWorkflowRequestSchema, {
        workflowId,
      });

      const response = await clients.workflow.getWorkflow(request);

      if (response.status?.code !== 0 && response.status?.code !== undefined) {
        throw new Error(response.status.message || "Failed to fetch workflow");
      }

      setWorkflow(response.workflow || null);
    } catch (e) {
      setError(e);
      setWorkflow(null);
      console.error("Failed to fetch workflow:", e);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  React.useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    loading,
    error,
    refetch: fetchWorkflow,
  } as const;
}
