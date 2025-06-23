import { WorkflowNode, WorkflowConnection } from "@/types/workflow.ts";

interface LayoutNode extends WorkflowNode {
  level: number;
  branch?: "left" | "right" | "center";
  children: string[];
  parents: string[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutResult {
  nodes: WorkflowNode[];
  positions: Map<string, NodePosition>;
}

export function calculateWorkflowLayout(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): LayoutResult {
  const nodeMap = new Map<string, LayoutNode>();
  const positions = new Map<string, NodePosition>();
  const startNodes: string[] = [];

  nodes.forEach((node) => {
    const layoutNode: LayoutNode = {
      ...node,
      level: -1,
      children: [],
      parents: [],
    };
    nodeMap.set(node.id, layoutNode);
  });

  connections.forEach((conn) => {
    const fromNode = nodeMap.get(conn.from);
    const toNode = nodeMap.get(conn.to);
    if (fromNode && toNode) {
      fromNode.children.push(conn.to);
      toNode.parents.push(conn.from);
    }
  });

  nodeMap.forEach((node, id) => {
    if (node.parents.length === 0) {
      startNodes.push(id);
    }
  });

  const queue: string[] = [...startNodes];
  startNodes.forEach((id) => {
    const node = nodeMap.get(id);
    if (node) node.level = 0;
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodeMap.get(currentId);
    if (!currentNode) continue;

    currentNode.children.forEach((childId) => {
      const childNode = nodeMap.get(childId);
      if (childNode && childNode.level === -1) {
        childNode.level = currentNode.level + 1;
        queue.push(childId);
      }
    });
  }

  const levels = new Map<number, LayoutNode[]>();
  nodeMap.forEach((node) => {
    if (node.level >= 0) {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level)!.push(node);
    }
  });

  nodeMap.forEach((node) => {
    if (node.type === "condition" && node.children.length > 1) {
      const leftChild = nodeMap.get(node.children[0]);
      const rightChild = nodeMap.get(node.children[1]);

      if (leftChild) leftChild.branch = "left";
      if (rightChild) rightChild.branch = "right";

      propagateBranch(leftChild, nodeMap, "left");
      propagateBranch(rightChild, nodeMap, "right");
    }
  });

  const canvasWidth = 800;
  const verticalSpacing = 150;
  const horizontalSpacing = 200;
  const startY = 100;

  levels.forEach((nodesInLevel, level) => {
    const y = startY + level * verticalSpacing;

    const leftNodes = nodesInLevel.filter((n) => n.branch === "left");
    const centerNodes = nodesInLevel.filter(
      (n) => !n.branch || n.branch === "center"
    );
    const rightNodes = nodesInLevel.filter((n) => n.branch === "right");

    centerNodes.forEach((node) => {
      positions.set(node.id, {
        x: canvasWidth / 2,
        y: y,
      });
    });

    if (leftNodes.length > 0) {
      const leftX = canvasWidth / 2 - horizontalSpacing;
      leftNodes.forEach((node) => {
        positions.set(node.id, {
          x: leftX,
          y: y,
        });
      });
    }

    if (rightNodes.length > 0) {
      const rightX = canvasWidth / 2 + horizontalSpacing;
      rightNodes.forEach((node) => {
        positions.set(node.id, {
          x: rightX,
          y: y,
        });
      });
    }
  });

  nodeMap.forEach((node) => {
    if (node.parents.length > 1) {
      node.branch = "center";
      const position = positions.get(node.id);
      if (position) {
        position.x = canvasWidth / 2;
      }
    }
  });

  return {
    nodes: Array.from(nodeMap.values()).map(
      ({ level, branch, children, parents, ...node }) => node
    ),
    positions,
  };
}

function propagateBranch(
  node: LayoutNode | undefined,
  nodeMap: Map<string, LayoutNode>,
  branch: "left" | "right"
) {
  if (!node || node.type === "condition") return;

  node.children.forEach((childId) => {
    const childNode = nodeMap.get(childId);
    if (childNode && !childNode.branch && childNode.parents.length === 1) {
      childNode.branch = branch;
      propagateBranch(childNode, nodeMap, branch);
    }
  });
}
