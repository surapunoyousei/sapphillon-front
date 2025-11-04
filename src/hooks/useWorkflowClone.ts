import React from "react";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { create } from "@bufbuild/protobuf";
import { WorkflowSchema } from "@/gen/sapphillon/v1/workflow_pb";

export function useWorkflowClone() {
  const [cloning, setCloning] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const cloneWorkflow = React.useCallback(
    async (
      sourceWorkflow: Workflow,
      options?: {
        newName?: string;
        includeResults?: boolean;
      }
    ): Promise<Workflow | null> => {
      setCloning(true);
      setError(null);

      try {
        // 新しいワークフローオブジェクトを作成（IDを除外）
        const clonedWorkflow = create(WorkflowSchema, {
          displayName:
            options?.newName || `${sourceWorkflow.displayName} (コピー)`,
          description: sourceWorkflow.description
            ? `${sourceWorkflow.description} (複製)`
            : "複製されたワークフロー",
          workflowCode: sourceWorkflow.workflowCode,
          // 結果は通常複製しない
          workflowResults: options?.includeResults
            ? sourceWorkflow.workflowResults
            : [],
        });

        // TODO: バックエンドAPIに複製リクエストを送信
        // 現在は createWorkflow APIがないため、ローカルで返すのみ
        // const result = await clients.workflow.createWorkflow(clonedWorkflow);

        return clonedWorkflow;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        return null;
      } finally {
        setCloning(false);
      }
    },
    []
  );

  return {
    cloneWorkflow,
    cloning,
    error,
  } as const;
}
