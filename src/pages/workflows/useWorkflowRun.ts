/**
 * @fileoverview 既存ワークフローの実行を管理するカスタムフック
 *
 * @module pages/workflows/useWorkflowRun
 */

import React from "react";
import { clients } from "@/lib/grpc-clients";
import type {
  RunWorkflowRequest,
  RunWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { create } from "@bufbuild/protobuf";
import {
  PermissionType,
  PermissionLevel,
  PermissionSchema,
  AllowedPermissionSchema,
} from "@/gen/sapphillon/v1/permission_pb";
import {
  WorkflowCodeSchema,
  WorkflowSchema,
} from "@/gen/sapphillon/v1/workflow_pb";

/**
 * ワークフロー実行中のイベント
 */
export type RunEvent = {
  /** イベント発生時刻（Unixタイムスタンプ） */
  t: number;
  /** イベント種別 */
  kind: "message" | "error" | "done";
  /** イベントのペイロード（種別により異なる） */
  payload?: unknown;
};

/**
 * useWorkflowRunフックの戻り値
 */
export interface UseWorkflowRunReturn {
  /** 現在実行中かどうか */
  running: boolean;
  /** 実行中に発生したイベントのリスト */
  events: RunEvent[];
  /** ワークフロー実行結果 */
  runRes: RunWorkflowResponse | null;
  /** ワークフローを実行（ID指定） */
  runById: (workflowId: string, workflowCodeId?: string) => Promise<void>;
  /** ワークフローを実行（定義指定） */
  runByDefinition: (workflow: Workflow) => Promise<void>;
  /** イベントログをクリア */
  clearEvents: () => void;
}

/**
 * ワークフロー実行フック
 *
 * 既存のワークフローを実行するための状態管理とロジックを提供します。
 *
 * @returns ワークフロー実行のための状態と関数
 */
export function useWorkflowRun(): UseWorkflowRunReturn {
  const [running, setRunning] = React.useState(false);
  const [events, setEvents] = React.useState<RunEvent[]>([]);
  const [runRes, setRunRes] = React.useState<RunWorkflowResponse | null>(null);

  const append = React.useCallback((e: Omit<RunEvent, "t">) => {
    setEvents((prev) => [...prev, { t: Date.now(), ...e }]);
  }, []);

  const runById = React.useCallback(
    async (workflowId: string, workflowCodeId?: string) => {
      if (running) return;
      setEvents([]);
      setRunRes(null);
      setRunning(true);
      try {
        append({ kind: "message", payload: { stage: "run", status: "start" } });
        const request: RunWorkflowRequest = {
          source: {
            case: "byId",
            value: {
              workflowId,
              workflowCodeId: workflowCodeId || "",
            },
          },
        };
        const res = await clients.workflow.runWorkflow(request);
        setRunRes(res);
        append({ kind: "message", payload: res });
        append({ kind: "done", payload: { stage: "run" } });
      } catch (e) {
        append({ kind: "error", payload: e });
      } finally {
        setRunning(false);
      }
    },
    [append, running]
  );

  const runByDefinition = React.useCallback(
    async (workflow: Workflow) => {
      if (running) return;
      setEvents([]);
      setRunRes(null);
      setRunning(true);
      try {
        append({ kind: "message", payload: { stage: "run", status: "start" } });
        // Ensure the workflow definition grants ALL permissions when running from this UI.
        // We add an AllowedPermission that grants PERMISSION_TYPE_ALLOW_ALL to all plugin functions.
        const allowAllPermissionMsg = create(PermissionSchema, {
          displayName: "ALLOW_ALL",
          description:
            "Granted by UI to allow full execution for testing/preview",
          permissionType: PermissionType.ALLOW_ALL,
          resource: [],
          permissionLevel: PermissionLevel.CRITICAL,
        });

        const allowedMsg = create(AllowedPermissionSchema, {
          pluginFunctionId: "*",
          permissions: [allowAllPermissionMsg],
        });

        // Clone the workflow definition and append allowedPermissions (message instances) to each WorkflowCode entry.
        const wfDef = create(WorkflowSchema, {
          ...workflow,
          workflowCode: (workflow.workflowCode || []).map((wc) =>
            create(WorkflowCodeSchema, {
              ...wc,
              allowedPermissions: [...(wc.allowedPermissions || []), allowedMsg],
            })
          ),
        });

        const res = await clients.workflow.runWorkflow({
          source: {
            case: "workflowDefinition",
            value: wfDef,
          },
        });
        setRunRes(res);
        append({ kind: "message", payload: res });
        append({ kind: "done", payload: { stage: "run" } });
      } catch (e) {
        append({ kind: "error", payload: e });
      } finally {
        setRunning(false);
      }
    },
    [append, running]
  );

  const clearEvents = React.useCallback(() => {
    setEvents([]);
  }, []);

  return {
    running,
    events,
    runRes,
    runById,
    runByDefinition,
    clearEvents,
  } as const;
}

