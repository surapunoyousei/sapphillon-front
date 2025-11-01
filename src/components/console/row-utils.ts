import type { GenerationEvent } from "./utils";
import { stringifyPayload } from "./utils";

export type Row =
  | { type: "sep"; label: string }
  | { type: "log"; event: GenerationEvent };

export function toRows(events: GenerationEvent[]): Row[] {
  const rows: Row[] = [];
  for (const e of events) {
    if (e.kind === "message") {
      const p = e.payload as unknown;
      if (
        p &&
        typeof p === "object" &&
        "stage" in p &&
        (p as { stage?: unknown }).stage === "run" &&
        "status" in p &&
        (p as { status?: unknown }).status === "start"
      ) {
        rows.push({ type: "sep", label: "Run started" });
      }

      if (p && typeof p === "object" && "workflowResult" in p) {
        const wr = (p as Record<string, unknown>).workflowResult as unknown;
        if (
          wr && typeof wr === "object" &&
          "result" in (wr as Record<string, unknown>)
        ) {
          const resultVal = (wr as Record<string, unknown>).result as unknown;
          if (typeof resultVal === "string" && /\r?\n/.test(resultVal)) {
            const lines = resultVal.replaceAll("\r\n", "\n").split("\n");
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line.trim() === "") continue;
              const lineEvent: GenerationEvent = {
                t: e.t + i * 1e-9,
                kind: e.kind,
                payload: line,
              };
              rows.push({ type: "log", event: lineEvent });
            }
            continue;
          }
        }
      }

      // message のペイロードが文字列で複数行なら、各行に分割（空白行はスキップ）
      if (typeof p === "string" && /\r?\n/.test(p)) {
        const lines = p.replaceAll("\r\n", "\n").split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === "") continue;
          const lineEvent: GenerationEvent = {
            t: e.t + i * 1e-9,
            kind: e.kind,
            payload: line,
          };
          rows.push({ type: "log", event: lineEvent });
        }
        continue;
      }
    }
    if (e.kind === "done") {
      const payload = e.payload as unknown;
      const stage = payload && typeof payload === "object" && "stage" in payload
        ? (payload as { stage?: unknown }).stage
        : undefined;
      if (stage === "run") rows.push({ type: "sep", label: "Run completed" });
      if (stage === "generate") {
        rows.push({ type: "sep", label: "Generation completed" });
      }
    }
    rows.push({ type: "log", event: e });
  }
  return rows;
}

export function summarize(e: GenerationEvent): string {
  if (e.kind === "error") {
    const err = e.payload as unknown;
    const msg = typeof err === "object" && err && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : String(err);
    return msg || "Error";
  }
  if (e.kind === "done") {
    const p = e.payload as unknown;
    const stage = p && typeof p === "object" && "stage" in p
      ? (p as { stage?: unknown }).stage
      : undefined;
    if (stage === "run") return "Run completed";
    if (stage === "generate") return "Generation completed";
    return "Done";
  }
  // message
  const p = e.payload as unknown;
  if (p && typeof p === "object") {
    if (
      "stage" in p && (p as { stage?: unknown }).stage === "run" &&
      "status" in p && (p as { status?: unknown }).status === "start"
    ) return "Run started";
    if (
      "workflowResult" in p &&
      (p as { workflowResult?: unknown }).workflowResult
    ) {
      const r = (p as { workflowResult?: unknown }).workflowResult;
      const displayName = r && typeof r === "object" && "displayName" in r
        ? (r as Record<string, unknown>).displayName
        : undefined;
      const id = r && typeof r === "object" && "id" in r
        ? (r as Record<string, unknown>).id
        : undefined;
      const resultType = r && typeof r === "object" && "resultType" in r
        ? (r as Record<string, unknown>).resultType
        : undefined;
      const exitCode = r && typeof r === "object" && "exitCode" in r
        ? (r as Record<string, unknown>).exitCode
        : undefined;
      const name = (displayName || id || "Run") as string;
      const type = resultType === 1 ? "FAILURE" : "SUCCESS";
      const exit = typeof exitCode === "number" ? `, exit ${exitCode}` : "";
      // Prefer textual result if present
      const resultStr = r && typeof r === "object" && "result" in r
        ? (r as Record<string, unknown>).result
        : undefined;
      if (typeof resultStr === "string" && resultStr.trim()) {
        const txt = resultStr.trim();
        return txt.length > 160 ? txt.slice(0, 160) + "…" : txt;
      }
      return `${name}: ${type}${exit}`;
    }
    if (
      "workflowDefinition" in p &&
      (p as { workflowDefinition?: unknown }).workflowDefinition
    ) return "Updated workflow definition";
  }
  try {
    const s = stringifyPayload(p);
    return s.length > 120 ? s.slice(0, 120) + "…" : s;
  } catch {
    return "message";
  }
}

