import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { Box, Code, HStack, Text, VStack } from "@chakra-ui/react";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
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

interface WorkflowCanvasProps {
  workflow: Workflow;
}

const VerticalConnector = () => (
  <Box
    w="20px"
    flexShrink={0}
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box
      h="2px"
      w="20px"
      bg="gray.400"
      _dark={{ bg: "gray.600" }}
    />
  </Box>
);

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

const AstNode: React.FC<{ node: Statement }> = ({ node }) => {
  // Early return for invalid nodes
  if (!node || !node.type) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        minWidth="200px"
        flexShrink={0}
        bg="red.50"
        borderColor="red.200"
      >
        <Text color="red.500">Invalid node</Text>
      </Box>
    );
  }
  const NodeContainer: React.FC<React.PropsWithChildren<{ title: string }>> = ({
    title,
    children,
  }) => (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      minWidth="200px"
      flexShrink={0}
    >
      <VStack align="flex-start">
        <Text fontWeight="bold">{title}</Text>
        {children}
      </VStack>
    </Box>
  );

  const BodyRenderer: React.FC<{
    body: Statement | Statement[];
    title?: string;
  }> = ({ body, title = "Body" }) => (
    <Box
      p={2}
      mt={2}
      borderWidth="1px"
      borderRadius="md"
      bg="blackAlpha.50"
      _dark={{ bg: "whiteAlpha.50" }}
      w="100%"
    >
      <Text fontWeight="semibold">{title}</Text>
      <HStack gap={0} align="center" mt={2} flexWrap="wrap">
        {(Array.isArray(body) ? body : [body])
          .map((stmt, index, arr) => (
            <React.Fragment key={index}>
              <AstNode node={stmt} />
              {index < arr.length - 1 && <VerticalConnector />}
            </React.Fragment>
          ))}
      </HStack>
    </Box>
  );

  switch (node.type) {
    case "VariableDeclaration": {
      const varDecl = node as VariableDeclaration;
      if (!varDecl.declarations) {
        return (
          <NodeContainer title="Variable (invalid)">
            <Code>No declarations</Code>
          </NodeContainer>
        );
      }
      return (
        <NodeContainer title={`Variable: ${varDecl.kind}`}>
          {varDecl.declarations.map((declaration, i) => (
            <Code key={i}>{generateCode(declaration)}</Code>
          ))}
        </NodeContainer>
      );
    }
    case "ReturnStatement": {
      const returnStmt = node as ReturnStatement;
      return (
        <NodeContainer title="Return">
          <Code>{generateCode(returnStmt.argument)}</Code>
        </NodeContainer>
      );
    }
    case "ExpressionStatement": {
      const expr = node as ExpressionStatement;
      if (!expr.expression) {
        return (
          <NodeContainer title="Expression (invalid)">
            <Code>No expression</Code>
          </NodeContainer>
        );
      }
      if (expr.expression.type === "CallExpression") {
        const callExpr = expr.expression;
        return (
          <NodeContainer title={`Call: ${generateCode(callExpr.callee)}`}>
            <Code>{callExpr.arguments?.length || 0} arguments</Code>
          </NodeContainer>
        );
      }
      return (
        <NodeContainer title="Expression">
          <Code>{generateCode(expr.expression)}</Code>
        </NodeContainer>
      );
    }
    case "IfStatement": {
      const ifStmt = node as IfStatement;
      if (!ifStmt.test || !ifStmt.consequent) {
        return (
          <NodeContainer title="If (invalid)">
            <Code>Missing test or consequent</Code>
          </NodeContainer>
        );
      }
      return (
        <NodeContainer title="If">
          <Code>Condition: {generateCode(ifStmt.test)}</Code>
          <Box mt={2}>
            <HStack align="center" gap={0} flexWrap="wrap">
              <BodyRenderer body={ifStmt.consequent} title="True" />
              {ifStmt.alternate && (
                <>
                  <VerticalConnector />
                  <BodyRenderer body={ifStmt.alternate} title="False" />
                </>
              )}
            </HStack>
          </Box>
        </NodeContainer>
      );
    }
    case "ForInStatement":
    case "ForOfStatement": {
      const loopStmt = node as ForInStatement | ForOfStatement;
      const loopType = loopStmt.type === "ForInStatement"
        ? "For...In"
        : "For...Of";
      return (
        <NodeContainer title={`${loopType} Loop`}>
          <Code>Left: {generateCode(loopStmt.left)}</Code>
          <Code>Right: {generateCode(loopStmt.right)}</Code>
          <BodyRenderer body={loopStmt.body} />
        </NodeContainer>
      );
    }
    case "WhileStatement": {
      const whileStmt = node as WhileStatement;
      return (
        <NodeContainer title="While Loop">
          <Code>Test: {generateCode(whileStmt.test)}</Code>
          <BodyRenderer body={whileStmt.body} />
        </NodeContainer>
      );
    }
    case "ForStatement": {
      const forStmt = node as ForStatement;
      return (
        <NodeContainer title="For Loop">
          <Code>Init: {generateCode(forStmt.init)}</Code>
          <Code>Test: {generateCode(forStmt.test)}</Code>
          <Code>Update: {generateCode(forStmt.update)}</Code>
          <BodyRenderer body={forStmt.body} />
        </NodeContainer>
      );
    }
    case "TryStatement": {
      const tryStmt = node as TryStatement;
      if (!tryStmt.block) {
        return (
          <NodeContainer title="Try...Catch (invalid)">
            <Code>Missing try block</Code>
          </NodeContainer>
        );
      }
      return (
        <NodeContainer title="Try...Catch">
          <HStack align="center" gap={0} flexWrap="wrap">
            <BodyRenderer body={tryStmt.block.body} title="Try" />
            {tryStmt.handler && tryStmt.handler.body && (
              <>
                <VerticalConnector />
                <BodyRenderer
                  body={tryStmt.handler.body.body}
                  title={`Catch (${generateCode(tryStmt.handler.param)})`}
                />
              </>
            )}
          </HStack>
        </NodeContainer>
      );
    }
    case "BlockStatement": {
      const blockStmt = node as { body?: Statement[] };
      if (!blockStmt.body || !Array.isArray(blockStmt.body)) {
        return (
          <NodeContainer title="Block (invalid)">
            <Code>No body</Code>
          </NodeContainer>
        );
      }
      return <BodyRenderer body={blockStmt.body} title="Block" />;
    }
    default:
      return (
        <NodeContainer title={`Statement: ${node.type}`}>
          <Code>{generateCode(node)}</Code>
        </NodeContainer>
      );
  }
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

    requestAnimationFrame(() => {
      const x = e.clientX - dragStartRef.current.x;
      const y = e.clientY - dragStartRef.current.y;
      setPosition({ x, y });
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
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // mouse position relative to container
    const mouseY = e.clientY - rect.top;

    const scaleAmount = 0.1;
    const newScale = scale - e.deltaY * scaleAmount * 0.01;
    const clampedScale = Math.min(Math.max(0.5, newScale), 2);

    // The point in the content that was under the mouse
    const mousePointX = (mouseX - position.x) / scale;
    const mousePointY = (mouseY - position.y) / scale;

    // The new top-left position to keep the content point under the mouse
    const newX = mouseX - mousePointX * clampedScale;
    const newY = mouseY - mousePointY * clampedScale;

    setScale(clampedScale);
    setPosition({ x: newX, y: newY });
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
      onWheel={handleWheel}
      cursor="grab"
      position="relative"
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
    >
      {/* Light mode grid pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px),
            radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 100px 100px",
          backgroundPosition: "0 0, 50px 50px",
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
            radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px, 100px 100px",
          backgroundPosition: "0 0, 50px 50px",
        }}
      />

      <Box
        p={5}
        style={{
          position: "absolute",
          width: "max-content",
          minWidth: "100%",
          transform:
            `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          zIndex: 1,
        }}
      >
        {/* Render based on memoized parsing result */}
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
            <VStack align="flex-start" gap={4}>
              <HStack gap={0} align="center" flexWrap="wrap">
                {workflowBody.map((statement, index, arr) => (
                  <React.Fragment key={index}>
                    <AstNode node={statement} />
                    {index < arr.length - 1 && <VerticalConnector />}
                  </React.Fragment>
                ))}
              </HStack>
            </VStack>
          )
          : <Text>`workflow()` function not found.</Text>}
      </Box>
    </Box>
  );
};
