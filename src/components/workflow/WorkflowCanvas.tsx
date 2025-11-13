/**
 * @fileoverview ワークフローをビジュアルに表示するキャンバスコンポーネント
 *
 * JavaScriptコードをBabelで解析し、
 * アクション単位のビューとコードビューを切り替えて表示します。
 *
 * @module components/workflow/WorkflowCanvas
 */

import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { Box, Code, HStack, Tabs, Text, VStack } from "@chakra-ui/react";
import React, { useMemo, useRef, useState } from "react";
import { parseWorkflowCode, stripTypeScriptSyntax } from "./ast-utils";
import { CodeHighlighter } from "./CodeHighlighter";
import { groupStatementsIntoActions } from "./action-grouper";
import { ActionNode } from "./ActionNode";
import { LuCode, LuList } from "react-icons/lu";

/**
 * WorkflowCanvasコンポーネントのProps
 */
export interface WorkflowCanvasProps {
  /** 表示するワークフロー定義 */
  workflow: Workflow;
  /** 背景グリッドを表示するか（デフォルト: true） */
  withBackground?: boolean;
}

/**
 * ワークフローキャンバスコンポーネント
 *
 * ワークフローのJavaScriptコードを解析し、視覚的なアクションビューとして表示します。
 * - **Actions**: 関連するステップをグループ化してアクションとして表示
 * - **Code**: 生のJavaScriptコード（TypeScript構文を除去）
 *
 * @example
 * ```tsx
 * import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
 *
 * function WorkflowViewer({ workflow }) {
 *   return (
 *     <Box h="500px">
 *       <WorkflowCanvas workflow={workflow} withBackground />
 *     </Box>
 *   );
 * }
 * ```
 */
export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  withBackground = true,
}) => {
  const [viewMode, setViewMode] = useState<"actions" | "code">("actions");
  const containerRef = useRef<HTMLDivElement>(null);

  const latestCode = workflow.workflowCode[workflow.workflowCode.length - 1]
    ?.code;

  // Memoize AST parsing to avoid re-parsing on every render
  const { workflowBody, parseError } = useMemo(() => {
    if (!latestCode) return { workflowBody: null, parseError: null };
    return parseWorkflowCode(latestCode);
  }, [latestCode]);

  // Group statements into actions
  const actions = useMemo(() => {
    if (!workflowBody) return [];
    return groupStatementsIntoActions(workflowBody);
  }, [workflowBody]);

  // Strip TypeScript syntax and render raw JavaScript for the latest code
  const rawJsCode = useMemo(() => {
    if (!latestCode) return "";
    return stripTypeScriptSyntax(latestCode);
  }, [latestCode]);

  return (
    <Box
      ref={containerRef}
      h="100%"
      w="100%"
      flex={1}
      position="relative"
      bg="bg"
    >
      {withBackground && (
        <>
          {/* Light mode grid pattern */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{
              backgroundImage: `
            radial-gradient(circle, rgba(0,0,0,0.025) 1px, transparent 1px),
            radial-gradient(circle, rgba(0,0,0,0.01) 1px, transparent 1px)
          `,
              backgroundSize: "14px 14px, 64px 64px",
              backgroundPosition: "0 0, 32px 32px",
            }}
            _dark={{ display: "none" }}
          />

          {/* Dark mode grid pattern */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="none"
            _dark={{ display: "block" }}
            style={{
              backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.01) 1px, transparent 1px)
          `,
              backgroundSize: "16px 16px, 80px 80px",
              backgroundPosition: "0 0, 40px 40px",
            }}
          />
        </>
      )}

      {/* View toggle - Tabs style */}
      <Box
        position="absolute"
        top={{ base: 1, md: 2 }}
        right={{ base: 1, md: 2 }}
        zIndex={2}
        w={{ base: "auto", md: "auto" }}
        minW={{ base: "140px", md: "180px" }}
      >
        <Tabs.Root
          value={viewMode}
          onValueChange={(e) =>
            setViewMode(e.value as "actions" | "code")
          }
          size="sm"
        >
          <Tabs.List
            bg="bg.subtle"
            borderWidth="1px"
            borderRadius="md"
            p={1}
            boxShadow="sm"
            _dark={{
              bg: "gray.900",
              borderColor: "gray.700",
            }}
          >
            <Tabs.Trigger
              value="actions"
              flex={1}
              fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 3, md: 4 }}
              py={{ base: 1.5, md: 2 }}
              gap={1.5}
            >
              <HStack gap={1.5}>
                <LuList size={16} />
                <Text>Actions</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="code"
              flex={1}
              fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 3, md: 4 }}
              py={{ base: 1.5, md: 2 }}
              gap={1.5}
            >
              <HStack gap={1.5}>
                <LuCode size={16} />
                <Text>Code</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Box>

      {/* Content */}
      <Box position="absolute" inset={0} overflow="auto" zIndex={1}>
        {viewMode === "actions" && (
          <>
            {!latestCode
              ? (
                <Text fontSize={{ base: "sm", md: "md" }} p={{ base: 4, md: 6 }}>
                  No code available to display.
                </Text>
              )
              : parseError
              ? (
                <Box
                  p={{ base: 2, md: 4 }}
                  color="red.600"
                  whiteSpace="pre-wrap"
                >
                  <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                    Error parsing workflow code:
                  </Text>
                  <Code colorScheme="red" fontSize={{ base: "xs", md: "sm" }}>
                    {parseError.message}
                  </Code>
                </Box>
              )
              : actions.length > 0
              ? (
                <VStack
                  align="stretch"
                  gap={{ base: 3, md: 4 }}
                  w="100%"
                  p={{ base: 3, md: 4 }}
                  pb={{ base: "60px", md: "80px" }}
                >
                  {actions.map((action, index) => (
                    <ActionNode key={index} action={action} />
                  ))}
                </VStack>
              )
              : (
                <Text fontSize={{ base: "sm", md: "md" }} p={{ base: 4, md: 6 }}>
                  No actions found.
                </Text>
              )}
          </>
        )}

        {viewMode === "code" && (
          <Box
            p={{ base: 2, md: 3 }}
            bg="gray.50"
            _dark={{ bg: "gray.950" }}
            minH="100%"
          >
            <CodeHighlighter code={rawJsCode} language="javascript" />
          </Box>
        )}
      </Box>
    </Box>
  );
};


