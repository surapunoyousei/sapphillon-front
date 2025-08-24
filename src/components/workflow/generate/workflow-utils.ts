import type { CodeLine, DiffLine } from "./types.ts";

interface WorkflowCodeJson {
  codeRevision?: number;
  code?: unknown;
}
interface WorkflowJson {
  workflowCode?: unknown;
}

export const serializeWorkflow = (w: unknown): string => {
  if (!w) return "";
  try {
    return JSON.stringify(w, null, 2);
  } catch {
    return String(w);
  }
};

export function extractLatestWorkflowCode(workflowJson: string): string {
  if (!workflowJson) return "";
  try {
    const parsed: unknown = JSON.parse(workflowJson);
    if (!parsed || typeof parsed !== "object") return "";
    const wf = parsed as WorkflowJson;
    const codes = Array.isArray(wf.workflowCode)
      ? wf.workflowCode.filter(
          (c): c is WorkflowCodeJson => !!c && typeof c === "object"
        )
      : [];
    if (!codes.length) return "";
    let latest = codes[0];
    for (const c of codes) {
      if (
        typeof c.codeRevision === "number" &&
        (latest.codeRevision ?? -1) < c.codeRevision
      ) {
        latest = c;
      }
    }
    return typeof latest.code === "string" ? latest.code : "";
  } catch {
    return "";
  }
}

export function codeToLines(code: string): CodeLine[] {
  return code
    ? code
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((text, idx) => ({ number: idx + 1, text }))
    : [];
}

// Simple line diff (replace-if-different). For more advanced diffing, introduce Myers algo later.
export function buildSimpleDiff(prev: string, next: string): DiffLine[] {
  if (!prev && !next) return [];
  const a = prev.split(/\r?\n/);
  const b = next.split(/\r?\n/);
  const max = Math.max(a.length, b.length);
  const out: DiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const la = a[i];
    const lb = b[i];
    if (la === lb) {
      if (la !== undefined) out.push({ type: "same", text: la });
    } else {
      if (la !== undefined) out.push({ type: "removed", text: la });
      if (lb !== undefined) out.push({ type: "added", text: lb });
    }
  }
  return out.slice(0, 800);
}
