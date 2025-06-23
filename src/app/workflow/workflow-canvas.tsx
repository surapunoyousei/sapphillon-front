import { useMemo, useRef } from "react";
import { WorkflowNode } from "@/components/workflow-node.tsx";
import {
  Workflow,
  WorkflowConnection,
  WorkflowNode as WorkflowNodeType,
} from "@/types/workflow.ts";
import {
  calculateWorkflowLayout,
  NodePosition,
} from "@/utils/workflow-layout.ts";
import { useCanvasZoom } from "./hooks/useCanvasZoom.ts";
import { ZoomControls } from "./components/ZoomControls.tsx";
import { PlaceholderNode } from "./components/PlaceholderNode.tsx";
import { ConnectionLine } from "./components/ConnectionLine.tsx";
import {
  getConnectionStyle,
  getNodeStyle,
  getPlaceholderMessage,
  getVisibleNodeCount,
  shouldShowPlaceholder,
} from "./utils/generationUtils.ts";

interface WorkflowCanvasProps {
  workflow: Workflow;
}

export function WorkflowCanvas({ workflow }: WorkflowCanvasProps) {
  const { generationState } = workflow;
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    zoom,
    pan,
    isPanning,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    calculateViewBox,
  } = useCanvasZoom();

  const { nodes: layoutNodes, positions } = useMemo(() => {
    return calculateWorkflowLayout(workflow.nodes, workflow.connections);
  }, [workflow]);

  const visibleNodeCount = getVisibleNodeCount(
    generationState.currentStep,
    generationState.status,
    layoutNodes.length,
  );
  const visibleNodes = layoutNodes.slice(0, visibleNodeCount);

  const renderConnection = (connection: WorkflowConnection, index: number) => {
    const fromNode = layoutNodes.find((n: WorkflowNodeType) =>
      n.id === connection.from
    );
    const toNode = layoutNodes.find((n: WorkflowNodeType) =>
      n.id === connection.to
    );

    if (!fromNode || !toNode) return null;

    const fromPos = positions.get(fromNode.id);
    const toPos = positions.get(toNode.id);

    if (!fromPos || !toPos) return null;

    const connectionStyle = getConnectionStyle(
      generationState.currentStep,
      generationState.status,
      index,
      workflow.connections.length,
    );

    return (
      <ConnectionLine
        key={`connection-${index}`}
        connection={connection}
        index={index}
        fromPos={fromPos}
        toPos={toPos}
        style={connectionStyle}
      />
    );
  };

  const bounds = useMemo(() => {
    if (visibleNodes.length === 0) {
      return { minX: 0, maxX: 800, minY: 0, maxY: 800 };
    }

    const visiblePositions = visibleNodes
      .map((node) => positions.get(node.id))
      .filter(Boolean) as NodePosition[];

    const xs = visiblePositions.map((pos) => pos.x);
    const ys = visiblePositions.map((pos) => pos.y);

    return {
      minX: Math.min(...xs) - 200,
      maxX: Math.max(...xs) + 200,
      minY: Math.min(...ys) - 100,
      maxY: Math.max(...ys) + 200,
    };
  }, [visibleNodes, positions]);

  const viewBox = calculateViewBox(bounds);

  return (
    <div className="relative w-full h-full bg-base-200 overflow-hidden">
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full cursor-grab"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="currentColor"
              className="text-base-content/40"
            />
          </marker>
        </defs>

        {workflow.connections.map((connection, index) =>
          renderConnection(connection, index)
        )}

        {shouldShowPlaceholder(generationState) && (
          <PlaceholderNode
            message={getPlaceholderMessage(generationState.currentStep)}
          />
        )}

        {visibleNodes.map((node: WorkflowNodeType, index: number) => {
          const position = positions.get(node.id);
          if (!position) return null;

          return (
            <foreignObject
              key={node.id}
              x={position.x - 100}
              y={position.y - 50}
              width="200"
              height="100"
              className="overflow-visible"
              style={getNodeStyle(index, visibleNodeCount, generationState)}
            >
              <WorkflowNode
                label={node.label}
                type={node.type}
                status={node.status}
                hasError={node.hasError}
                pluginIcon={node.pluginIcon}
                description={node.description}
              />
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}
