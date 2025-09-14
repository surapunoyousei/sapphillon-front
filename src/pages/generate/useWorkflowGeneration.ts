import React from "react";
import { clients } from "@/lib/grpc-clients";
import type {
  GenerateWorkflowResponse,
  RunWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb";

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
        append({ kind: "done" });
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
      const res = await clients.workflow.runWorkflow({
        workflowDefinition: latest.workflowDefinition,
      });
      setRunRes(res);
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
