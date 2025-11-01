import type { GenerationEvent } from "./utils";

export interface KindMeta {
  palette: "red" | "green" | "floorp";
  border: string;
}

export function kindMeta(e: GenerationEvent): KindMeta {
  if (e.kind === "error") {
    return {
      palette: "red",
      border: "red.500",
    };
  }
  if (e.kind === "done") {
    return {
      palette: "green",
      border: "green.500",
    };
  }
  return {
    palette: "floorp",
    border: "accent",
  };
}
