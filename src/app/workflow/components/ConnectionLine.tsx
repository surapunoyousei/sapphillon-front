import { WorkflowConnection } from "@/types/workflow.ts";
import { NodePosition } from "@/utils/workflow-layout.ts";

interface ConnectionLineProps {
  connection: WorkflowConnection;
  index: number;
  fromPos: NodePosition;
  toPos: NodePosition;
  style: React.CSSProperties;
}

export function ConnectionLine({
  connection,
  index,
  fromPos,
  toPos,
  style,
}: ConnectionLineProps) {
  if (fromPos.x === toPos.x) {
    return (
      <line
        key={`connection-${index}`}
        x1={fromPos.x}
        y1={fromPos.y + 50}
        x2={toPos.x}
        y2={toPos.y - 50}
        stroke="currentColor"
        strokeWidth="2"
        className="text-base-content/40"
        markerEnd="url(#arrowhead)"
        style={style}
      />
    );
  }

  const midY = (fromPos.y + toPos.y) / 2;
  return (
    <path
      key={`connection-${index}`}
      d={`M ${fromPos.x} ${fromPos.y + 50}
          L ${fromPos.x} ${midY}
          L ${toPos.x} ${midY}
          L ${toPos.x} ${toPos.y - 50}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-base-content/40"
      markerEnd="url(#arrowhead)"
      style={style}
    />
  );
}
