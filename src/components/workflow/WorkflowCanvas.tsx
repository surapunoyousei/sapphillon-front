import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { Box, Button, ButtonGroup, Code, Text, VStack } from "@chakra-ui/react";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import type {
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  IfStatement,
  Node,
  ReturnStatement,
  Statement,
  TryStatement,
  VariableDeclaration,
  WhileStatement,
} from "@babel/types";
import React, {
  type MouseEvent,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";
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

interface WorkflowCanvasProps {
  workflow: Workflow;
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

const AstNode: React.FC<{ node: Statement; depth?: number }> = (
  { node, depth = 0 },
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
              : <Box w="18px" h="18px" />}

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
              {summary && (
                <Code
                  fontSize="xs"
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  bg="gray.50"
                  color="gray.700"
                  _dark={{ bg: "gray.800", color: "gray.300" }}
                  whiteSpace="nowrap"
                >
                  {summary}
                </Code>
              )}
            </Box>
          </Box>
        </Box>

        {/* Details */}
        {(!expandable || !collapsed) && (
          <Box px={2.5} pb={2}>
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
  }> = ({ body, depth = 0, label }) => {
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
          {list.map((stmt, index) => (
            <Box
              key={index}
              position="relative"
              pl={`${depth * INDENT_PX + 12}px`}
            >
              <AstNode node={stmt} depth={depth + 1} />
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
      const summary = oneLine(
        varDecl.declarations.map((d) => generateCode(d)).join(", "),
      );
      return (
        <NodeContainer
          title={`Variable: ${varDecl.kind}`}
          icon={<LuVariable size={16} />}
          type="action"
          summary={summary}
          expandable={false}
          defaultCollapsed={false}
          palette="purple"
        >
          {/* Variables are already summarized inline for compact view */}
        </NodeContainer>
      );
    }
    case "ReturnStatement": {
      const returnStmt = node as ReturnStatement;
      const summary = oneLine(`return ${generateCode(returnStmt.argument)}`);
      return (
        <NodeContainer
          title="Return"
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
        const summary = `${fn}(…)  args=${callExpr.arguments?.length || 0}`;
        return (
          <NodeContainer
            title={`Function Call`}
            icon={<LuSettings size={16} />}
            type="action"
            summary={summary}
            expandable={false}
            palette="teal"
          >
            {/* Call summarized inline */}
          </NodeContainer>
        );
      }
      const summary = oneLine(generateCode(expr.expression));
      return (
        <NodeContainer
          title="Expression"
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
          title="Conditional"
          icon={<LuGitBranch size={16} />}
          type="condition"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="amber"
        >
          <VStack w="100%" align="stretch" gap={2}>
            <BodyRenderer
              body={ifStmt.consequent}
              depth={depth + 1}
              label="Then"
            />
            {ifStmt.alternate && (
              <BodyRenderer
                body={ifStmt.alternate}
                depth={depth + 1}
                label="Else"
              />
            )}
          </VStack>
        </NodeContainer>
      );
    }
    case "ForInStatement":
    case "ForOfStatement": {
      const loopStmt = node as ForInStatement | ForOfStatement;
      const loopType = loopStmt.type === "ForInStatement"
        ? "For...In"
        : "For...Of";
      const summary = oneLine(
        `${generateCode(loopStmt.left)} in/of ${generateCode(loopStmt.right)}`,
      );
      return (
        <NodeContainer
          title={`${loopType} Loop`}
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer body={loopStmt.body} depth={depth + 1} label="Loop" />
        </NodeContainer>
      );
    }
    case "WhileStatement": {
      const whileStmt = node as WhileStatement;
      const summary = oneLine(`while (${generateCode(whileStmt.test)})`);
      return (
        <NodeContainer
          title="While Loop"
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer body={whileStmt.body} depth={depth + 1} label="Loop" />
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
          title="For Loop"
          icon={<LuRepeat size={16} />}
          type="loop"
          summary={summary}
          expandable={true}
          defaultCollapsed={depth > 0}
          palette="blue"
        >
          <BodyRenderer body={forStmt.body} depth={depth + 1} label="Loop" />
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
          title="Error Handling"
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
              label="Try"
            />
            {tryStmt.handler && tryStmt.handler.body && (
              <BodyRenderer
                body={tryStmt.handler.body.body}
                depth={depth + 1}
                label={`Catch (${
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
      return <BodyRenderer body={blockStmt.body} depth={depth + 1} />;
    }
    default:
      return (
        <NodeContainer
          title={`Statement: ${node.type}`}
          icon={<LuCircle size={16} />}
          type="action"
          summary={oneLine(generateCode(node))}
          expandable={false}
          palette="pink"
        />
      );
  }
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"steps" | "code">("steps");
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<{ minY: number; maxY: number }>({
    minY: 0,
    maxY: 0,
  });

  // 計測してスクロール上下限を更新
  const recomputeBounds = React.useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      boundsRef.current = { minY: 0, maxY: 0 };
      return;
    }
    const containerH = container.clientHeight;
    const contentH = content.offsetHeight; // transform の影響を受けない高さ
    const maxY = 0;
    const minY = Math.min(0, containerH - contentH);
    boundsRef.current = { minY, maxY };
    // 現在位置を境界内に収める
    setPosition((pos) => {
      const y = Math.max(minY, Math.min(maxY, pos.y));
      return y === pos.y ? pos : { ...pos, y };
    });
  }, []);

  React.useEffect(() => {
    if (viewMode !== "steps") return; // steps モードのみ計測
    recomputeBounds();
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    let ro: ResizeObserver | undefined;
    try {
      ro = new ResizeObserver(() => recomputeBounds());
      ro.observe(container);
      ro.observe(content);
    } catch {
      // ResizeObserver 未対応環境ではウィンドウリサイズで代替
      const onResize = () => recomputeBounds();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    return () => {
      ro?.disconnect();
    };
  }, [viewMode, recomputeBounds]);

  const clampY = React.useCallback((y: number) => {
    const { minY, maxY } = boundsRef.current;
    return Math.max(minY, Math.min(maxY, y));
  }, []);

  const latestCode = workflow.workflowCode[workflow.workflowCode.length - 1]
    ?.code;
  // Memoize AST parsing to avoid re-parsing on every render
  const { workflowBody, parseError } = useMemo(() => {
    if (!latestCode) return { workflowBody: null, parseError: null };
    try {
      const ast = parser.parse(latestCode, {
        sourceType: "module",
        plugins: ["typescript"],
      });
      const workflowFunction = ast.program.body.find(
        (node) =>
          node.type === "FunctionDeclaration" && node.id?.name === "workflow",
      ) as FunctionDeclaration | undefined;
      if (!workflowFunction) {
        return {
          workflowBody: null,
          parseError: new Error("`workflow()` function not found."),
        };
      }
      return { workflowBody: workflowFunction.body.body, parseError: null };
    } catch (error) {
      if (error instanceof Error) {
        return { workflowBody: null, parseError: error };
      }
      return {
        workflowBody: null,
        parseError: new Error("Unknown parsing error"),
      };
    }
  }, [latestCode]);

  // Strip TypeScript syntax and render raw JavaScript for the latest code
  const rawJsCode = useMemo(() => {
    if (!latestCode) return "";
    try {
      const ast = parser.parse(latestCode, {
        sourceType: "module",
        plugins: ["typescript"],
      });

      const removeTypeFromPattern = (
        pattern: t.PatternLike | t.LVal | t.TSParameterProperty,
      ) => {
        if ((pattern as t.TSParameterProperty).type === "TSParameterProperty") {
          // unwrap parameter property
          // handled in visitor
          return;
        }
        if ((pattern as t.Identifier).type === "Identifier") {
          const id = pattern as t.Identifier;
          if (id.typeAnnotation) {
            // narrow and delete optional annotation
            delete (id as t.Identifier & {
              typeAnnotation?: t.TSTypeAnnotation;
            }).typeAnnotation;
          }
          return;
        }
        if ((pattern as t.AssignmentPattern).type === "AssignmentPattern") {
          const ap = pattern as t.AssignmentPattern;
          // left side could be Identifier or pattern
          removeTypeFromPattern(ap.left);
          return;
        }
        if ((pattern as t.ObjectPattern).type === "ObjectPattern") {
          const op = pattern as t.ObjectPattern;
          op.properties.forEach((prop) => {
            if (prop.type === "ObjectProperty") {
              // value is PatternLike
              removeTypeFromPattern(prop.value as t.PatternLike);
            } else if (prop.type === "RestElement") {
              removeTypeFromPattern(prop.argument);
            }
          });
          return;
        }
        if ((pattern as t.ArrayPattern).type === "ArrayPattern") {
          const ap = pattern as t.ArrayPattern;
          ap.elements.forEach((el) => {
            if (!el) return;
            if (el.type === "RestElement") {
              removeTypeFromPattern(el.argument);
            } else if (el.type === "Identifier") {
              if (el.typeAnnotation) {
                delete (el as t.Identifier & {
                  typeAnnotation?: t.TSTypeAnnotation;
                }).typeAnnotation;
              }
            } else if (el.type === "AssignmentPattern") {
              removeTypeFromPattern(el.left);
            }
          });
        }
      };

      traverse(ast, {
        // Remove type-only declarations
        TSInterfaceDeclaration(path) {
          path.remove();
        },
        TSTypeAliasDeclaration(path) {
          path.remove();
        },
        TSModuleDeclaration(path) {
          path.remove();
        },
        TSEnumDeclaration(path) {
          // For simplicity, drop enums (optional: could transform to const objects)
          path.remove();
        },
        TSImportEqualsDeclaration(path) {
          path.remove();
        },
        // Unwrap as/assert/satisfies
        TSAsExpression(path) {
          path.replaceWith(path.node.expression as t.Expression);
        },
        TSTypeAssertion(path) {
          path.replaceWith(path.node.expression as t.Expression);
        },
        TSSatisfiesExpression(path) {
          path.replaceWith(path.node.expression as t.Expression);
        },
        // Clean function signatures
        Function(path) {
          const n = path.node as
            | t.FunctionDeclaration
            | t.FunctionExpression
            | t.ArrowFunctionExpression
            | t.ObjectMethod
            | t.ClassMethod
            | t.ClassPrivateMethod;
          // remove generics / return types
          if (
            (n as
              | t.FunctionDeclaration
              | t.FunctionExpression
              | t.ArrowFunctionExpression).typeParameters
          ) {
            delete (n as t.FunctionDeclaration & {
              typeParameters?: t.TSTypeParameterDeclaration;
            }).typeParameters;
          }
          if (
            (n as
              | t.FunctionDeclaration
              | t.FunctionExpression
              | t.ArrowFunctionExpression).returnType
          ) {
            delete (n as t.FunctionDeclaration & {
              returnType?: t.TSTypeAnnotation;
            }).returnType;
          }
          // params
          (n.params ?? []).forEach((p) => {
            if (
              p.type === "Identifier" ||
              p.type === "AssignmentPattern" ||
              p.type === "ObjectPattern" ||
              p.type === "ArrayPattern" ||
              p.type === "RestElement" ||
              p.type === "TSParameterProperty"
            ) {
              removeTypeFromPattern(
                p as t.PatternLike | t.LVal | t.TSParameterProperty,
              );
            }
          });
        },
        // Class fields and methods
        ClassProperty(path) {
          const n = path.node as t.ClassProperty;
          if (
            (n as t.ClassProperty & { typeAnnotation?: t.TSTypeAnnotation })
              .typeAnnotation
          ) {
            delete (n as t.ClassProperty & {
              typeAnnotation?: t.TSTypeAnnotation;
            }).typeAnnotation;
          }
          if ((n as t.ClassProperty & { definite?: boolean }).definite) {
            delete (n as t.ClassProperty & { definite?: boolean }).definite;
          }
          if ((n as t.ClassProperty & { declare?: boolean }).declare) {
            delete (n as t.ClassProperty & { declare?: boolean }).declare;
          }
        },
        TSParameterProperty(path) {
          path.replaceWith(
            path.node.parameter as
              | t.Identifier
              | t.AssignmentPattern
              | t.RestElement,
          );
        },
        Identifier(path) {
          const id = path.node as t.Identifier & {
            typeAnnotation?: t.TSTypeAnnotation;
          };
          if (id.typeAnnotation) delete id.typeAnnotation;
        },
        // Imports/exports: drop type-only
        ImportDeclaration(path) {
          const n = path.node as t.ImportDeclaration & {
            importKind?: "type" | "value";
          };
          if (n.importKind === "type") {
            path.remove();
            return;
          }
          if (n.specifiers && n.specifiers.length) {
            n.specifiers = n.specifiers.filter(
              (s) =>
                (s as t.ImportSpecifier & { importKind?: "type" | "value" })
                  .importKind !== "type",
            );
            if (n.specifiers.length === 0) path.remove();
          }
        },
        ExportNamedDeclaration(path) {
          const n = path.node as t.ExportNamedDeclaration & {
            exportKind?: "type" | "value";
          };
          if (n.exportKind === "type") {
            path.remove();
          }
        },
      });

      // Generate JavaScript
      const generator =
        ((generate as unknown) as { default?: typeof generate }).default ??
          generate;
      const { code } = generator(ast, {
        comments: false,
        compact: false,
        concise: false,
      });
      return code as string;
    } catch {
      // Fallback to original code
      return latestCode;
    }
  }, [latestCode]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (viewMode !== "steps") return;
    setIsDragging(true);
    dragStartRef.current = {
      x: 0, // No horizontal movement
      y: e.clientY - position.y,
    };
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
      containerRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || viewMode !== "steps") return;

    requestAnimationFrame(() => {
      // Only allow vertical movement for vertical flow
      const next = e.clientY - dragStartRef.current.y;
      setPosition({ x: 0, y: clampY(next) });
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
      containerRef.current.style.userSelect = "auto";
    }
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (viewMode !== "steps") return;
    e.preventDefault();
    const newY = position.y - e.deltaY;
    setPosition({ x: 0, y: clampY(newY) });
  };

  return (
    <Box
      ref={containerRef}
      borderWidth="1px"
      borderRadius="md"
      h="100%"
      w="100%"
      overflow="hidden"
      overflowY={viewMode === "steps" ? "auto" : "hidden"}
      overflowX="hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      cursor={viewMode === "steps" ? "grab" : "default"}
      position="relative"
      bg="bg"
    >
      {/* View toggle */}
      <Box position="absolute" top={2} right={2} zIndex={2}>
        <ButtonGroup size="xs" attached variant="outline">
          <Button
            onClick={() => setViewMode("steps")}
            colorPalette={viewMode === "steps" ? "blue" : undefined}
            variant={viewMode === "steps" ? "solid" : "outline"}
          >
            Steps
          </Button>
          <Button
            onClick={() => setViewMode("code")}
            colorPalette={viewMode === "code" ? "blue" : undefined}
            variant={viewMode === "code" ? "solid" : "outline"}
          >
            Code
          </Button>
        </ButtonGroup>
      </Box>
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

      {viewMode === "steps" && (
        <Box
          style={{
            position: "absolute",
            width: "100%",
            transform: `translateY(${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.08s ease-out",
            zIndex: 1,
          }}
          ref={contentRef}
        >
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
              <VStack align="stretch" gap={1.5} w="100%" py={3} px={3}>
                {workflowBody.map((statement, index) => (
                  <AstNode key={index} node={statement} depth={0} />
                ))}
              </VStack>
            )
            : <Text>`workflow()` function not found.</Text>}
        </Box>
      )}

      {viewMode === "code" && (
        <Box position="absolute" inset={0} overflow="auto" zIndex={1} p={3}>
          <Box as="pre" fontFamily="mono" fontSize="sm" m={0} whiteSpace="pre">
            {rawJsCode}
          </Box>
        </Box>
      )}
    </Box>
  );
};
