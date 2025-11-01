import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { Box, Button, ButtonGroup, Code, Text, VStack } from "@chakra-ui/react";
import generate from "@babel/generator";
import type {
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  IfStatement,
  Node,
  ReturnStatement,
  Statement,
  TryStatement,
  VariableDeclaration,
  WhileStatement,
} from "@babel/types";
import React, { useMemo, useRef, useState } from "react";
import { parseWorkflowCode, stripTypeScriptSyntax } from "./ast-utils";
import {
  LuChevronDown,
  LuChevronRight,
  LuCircle,
  LuCornerDownLeft,
  LuGitBranch,
  LuRepeat,
  LuSettings,
  LuShield,
  LuTriangleAlert,
  LuVariable,
  LuZap,
} from "react-icons/lu";

export interface WorkflowCanvasProps {
  workflow: Workflow;
  withBackground?: boolean;
}

const generateCode = (node: Node | null | undefined) => {
  if (!node) return "";
  try {
    // @ts-expect-error @babel/generator's ESM/CJS module is a bit weird.
    const generator = generate.default ?? generate;
    const { code } = generator(node, {
      compact: true,
      comments: false,
      concise: true,
    });
    return code;
  } catch (error) {
    console.warn("Failed to generate code for node:", error);
    return "[Code generation failed]";
  }
};

const INDENT_PX = 16; // インデント幅（各ネストレベル）
const oneLine = (code: string | null | undefined, max = 80) => {
  const s = (code ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
};

// Simple inline token highlighter for variable-like expressions.
const TokenizedInlineCode: React.FC<{ code?: string }> = ({ code }) => {
  const s = code ?? "";
  // Tokenize into identifiers, numbers, strings, whitespace, and others
  const tokens = Array.from(
    s.matchAll(
      /([A-Za-z_$][\w$]*)|(\d+(?:\.\d+)?)|("[^"]*"|'[^']*')|(\s+)|(.)/g,
    ),
  );
  return (
    <Code
      fontSize="xs"
      px={2}
      py={0.5}
      borderRadius="sm"
      bg="gray.50"
      color="gray.800"
      _dark={{ bg: "gray.800", color: "gray.100" }}
      whiteSpace="pre"
      fontFamily="monospace"
      display="inline-flex"
      alignItems="center"
    >
      {tokens.map((m, i) => {
        const ident = (m as unknown as string[])[1];
        const num = (m as unknown as string[])[2];
        const str = (m as unknown as string[])[3];
        const ws = (m as unknown as string[])[4];
        const other = (m as unknown as string[])[5];
        if (ident) {
          return (
            <Box
              as="span"
              key={i}
              color="purple.600"
              _dark={{ color: "purple.300" }}
            >
              {ident}
            </Box>
          );
        }
        if (num) {
          return (
            <Box
              as="span"
              key={i}
              color="teal.600"
              _dark={{ color: "teal.300" }}
            >
              {num}
            </Box>
          );
        }
        if (str) {
          return (
            <Box
              as="span"
              key={i}
              color="orange.600"
              _dark={{ color: "orange.300" }}
            >
              {str}
            </Box>
          );
        }
        if (ws) {
          return <span key={i}>{ws}</span>;
        }
        return (
          <Box as="span" key={i} color="gray.600" _dark={{ color: "gray.400" }}>
            {other}
          </Box>
        );
      })}
    </Code>
  );
};

const isImportantCall = (calleeCode: string): boolean => {
  const c = calleeCode.toLowerCase();
  // Heuristics to identify important, potentially impactful actions
  const keywords = [
    "page",
    "navigate",
    "goto",
    "access",
    "plugin",
    "click",
    "type",
    "select",
    "submit",
    "wait",
  ];
  return keywords.some((keyword) => c.includes(keyword));
};

// Reuse the same keyword list for broader subtree checks
const IMPORTANT_KEYWORDS = [
  "page",
  "navigate",
  "goto",
  "access",
  "plugin",
  "click",
  "type",
  "select",
  "submit",
  "wait",
];

const nodeHasImportant = (node: Node | null | undefined) => {
  if (!node) return false;
  try {
    const code = generateCode(node).toLowerCase();
    return IMPORTANT_KEYWORDS.some((k) => code.includes(k));
  } catch {
    return false;
  }
};

const AstNode: React.FC<
  { node: Statement; depth?: number; importantOnly?: boolean }
> = (
  { node, depth = 0, importantOnly = false },
) => {
  // Early return for invalid nodes
  if (!node || !node.type) {
    return (
      <Box
        p={3}
        borderWidth="1px"
        borderRadius="md"
        minWidth="200px"
        flexShrink={0}
        bg="red.50"
        borderColor="red.200"
        _dark={{
          bg: "red.900",
          borderColor: "red.700",
        }}
      >
        <Text color="red.700" _dark={{ color: "red.500" }} fontSize="sm">
          Invalid node
        </Text>
      </Box>
    );
  }
  const NodeContainer: React.FC<
    React.PropsWithChildren<{
      title: string;
      summary?: string;
      icon?: React.ReactElement;
      type?: "action" | "condition" | "loop" | "error";
      expandable?: boolean;
      defaultCollapsed?: boolean;
      palette?:
        | "gray"
        | "red"
        | "orange"
        | "amber"
        | "yellow"
        | "green"
        | "teal"
        | "blue"
        | "cyan"
        | "purple"
        | "pink";
    }>
  > = ({
    title,
    summary,
    children,
    icon = <LuZap size={16} />,
    type = "action",
    expandable = false,
    defaultCollapsed = false,
    palette,
  }) => {
    const getTypeColors = () => {
      if (palette) {
        return {
          bg: `${palette}.50`,
          borderColor: `${palette}.200`,
          iconBg: `${palette}.50`,
          iconColor: `${palette}.700`,
          _dark: {
            bg: "black",
            borderColor: `${palette}.800`,
            iconBg: "black",
            iconColor: `${palette}.400`,
          },
        } as const;
      }
      switch (type) {
        case "condition":
          return {
            bg: "amber.50",
            borderColor: "amber.200",
            iconBg: "amber.50",
            iconColor: "amber.700",
            _dark: {
              bg: "black",
              borderColor: "amber.800",
              iconBg: "black",
              iconColor: "amber.400",
            },
          };
        case "loop":
          return {
            bg: "blue.50",
            borderColor: "blue.200",
            iconBg: "blue.50",
            iconColor: "blue.700",
            _dark: {
              bg: "black",
              borderColor: "blue.800",
              iconBg: "black",
              iconColor: "blue.400",
            },
          };
        case "error":
          return {
            bg: "red.50",
            borderColor: "red.200",
            iconBg: "red.50",
            iconColor: "red.700",
            _dark: {
              bg: "black",
              borderColor: "red.800",
              iconBg: "black",
              iconColor: "red.400",
            },
          };
        default:
          return {
            bg: "white",
            borderColor: "gray.200",
            iconBg: "gray.50",
            iconColor: "gray.700",
            _dark: {
              bg: "black",
              borderColor: "gray.700",
              iconBg: "black",
              iconColor: "gray.300",
            },
          };
      }
    };

    const colors = getTypeColors();
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        w="100%"
        mx="auto"
        flexShrink={0}
        transition="all 0.12s ease-in-out"
        bg={colors.bg}
        _dark={{ bg: colors._dark.bg, borderColor: colors._dark.borderColor }}
        borderColor={colors.borderColor}
        _hover={{ borderColor: "gray.300", _dark: { borderColor: "gray.600" } }}
        position="relative"
      >
        {/* Left type bar */}
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w="3px"
          bg={colors.iconBg}
          _dark={{ bg: colors._dark.iconBg }}
          borderLeftRadius="md"
        />

        {/* Header row */}
        <Box px={2.5} py={1.5}>
          <Box display="flex" alignItems="center" gap={2} minH="24px">
            {/* Toggle */}
            {expandable
              ? (
                <Box
                  as="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed((c) => !c);
                  }}
                  aria-label={collapsed ? "Expand" : "Collapse"}
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="18px"
                  h="18px"
                >
                  {collapsed
                    ? <LuChevronRight size={14} />
                    : <LuChevronDown size={14} />}
                </Box>
              )
              : null}

            {/* Icon */}
            <Box
              w={5}
              h={5}
              borderRadius="sm"
              bg={colors.iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              color={colors.iconColor}
              _dark={{ bg: colors._dark.iconBg, color: colors._dark.iconColor }}
              flexShrink={0}
            >
              {icon}
            </Box>

            {/* Title + Summary */}
            <Box
              flex={1}
              minWidth={0}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Text
                fontWeight="medium"
                fontSize="sm"
                color="gray.900"
                _dark={{ color: "gray.200" }}
                truncate
              >
                {title}
              </Text>
              {summary && <TokenizedInlineCode code={summary} />}
            </Box>
          </Box>
        </Box>

        {/* Details */}
        {(!expandable || !collapsed) && (
          <Box px={2.5}>
            <VStack align="stretch" w="100%" gap={1}>
              {children}
            </VStack>
          </Box>
        )}
      </Box>
    );
  };

  const BodyRenderer: React.FC<{
    body: Statement | Statement[];
    depth?: number;
    label?: string;
    importantOnly?: boolean;
  }> = ({ body, depth = 0, label, importantOnly = false }) => {
    const list = Array.isArray(body) ? body : [body];
    return (
      <Box>
        {label && (
          <Text
            fontSize="md"
            color="gray.600"
            _dark={{ color: "gray.400" }}
            mb={1}
            ml={`${depth * INDENT_PX + 4}px`}
          >
            {label}
          </Text>
        )}
        <VStack gap={1} align="stretch" w="100%">
          {list
            .filter((stmt) => {
              if (!importantOnly) return true;
              // Keep the statement if it or its subtree contains important calls
              return nodeHasImportant(stmt);
            })
            .map((stmt, index) => (
              <Box
                key={index}
                position="relative"
                pl={`${depth * INDENT_PX + 12}px`}
              >
                <AstNode
                  node={stmt}
                  depth={depth + 1}
                  importantOnly={importantOnly}
                />
              </Box>
            ))}
        </VStack>
      </Box>
    );
  };

  switch (node.type) {
    case "VariableDeclaration": {
      const varDecl = node as VariableDeclaration;
      if (!varDecl.declarations) {
        return (
          <NodeContainer
            title="Variable (invalid)"
            icon={<LuTriangleAlert size={16} />}
            type="error"
          >
            <Code>No declarations</Code>
          </NodeContainer>
        );
      }
      return (
        <NodeContainer
          title="変数を準備"
          icon={<LuVariable size={16} />}
          type="action"
          // show full declaration in header (tokenized there)
          summary={generateCode(varDecl)}
          expandable={false}
          defaultCollapsed={false}
          palette="purple"
        />
      );
    }
    case "ReturnStatement": {
      const returnStmt = node as ReturnStatement;
      const summary = oneLine(`return ${generateCode(returnStmt.argument)}`);
      return (
        <NodeContainer
          title="結果を返す"
          icon={<LuCornerDownLeft size={16} />}
          type="action"
          summary={summary}
          expandable={false}
          palette="green"
        >
          {/* Return is summarized inline */}
        </NodeContainer>
      );
    }
    case "ExpressionStatement": {
      const expr = node as ExpressionStatement;
      if (!expr.expression) {
        return (
          <NodeContainer
            title="Expression (invalid)"
            icon={<LuTriangleAlert size={16} />}
            type="error"
          >
            <Code>No expression</Code>
          </NodeContainer>
        );
      }
      if (expr.expression.type === "CallExpression") {
        const callExpr = expr.expression;
        const fn = oneLine(generateCode(callExpr.callee), 40);
        const isImportant = isImportantCall(fn);
        return (
          <NodeContainer
            title={isImportant ? "重要処理" : "ツールを実行"}
            icon={isImportant
              ? <LuTriangleAlert size={16} />
              : <LuSettings size={16} />}
            type="action"
            // show the full call expression in the header (will be tokenized by TokenizedInlineCode there)
            summary={generateCode(callExpr)}
            expandable={false}
            palette={isImportant ? "orange" : "teal"}
          />
        );
      }
      const summary = oneLine(generateCode(expr.expression));
      return (
        <NodeContainer
          title="処理を実行"
          icon={<LuZap size={16} />}
          type="action"
          summary={summary}
          expandable={false}
          palette="cyan"
        >
          {/* Expression summarized inline */}
        </NodeContainer>
      );
    }
    case "IfStatement": {
      const ifStmt = node as IfStatement;
      if (!ifStmt.test || !ifStmt.consequent) {
        return (
          <NodeContainer
            title="If (invalid)"
            icon={<LuTriangleAlert size={16} />}
            type="error"
          >
            <Code>Missing test or consequent</Code>
          </NodeContainer>
        );
      }
      const summary = oneLine(`if (${generateCode(ifStmt.test)})`);
      return (
        <NodeContainer
          title="条件分岐"
          icon={<LuGitBranch size={16} />}
          type="condition"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="amber"
        >
          <VStack w="100%" align="stretch" gap={2} mb={2}>
            <BodyRenderer
              body={ifStmt.consequent}
              depth={depth + 1}
              importantOnly={importantOnly}
              label="もし合致した場合"
            />
            {ifStmt.alternate && (
              <BodyRenderer
                body={ifStmt.alternate}
                depth={depth + 1}
                importantOnly={importantOnly}
                label="合致しなかった場合"
              />
            )}
          </VStack>
        </NodeContainer>
      );
    }
    case "ForInStatement":
    case "ForOfStatement": {
      const loopStmt = node as ForInStatement | ForOfStatement;
      const summary = oneLine(
        `${generateCode(loopStmt.left)} in/of ${generateCode(loopStmt.right)}`,
      );
      return (
        <NodeContainer
          title="繰り返し"
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer
            body={loopStmt.body}
            depth={depth + 1}
            label="繰り返し処理"
            importantOnly={importantOnly}
          />
        </NodeContainer>
      );
    }
    case "WhileStatement": {
      const whileStmt = node as WhileStatement;
      const summary = oneLine(`while (${generateCode(whileStmt.test)})`);
      return (
        <NodeContainer
          title="繰り返し"
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer
            body={whileStmt.body}
            depth={depth + 1}
            label="繰り返し処理"
            importantOnly={importantOnly}
          />
        </NodeContainer>
      );
    }
    case "ForStatement": {
      const forStmt = node as ForStatement;
      const summary = oneLine(
        `${generateCode(forStmt.init)}; ${generateCode(forStmt.test)}; ${
          generateCode(forStmt.update)
        }`,
      );
      return (
        <NodeContainer
          title="繰り返し"
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer
            body={forStmt.body}
            depth={depth + 1}
            label="繰り返し処理"
            importantOnly={importantOnly}
          />
        </NodeContainer>
      );
    }
    case "TryStatement": {
      const tryStmt = node as TryStatement;
      if (!tryStmt.block) {
        return (
          <NodeContainer
            title="Try...Catch (invalid)"
            icon={<LuTriangleAlert size={16} />}
            type="error"
          >
            <Code>Missing try block</Code>
          </NodeContainer>
        );
      }
      const summary = oneLine("try … catch");
      return (
        <NodeContainer
          title="エラー処理"
          icon={<LuShield size={16} />}
          type="error"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="red"
        >
          <VStack w="100%" align="stretch" gap={2}>
            <BodyRenderer
              body={tryStmt.block.body}
              depth={depth + 1}
              importantOnly={importantOnly}
              label="通常実行"
            />
            {tryStmt.handler && tryStmt.handler.body && (
              <BodyRenderer
                body={tryStmt.handler.body.body}
                depth={depth + 1}
                importantOnly={importantOnly}
                label={`エラーが発生した場合 (${
                  oneLine(generateCode(tryStmt.handler.param), 24)
                })`}
              />
            )}
          </VStack>
        </NodeContainer>
      );
    }
    case "BlockStatement": {
      const blockStmt = node as { body?: Statement[] };
      if (!blockStmt.body || !Array.isArray(blockStmt.body)) {
        return (
          <NodeContainer
            title="Block (invalid)"
            icon={<LuTriangleAlert size={16} />}
            type="error"
          >
            <Code>No body</Code>
          </NodeContainer>
        );
      }
      return (
        <BodyRenderer
          body={blockStmt.body}
          depth={depth + 1}
          importantOnly={importantOnly}
        />
      );
    }
    default:
      return (
        <NodeContainer
          title={`不明な処理: ${node.type}`}
          icon={<LuCircle size={16} />}
          type="action"
          summary={generateCode(node)}
          expandable={false}
          palette="pink"
        />
      );
  }
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  withBackground = true,
}) => {
  const [viewMode, setViewMode] = useState<"steps" | "code">("steps");
  const containerRef = useRef<HTMLDivElement>(null);

  const latestCode = workflow.workflowCode[workflow.workflowCode.length - 1]
    ?.code;

  // Memoize AST parsing to avoid re-parsing on every render
  const { workflowBody, parseError } = useMemo(() => {
    if (!latestCode) return { workflowBody: null, parseError: null };
    return parseWorkflowCode(latestCode);
  }, [latestCode]);

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
            radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px),
            radial-gradient(circle, rgba(0,0,0,0.015) 1px, transparent 1px)
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
            radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
              backgroundSize: "16px 16px, 80px 80px",
              backgroundPosition: "0 0, 40px 40px",
            }}
          />
        </>
      )}

      {/* Content */}
      <Box position="absolute" inset={0} overflow="auto" zIndex={1}>
        {viewMode === "steps" && (
          <>
            {!latestCode
              ? <Text>No code available to display.</Text>
              : parseError
              ? (
                <Box p={4} color="red.500" whiteSpace="pre-wrap">
                  <Text fontWeight="bold">Error parsing workflow code:</Text>
                  <Code colorScheme="red">{parseError.message}</Code>
                </Box>
              )
              : workflowBody
              ? (
                <VStack align="stretch" gap={1.5} w="100%" p={3} pb="80px">
                  {workflowBody.map((statement, index) => (
                    <AstNode key={index} node={statement} depth={0} />
                  ))}
                </VStack>
              )
              : <Text>`workflow()` function not found.</Text>}
          </>
        )}

        {viewMode === "code" && (
          <Box as="pre" fontFamily="mono" fontSize="sm" m={0} p={3}>
            {rawJsCode}
          </Box>
        )}
      </Box>

      {/* View toggle */}
      <Box position="absolute" top={2} right={2} zIndex={2}>
        <ButtonGroup size="xs" attached variant="outline">
          <Button
            onClick={() => setViewMode("steps")}
            colorScheme={viewMode === "steps" ? "blue" : "gray"}
            variant={viewMode === "steps" ? "solid" : "outline"}
            background={viewMode === "steps" ? "black" : "white"}
          >
            Steps
          </Button>
          <Button
            onClick={() => setViewMode("code")}
            colorScheme={viewMode === "code" ? "blue" : "gray"}
            variant={viewMode === "code" ? "solid" : "outline"}
            background={viewMode === "code" ? "black" : "white"}
          >
            Code
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};
