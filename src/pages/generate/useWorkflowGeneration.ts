import React from "react";
import { clients } from "@/lib/grpc-clients";
import type {
  GenerateWorkflowResponse,
  RunWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import {
  PermissionType,
  PermissionLevel,
  PermissionSchema,
  AllowedPermissionSchema,
} from "@/gen/sapphillon/v1/permission_pb";
import { create } from "@bufbuild/protobuf";
import {
  WorkflowCodeSchema,
  WorkflowSchema,
} from "@/gen/sapphillon/v1/workflow_pb";

export type GenerationEvent = {
  t: number;
  kind: "message" | "error" | "done";
  payload?: unknown;
};

export function useWorkflowGeneration() {
  const [streaming, setStreaming] = React.useState(false);
  const [events, setEvents] = React.useState<GenerationEvent[]>([]);
  const [latest, setLatest] = React.useState<GenerateWorkflowResponse | null>(
    null
  );
  const [runRes, setRunRes] = React.useState<RunWorkflowResponse | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const append = React.useCallback((e: Omit<GenerationEvent, "t">) => {
    setEvents((prev) => [...prev, { t: Date.now(), ...e }]);
  }, []);

  const start = React.useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || streaming) return;
      setEvents([]);
      setRunRes(null);
      setLatest(null);
      setStreaming(true);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        for await (const msg of clients.workflow.generateWorkflow(
          { prompt },
          { signal: ac.signal }
        )) {
          setLatest(msg);
          append({ kind: "message", payload: msg });
        }
        append({ kind: "done", payload: { stage: "generate" } });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        append({ kind: "error", payload: e });
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [append, streaming]
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearEvents = React.useCallback(() => {
    setEvents([]);
  }, []);

  const runLatest = React.useCallback(async () => {
    if (!latest?.workflowDefinition) return;
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
        ...latest.workflowDefinition,
        workflowCode: (latest.workflowDefinition.workflowCode || []).map((wc) =>
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
    }
  }, [latest, append]);

  return {
    streaming,
    events,
    latest,
    runRes,
    start,
    stop,
    clearEvents,
    runLatest,
  } as const;
}
