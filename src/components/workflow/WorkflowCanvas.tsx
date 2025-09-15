import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { Box, Code, HStack, Text, VStack } from "@chakra-ui/react";
import * as parser from "@babel/parser";
import type {
  ExpressionStatement,
  FunctionDeclaration,
  Statement,
  TryStatement,
} from "@babel/types";
import React, { type MouseEvent, useRef, useState } from "react";

interface WorkflowCanvasProps {
  workflow: Workflow;
}

const Connector = () => (
  <Box
    alignSelf="center"
    h="2px"
    w="20px"
    bg="gray.400"
    _dark={{ bg: "gray.600" }}
  />
);

const AstNode: React.FC<{ node: Statement }> = ({ node }) => {
  switch (node.type) {
    case "ExpressionStatement": {
      const expr = node as ExpressionStatement;
      if (
        expr.expression.type === "CallExpression" &&
        expr.expression.callee.type === "MemberExpression" &&
        expr.expression.callee.object.type === "Identifier" &&
        expr.expression.callee.object.name === "console" &&
        expr.expression.callee.property.type === "Identifier" &&
        expr.expression.callee.property.name === "log"
      ) {
        const arg = expr.expression.arguments[0];
        const message = arg && arg.type === "StringLiteral"
          ? arg.value
          : "log message";
        return (
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            minWidth="200px"
            flexShrink={0}
          >
            <Text fontWeight="bold">Step: console.log</Text>
            <Code>{message}</Code>
          </Box>
        );
      }
      return (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          minWidth="200px"
          flexShrink={0}
        >
          <Text fontWeight="bold">Step</Text>
          <Code>No expression</Code>
        </Box>
      );
    }
    case "TryStatement": {
      const tryStmt = node as TryStatement;
      return (
        <Box p={4} borderWidth="1px" borderRadius="lg" flexShrink={0}>
          <HStack align="flex-start" gap={2} flexWrap="nowrap">
            <VStack align="flex-start">
              <Text fontWeight="bold">Try</Text>
              <HStack gap={0} align="flex-start" mt={2} flexWrap="nowrap">
                {[...tryStmt.block.body].reverse().map((stmt, index, arr) => (
                  <React.Fragment key={index}>
                    <AstNode node={stmt} />
                    {index < arr.length - 1 && <Connector />}
                  </React.Fragment>
                ))}
              </HStack>
            </VStack>
            {tryStmt.handler && (
              <>
                <Connector />
                <VStack align="flex-start">
                  <Text fontWeight="bold">Catch</Text>
                  <HStack gap={0} align="flex-start" mt={2} flexWrap="nowrap">
                    {[...tryStmt.handler.body.body]
                      .reverse()
                      .map((stmt, index, arr) => (
                        <React.Fragment key={index}>
                          <AstNode node={stmt} />
                          {index < arr.length - 1 && <Connector />}
                        </React.Fragment>
                      ))}
                  </HStack>
                </VStack>
              </>
            )}
          </HStack>
        </Box>
      );
    }
    default:
      return (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          minWidth="200px"
          flexShrink={0}
        >
          <Text>Statement: {node.type}</Text>
        </Box>
      );
  }
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const latestCode = workflow.workflowCode[workflow.workflowCode.length - 1]
    ?.code;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
      containerRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    setPosition({ x, y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "auto";
    }
  };

  return (
    <Box
      ref={containerRef}
      borderWidth="1px"
      borderRadius="lg"
      h="100%"
      w="100%"
      overflow="hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      cursor="grab"
      position="relative"
    >
      <Box
        p={5}
        style={{
          position: "absolute",
          width: "max-content",
          minWidth: "100%",
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        {(() => {
          if (!latestCode) {
            return <Text>No code available to display.</Text>;
          }

          try {
            const ast = parser.parse(latestCode, {
              sourceType: "module",
              plugins: ["typescript"],
            });

            const workflowFunction = ast.program.body.find(
              (node) =>
                node.type === "FunctionDeclaration" &&
                node.id?.name === "workflow",
            ) as FunctionDeclaration | undefined;

            if (!workflowFunction) {
              return <Text>`workflow()` function not found.</Text>;
            }

            const workflowBody = workflowFunction.body.body;

            return (
              <VStack align="flex-start">
                <HStack gap={0} align="flex-start" flexWrap="nowrap">
                  {[...workflowBody].reverse().map((statement, index, arr) => (
                    <React.Fragment key={index}>
                      <AstNode node={statement} />
                      {index < arr.length - 1 && <Connector />}
                    </React.Fragment>
                  ))}
                </HStack>
              </VStack>
            );
          } catch (error) {
            console.error("Failed to parse workflow code:", error);
            return <Text color="red.500">Error parsing workflow code.</Text>;
          }
        })()}
      </Box>
    </Box>
  );
};
