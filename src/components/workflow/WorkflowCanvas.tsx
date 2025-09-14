import React from "react";
import { Box, Center, Text } from "@chakra-ui/react";

type Props = { workflow?: unknown | null };

type Point = { x: number; y: number };

type SimpleStep = {
  id: string;
  pluginName: string;
  functionName: string;
  description: string;
  resourceAccess?: { type?: string; path?: string }[];
};

type SimpleWorkflow = { id?: string; steps: SimpleStep[] };

// Simple linear layout: one node per row, connected top-to-bottom
function layoutNodes(
  steps: SimpleStep[],
  nodeSize: { w: number; h: number },
  gapY: number,
) {
  const nodes = steps.map((step, i) => ({
    id: step.id,
    step,
    x: 0,
    y: i * (nodeSize.h + gapY),
  }));

  const minX = 0;
  const minY = 0;
  const maxX = nodeSize.w;
  const maxY = nodes.length > 0 ? nodes[nodes.length - 1].y + nodeSize.h : 0;

  return { nodes, bounds: { minX, minY, maxX, maxY } };
}

export const WorkflowCanvas: React.FC<Props> = ({ workflow }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Pan/zoom state
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState<Point>({ x: 20, y: 20 });
  const draggingRef = React.useRef<
    { active: boolean; start: Point; origin: Point }
  >({
    active: false,
    start: { x: 0, y: 0 },
    origin: { x: 0, y: 0 },
  });

  // Resize canvas to container
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      draw();
    });
    ro.observe(container);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw on data or transform change
  React.useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow, scale, offset]);

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    // Read colors from computed styles so it matches theme
    const cs = getComputedStyle(container);
    const stroke = cs.color || "#2D3748"; // fallback slate-700
    const nodeFill = cs.getPropertyValue("--chakra-colors-bg").trim() ||
      "#FFFFFF";
    const textColor = cs.getPropertyValue("--chakra-colors-fg").trim() ||
      stroke;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (transparent over Box background looks nicer). Optional subtle grid
    drawGrid(ctx);

    const steps = normalizeWorkflow(workflow).steps;
    const nodeW = 300;
    const nodeH = 92;
    const gapY = 36;

    const { nodes } = layoutNodes(steps, { w: nodeW, h: nodeH }, gapY);

    // Apply pan/zoom transform
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw edges (straight vertical paths)
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const ax = a.x + nodeW / 2;
      const ay = a.y + nodeH;
      const bx = b.x + nodeW / 2;
      const by = b.y;
      // line
      ctx.beginPath();
      ctx.moveTo(ax, ay + 4);
      ctx.lineTo(bx, by - 12);
      ctx.stroke();
      // arrow head
      drawArrowHead(ctx, { x: bx, y: by - 12 }, { x: bx, y: by - 24 }, 8);
    }

    // Draw nodes
    for (const n of nodes) {
      drawNode(
        ctx,
        n.step,
        n.x,
        n.y,
        nodeW,
        nodeH,
        nodeFill,
        textColor,
        stroke,
      );
    }

    ctx.restore();
  }, [workflow, scale, offset]);

  const onWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current || !containerRef.current) return;
    // zoom on Ctrl/Meta or always zoom? Zoom on wheel with modifier, else pan vertically
    const rect = containerRef.current.getBoundingClientRect();
    const mouse: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = Math.exp(delta * 0.001); // smooth zoom
      const newScale = clamp(scale * factor, 0.25, 3);
      // Keep mouse point stationary (screen space)
      const before = screenToWorld(mouse, offset, scale);
      const after = screenToWorld(mouse, offset, newScale);
      const newOffset = {
        x: offset.x + (after.x - before.x) * newScale,
        y: offset.y + (after.y - before.y) * newScale,
      };
      setScale(newScale);
      setOffset(newOffset);
    } else {
      // vertical scroll pans
      setOffset((o) => ({ x: o.x, y: o.y - e.deltaY }));
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    draggingRef.current = {
      active: true,
      start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      origin: { ...offset },
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current.active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const dx = pos.x - draggingRef.current.start.x;
    const dy = pos.y - draggingRef.current.start.y;
    setOffset({
      x: draggingRef.current.origin.x + dx,
      y: draggingRef.current.origin.y + dy,
    });
  };

  const onMouseUp = () => {
    if (draggingRef.current.active) draggingRef.current.active = false;
  };

  const onDoubleClick = () => {
    // Reset view
    setScale(1);
    setOffset({ x: 20, y: 20 });
  };

  const stepsCount = normalizeWorkflow(workflow).steps.length;

  return (
    <Box
      ref={containerRef}
      position="relative"
      h="full"
      w="full"
      bg="bg.subtle"
      rounded="md"
      overflow="hidden"
    >
      {stepsCount === 0 && (
        <Center position="absolute" inset={0} pointerEvents="none">
          <Text color="fg.muted">No workflow yet</Text>
        </Center>
      )}
      <canvas
        ref={canvasRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
        style={{ display: "block" }}
      />
    </Box>
  );
};

function drawGrid(ctx: CanvasRenderingContext2D) {
  const { canvas } = ctx;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  ctx.save();
  // Clear with transparent background; draw subtle grid lines
  ctx.clearRect(0, 0, w, h);
  ctx.translate(0.5, 0.5); // crisp lines
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(128,128,128,0.15)";
  const grid = 24;
  for (let x = 0; x <= w; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  step: SimpleStep,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  textColor: string,
  stroke: string,
) {
  const radius = 10;
  // Card
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // Title
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textBaseline = "top";
  const title = `${step.pluginName}.${step.functionName}`;
  const titleX = x + 12;
  const titleY = y + 10;
  ctx.fillText(title, titleX, titleY);

  // ID line (muted)
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(`id: ${step.id}`, titleX, titleY + 20);

  // Description
  const desc = (step.description ?? "").toString();
  const maxWidth = w - 24;
  const descY = titleY + 40;
  const lines = wrapText(ctx, desc, maxWidth, 3);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  let yLine = descY;
  for (const ln of lines) {
    ctx.fillText(ln, titleX, yLine);
    yLine += 16;
  }

  // Resource badges (simple dot + count)
  const accessCount = step.resourceAccess?.length ?? 0;
  if (accessCount > 0) {
    const badge = `${accessCount} resource${accessCount > 1 ? "s" : ""}`;
    const bx = x + w - 12;
    const by = y + 12;
    const metrics = ctx.measureText(badge);
    const bw = Math.ceil(metrics.width) + 16;
    roundedRect(ctx, bx - bw, by - 8, bw, 22, 6);
    ctx.fillStyle = "rgba(99,102,241,0.12)"; // indigo-500/12
    ctx.strokeStyle = "rgba(99,102,241,0.6)";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(55,48,163,0.95)"; // indigo-800-ish
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(badge, bx - bw + 8, by - 4);
  }

  ctx.restore();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  tip: Point,
  from: Point,
  size: number,
) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const a1 = angle + Math.PI * 0.85;
  const a2 = angle - Math.PI * 0.85;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x + Math.cos(a1) * size, tip.y + Math.sin(a1) * size);
  ctx.lineTo(tip.x + Math.cos(a2) * size, tip.y + Math.sin(a2) * size);
  ctx.closePath();
  ctx.fill();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (
    lines.length === maxLines &&
    (words.length > 0 || ctx.measureText(line).width > maxWidth)
  ) {
    const last = lines[lines.length - 1];
    let ell = last;
    while (ctx.measureText(`${ell}…`).width > maxWidth && ell.length > 0) {
      ell = ell.slice(0, -1);
    }
    lines[lines.length - 1] = `${ell}…`;
  }
  return lines;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function screenToWorld(p: Point, offset: Point, s: number): Point {
  return { x: (p.x - offset.x) / s, y: (p.y - offset.y) / s };
}

export default WorkflowCanvas;

// Try to coerce various workflow shapes into a simple linear list of steps
function normalizeWorkflow(input: unknown): SimpleWorkflow {
  if (!input || typeof input !== "object") return { steps: [] };

  // Case A: Already in SimpleWorkflow shape (src/types/workflow)
  const wf = input as Record<string, unknown>;
  if (Array.isArray(wf.steps)) {
    const steps: SimpleStep[] = (wf.steps as unknown[]).map((s, i: number) => {
      const so = (s ?? {}) as Record<string, unknown>;
      const resourceAccess = Array.isArray(so.resourceAccess)
        ? (so.resourceAccess as Array<{ type?: string; path?: string }>)
        : [];
      return {
        id: String(so.id ?? i + 1),
        pluginName: String(so.pluginName ?? "plugin"),
        functionName: String(so.functionName ?? "function"),
        description: String(so.description ?? ""),
        resourceAccess,
      };
    });
    return { id: String(wf?.id ?? ""), steps };
  }

  // Case B: Proto-generated sapphillon.v1.Workflow (workflow_pb)
  // We will try to derive steps from the latest workflowCode[0].pluginFunctionIds
  // and the pluginPackages list for names, if present.
  const codeList: unknown[] = Array.isArray(wf.workflowCode)
    ? (wf.workflowCode as unknown[])
    : [];
  const first = (codeList[0] ?? {}) as Record<string, unknown>;
  const pluginFunctionIds: string[] = Array.isArray(first.pluginFunctionIds)
    ? (first.pluginFunctionIds as string[])
    : [];
  const steps: SimpleStep[] = pluginFunctionIds.map((fid, i) => {
    // Try to split by '.' to get plugin and function
    const [pluginName, functionName] = String(fid).includes(".")
      ? String(fid).split(".", 2)
      : ["plugin", String(fid)];
    return {
      id: String(i + 1),
      pluginName,
      functionName,
      description: "",
      resourceAccess: [],
    };
  });

  // If still empty, create one node from displayName/description as a placeholder
  if (steps.length === 0) {
    steps.push({
      id: String((wf as Record<string, unknown>).id ?? "1"),
      pluginName: String(
        (wf as Record<string, unknown>).displayName ?? "Workflow",
      ),
      functionName: "definition",
      description: String((wf as Record<string, unknown>).description ?? ""),
      resourceAccess: [],
    });
  }
  return { id: String((wf as Record<string, unknown>).id ?? ""), steps };
}
