/**
 * @fileoverview アクションノードコンポーネント
 *
 * ワークフローアクション（複数のステップをグループ化したもの）を表示
 *
 * @module components/workflow/ActionNode
 */

import { Badge, Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import {
  LuArrowRight,
  LuChevronRight,
  LuCode,
  LuCornerDownLeft,
  LuCornerDownRight,
  LuDatabase,
  LuFileText,
  LuGitBranch,
  LuMousePointer,
  LuRepeat,
  LuShield,
  LuVariable,
} from "react-icons/lu";
import React, { useState } from "react";
import { generateCode, generateReadableCode } from "./utils/code-generator";
import { ACTION_TYPES, type ActionType, getActionColor } from "./constants";
import type { WorkflowAction } from "./action-grouper";
import type {
  BlockStatement,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  IfStatement,
  ReturnStatement,
  Statement,
  TryStatement,
  VariableDeclaration,
  WhileStatement,
} from "@babel/types";

interface ActionNodeProps {
  action: WorkflowAction;
}

/**
 * アクションタイプに応じたアイコンを返す
 */
const getActionIcon = (type: ActionType, size = 20) => {
  switch (type) {
    case ACTION_TYPES.NAVIGATION:
      return <LuArrowRight size={size} />;
    case ACTION_TYPES.INTERACTION:
      return <LuMousePointer size={size} />;
    case ACTION_TYPES.DATA_EXTRACTION:
      return <LuDatabase size={size} />;
    case ACTION_TYPES.CONTROL_FLOW:
      return <LuGitBranch size={size} />;
    case ACTION_TYPES.RETURN:
      return <LuCornerDownRight size={size} />;
    case ACTION_TYPES.COMPUTATION:
    default:
      return <LuCode size={size} />;
  }
};

export const ActionNode: React.FC<ActionNodeProps> = ({ action }) => {
  // 制御フローの場合はデフォルトで展開
  const [isExpanded, setIsExpanded] = useState(action.type === "control-flow");
  const colorScheme = getActionColor(action.type, action.importance);

  return (
    <Card.Root
      variant="outline"
      size="sm"
      cursor="pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      borderLeft="4px solid"
      borderColor={`${colorScheme}.300`}
      _hover={{
        shadow: "md",
        borderColor: `${colorScheme}.400`,
        transform: "translateY(-1px)",
      }}
      _dark={{
        borderColor: `${colorScheme}.800`,
        _hover: {
          borderColor: `${colorScheme}.700`,
        },
      }}
      transition="all 0.2s"
      bg={action.importance === "high" ? "bg" : "bg.muted"}
    >
      <Card.Body p={{ base: 3, md: 4 }}>
        <VStack align="stretch" gap={2.5}>
          {/* Header */}
          <HStack justify="space-between" align="start">
            <HStack gap={3} align="start" flex={1}>
              <Box
                color={`${colorScheme}.400`}
                _dark={{ color: `${colorScheme}.500` }}
                flexShrink={0}
                mt={0.5}
              >
                {getActionIcon(action.type, 22)}
              </Box>
              <VStack align="start" gap={0.5} flex={1} minW={0}>
                <HStack gap={2} flexWrap="wrap">
                  <Text fontWeight="semibold" fontSize="sm" lineHeight="1.4">
                    {action.title}
                  </Text>
                  {action.importance === "high" && (
                    <Badge
                      colorPalette={colorScheme}
                      size="xs"
                      fontWeight="medium"
                    >
                      重要
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="fg.muted" lineHeight="1.4">
                  {action.description}
                </Text>
              </VStack>
            </HStack>
            <Box
              transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
              transition="transform 0.2s"
              color="fg.muted"
              _hover={{ color: "fg" }}
              flexShrink={0}
              mt={0.5}
            >
              <LuChevronRight size={14} />
            </Box>
          </HStack>

          {/* Variables */}
          {action.variables && action.variables.length > 0 && (
            <HStack gap={1.5} flexWrap="wrap" mt={0.5}>
              {action.variables.map((varName: string) => (
                <Badge
                  key={varName}
                  colorPalette="purple"
                  size="xs"
                  variant="subtle"
                  fontWeight="medium"
                  px={2}
                  py={0.5}
                >
                  {varName}
                </Badge>
              ))}
            </HStack>
          )}

          {/* Human-readable description (only shown for non-control-flow) */}
          {action.type !== "control-flow" && action.humanReadable && (
            <Box
              bg={{
                base: `${colorScheme}.50`,
                _dark: `${colorScheme}.900`,
              }}
              p={{ base: 3, md: 3.5 }}
              rounded="md"
              borderLeft="3px solid"
              borderColor={{
                base: `${colorScheme}.200`,
                _dark: `${colorScheme}.900`,
              }}
              mt={1}
            >
              <Text fontSize="sm" color="fg" lineHeight="1.6">
                {action.humanReadable}
              </Text>
            </Box>
          )}

          {/* Nested control flow content (expanded state) */}
          {isExpanded && action.type === "control-flow" &&
            action.statements.length > 0 && (
            <VStack align="stretch" gap={3} mt={2}>
              {action.statements.map((statement, idx) => (
                <NestedControlFlowCard
                  key={idx}
                  statement={statement}
                  depth={0}
                  colorScheme={colorScheme}
                />
              ))}
            </VStack>
          )}

          {/* Detailed steps (fallback for non-control-flow) */}
          {isExpanded &&
            action.type !== "control-flow" &&
            action.details &&
            action.details.length > 0 && (
            <VStack align="stretch" gap={2} mt={2} pl={4}>
              {action.details.map((detail: string, idx: number) => (
                <HStack key={idx} gap={2} align="start">
                  <Box
                    color={`${colorScheme}.300`}
                    _dark={{ color: `${colorScheme}.500` }}
                    mt={0.5}
                  >
                    <LuCornerDownRight size={14} />
                  </Box>
                  <Text fontSize="xs" color="fg.muted" flex={1}>
                    {detail}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}

          {/* Code (only shown when expanded and user clicks "Show code" button) */}
          {isExpanded && (
            <Box mt={2}>
              <HStack
                fontSize="xs"
                color="fg.muted"
                mb={1}
                fontWeight="medium"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const codeBlock = e.currentTarget.nextElementSibling as
                    | HTMLElement
                    | null;
                  if (codeBlock) {
                    codeBlock.style.display = codeBlock.style.display === "none"
                      ? "block"
                      : "none";
                  }
                }}
                _hover={{ color: "fg" }}
                gap={1}
              >
                <LuFileText size={14} />
                <Text>技術者向けコードを表示</Text>
              </HStack>
              <VStack align="stretch" gap={1} display="none">
                {action.statements.map((statement, idx) => (
                  <Box
                    key={idx}
                    bg={{
                      base: "gray.50",
                      _dark: "gray.900",
                    }}
                    p={2}
                    rounded="md"
                    fontSize="xs"
                    fontFamily="monospace"
                    borderLeft="2px solid"
                    borderColor={{
                      base: `${colorScheme}.200`,
                      _dark: `${colorScheme}.900`,
                    }}
                  >
                    <Text
                      as="pre"
                      fontSize="xs"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {generateReadableCode(statement)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

/**
 * ネストされた制御フローをCardとして表示するコンポーネント
 */
const NestedControlFlowCard: React.FC<{
  statement: Statement;
  depth: number;
  colorScheme: string;
}> = ({ statement, depth, colorScheme }) => {
  // Hooks must be called at the top level
  const [isExpanded, setIsExpanded] = useState(depth === 0);

  // ステートメントの説明を生成
  const getStatementDescription = (stmt: Statement): string => {
    const code = generateCode(stmt);
    if (
      stmt.type === "ExpressionStatement" &&
      stmt.expression.type === "CallExpression"
    ) {
      const callee = generateCode(stmt.expression.callee);
      if (callee.includes("goto") || callee.includes("navigate")) {
        return "ページに移動";
      } else if (callee.includes("click")) {
        return "要素をクリック";
      } else if (callee.includes("type") || callee.includes("fill")) {
        return "テキストを入力";
      } else if (
        callee.includes("textContent") || callee.includes("innerHTML")
      ) {
        return "テキストを取得";
      }
      return callee.length > 40 ? `${callee.substring(0, 37)}...` : callee;
    } else if (stmt.type === "VariableDeclaration") {
      const varDecl = stmt;
      if (varDecl.declarations && varDecl.declarations[0]) {
        const varName = varDecl.declarations[0].id.type === "Identifier"
          ? varDecl.declarations[0].id.name
          : null;
        if (varName) {
          return `変数 ${varName} を準備`;
        }
      }
      return "変数を準備";
    } else if (stmt.type === "ReturnStatement") {
      return "結果を返す";
    }
    return code.length > 40 ? `${code.substring(0, 37)}...` : code;
  };

  // ブロック内のステートメントを取得
  const getBlockStatements = (
    body: Statement | BlockStatement,
  ): Statement[] => {
    if (body.type === "BlockStatement") {
      return body.body;
    }
    return [body];
  };

  if (statement.type === "IfStatement") {
    const ifStmt = statement as IfStatement;
    const condition = ifStmt.test ? generateCode(ifStmt.test) : "";
    const conditionText = condition.length > 50
      ? `${condition.substring(0, 47)}...`
      : condition;

    return (
      <Card.Root
        variant="outline"
        size="sm"
        borderLeft={`${4 + depth * 2}px solid`}
        borderColor={{
          base: `${colorScheme}.${200 + depth * 50}`,
          _dark: `${colorScheme}.${800 + depth * 30}`,
        }}
        bg={depth > 0 ? "bg.muted" : "bg"}
        ml={depth * 4}
      >
        <Card.Body>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <Box
                  color={`${colorScheme}.300`}
                  _dark={{ color: `${colorScheme}.500` }}
                >
                  <LuGitBranch size={16} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="medium" fontSize="sm">
                    条件分岐
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    if ({conditionText})
                  </Text>
                </VStack>
              </HStack>
              <Box
                transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
                transition="transform 0.2s"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <LuChevronRight size={12} />
              </Box>
            </HStack>

            {isExpanded && (
              <VStack align="stretch" gap={2} mt={1}>
                {/* Then block */}
                <Box
                  bg={`${colorScheme}.50`}
                  _dark={{
                    bg: `${colorScheme}.950`,
                  }}
                  p={2}
                  rounded="md"
                  borderLeft="2px solid"
                  borderColor={{
                    base: `${colorScheme}.300`,
                    _dark: `${colorScheme}.800`,
                  }}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color={`${colorScheme}.800`}
                    _dark={{ color: `${colorScheme}.400` }}
                    mb={1}
                  >
                    もし合致した場合:
                  </Text>
                  <VStack align="stretch" gap={1.5} mt={2}>
                    {getBlockStatements(ifStmt.consequent).map((stmt, idx) => (
                      <NestedControlFlowCard
                        key={idx}
                        statement={stmt}
                        depth={depth + 1}
                        colorScheme={colorScheme}
                      />
                    ))}
                  </VStack>
                </Box>

                {/* Else block */}
                {ifStmt.alternate && (
                  <Box
                    bg={`${colorScheme}.50`}
                    _dark={{
                      bg: `${colorScheme}.950`,
                    }}
                    p={2}
                    rounded="md"
                    borderLeft="2px solid"
                    borderColor={{
                      base: `${colorScheme}.200`,
                      _dark: `${colorScheme}.900`,
                    }}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color={`${colorScheme}.800`}
                      _dark={{ color: `${colorScheme}.400` }}
                      mb={1}
                    >
                      合致しなかった場合:
                    </Text>
                    <VStack align="stretch" gap={1.5} mt={2}>
                      {ifStmt.alternate.type === "BlockStatement"
                        ? getBlockStatements(ifStmt.alternate).map((
                          stmt,
                          idx,
                        ) => (
                          <NestedControlFlowCard
                            key={idx}
                            statement={stmt}
                            depth={depth + 1}
                            colorScheme={colorScheme}
                          />
                        ))
                        : (
                          <NestedControlFlowCard
                            statement={ifStmt.alternate}
                            depth={depth + 1}
                            colorScheme={colorScheme}
                          />
                        )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  if (
    statement.type === "ForStatement" ||
    statement.type === "WhileStatement" ||
    statement.type === "ForInStatement" ||
    statement.type === "ForOfStatement"
  ) {
    const loopStmt = statement as
      | ForStatement
      | WhileStatement
      | ForInStatement
      | ForOfStatement;
    let loopTitle = "繰り返し";
    let loopDesc = "";

    if (statement.type === "ForStatement") {
      const forStmt = statement as ForStatement;
      const init = forStmt.init ? generateCode(forStmt.init) : "";
      const test = forStmt.test ? generateCode(forStmt.test) : "";
      loopDesc = `for (${init}; ${test}; ...)`;
      loopTitle = "繰り返し（for）";
    } else if (statement.type === "WhileStatement") {
      const whileStmt = statement as WhileStatement;
      const test = whileStmt.test ? generateCode(whileStmt.test) : "";
      loopDesc = `while (${test})`;
      loopTitle = "繰り返し（while）";
    } else if (statement.type === "ForOfStatement") {
      const forOfStmt = statement as ForOfStatement;
      const left = generateCode(forOfStmt.left);
      const right = generateCode(forOfStmt.right);
      loopDesc = `for (${left} of ${right})`;
      loopTitle = "繰り返し（for...of）";
    } else if (statement.type === "ForInStatement") {
      const forInStmt = statement as ForInStatement;
      const left = generateCode(forInStmt.left);
      const right = generateCode(forInStmt.right);
      loopDesc = `for (${left} in ${right})`;
      loopTitle = "繰り返し（for...in）";
    }

    return (
      <Card.Root
        variant="outline"
        size="sm"
        borderLeft={`${4 + depth * 2}px solid`}
        borderColor={{
          base: `${colorScheme}.${200 + depth * 50}`,
          _dark: `${colorScheme}.${800 + depth * 30}`,
        }}
        bg={depth > 0 ? "bg.muted" : "bg"}
        ml={depth * 4}
      >
        <Card.Body>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <Box
                  color={`${colorScheme}.300`}
                  _dark={{ color: `${colorScheme}.500` }}
                >
                  <LuRepeat size={16} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="medium" fontSize="sm">
                    {loopTitle}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {loopDesc.length > 50
                      ? `${loopDesc.substring(0, 47)}...`
                      : loopDesc}
                  </Text>
                </VStack>
              </HStack>
              <Box
                transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
                transition="transform 0.2s"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <LuChevronRight size={12} />
              </Box>
            </HStack>

            {isExpanded && loopStmt.body && (
              <Box
                bg={`${colorScheme}.50`}
                _dark={{
                  bg: `${colorScheme}.950`,
                }}
                p={2}
                rounded="md"
                borderLeft="2px solid"
                borderColor={{
                  base: `${colorScheme}.300`,
                  _dark: `${colorScheme}.800`,
                }}
                mt={2}
              >
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color={`${colorScheme}.800`}
                  _dark={{ color: `${colorScheme}.400` }}
                  mb={2}
                >
                  繰り返し処理:
                </Text>
                <VStack align="stretch" gap={1.5}>
                  {getBlockStatements(loopStmt.body).map((stmt, idx) => (
                    <NestedControlFlowCard
                      key={idx}
                      statement={stmt}
                      depth={depth + 1}
                      colorScheme={colorScheme}
                    />
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // TryStatement
  if (statement.type === "TryStatement") {
    const tryStmt = statement as TryStatement;

    return (
      <Card.Root
        variant="outline"
        size="sm"
        borderLeft={`${4 + depth * 2}px solid`}
        borderColor={{
          base: `red.${200 + depth * 50}`,
          _dark: `red.${700 + depth * 50}`,
        }}
        bg={depth > 0 ? "bg.muted" : "bg"}
        ml={depth * 4}
      >
        <Card.Body>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <Box color="red.300" _dark={{ color: "red.400" }}>
                  <LuShield size={16} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="medium" fontSize="sm">
                    エラー処理
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    try...catch
                  </Text>
                </VStack>
              </HStack>
              <Box
                transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
                transition="transform 0.2s"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <LuChevronRight size={12} />
              </Box>
            </HStack>

            {isExpanded && (
              <VStack align="stretch" gap={2} mt={1}>
                {/* Try block */}
                <Box
                  bg="red.50"
                  _dark={{ bg: "red.950" }}
                  p={2}
                  rounded="md"
                  borderLeft="2px solid"
                  borderColor={{
                    base: "red.200",
                    _dark: "red.800",
                  }}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="red.800"
                    _dark={{ color: "red.300" }}
                    mb={1}
                  >
                    通常実行:
                  </Text>
                  <VStack align="stretch" gap={1.5} mt={2}>
                    {tryStmt.block?.body.map((stmt, idx) => (
                      <NestedControlFlowCard
                        key={idx}
                        statement={stmt}
                        depth={depth + 1}
                        colorScheme="red"
                      />
                    ))}
                  </VStack>
                </Box>

                {/* Catch block */}
                {tryStmt.handler && (
                  <Box
                    bg="red.50"
                    _dark={{ bg: "red.950" }}
                    p={2}
                    rounded="md"
                    borderLeft="2px solid"
                    borderColor={{
                      base: "red.300",
                      _dark: "red.700",
                    }}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="red.800"
                      _dark={{ color: "red.300" }}
                      mb={1}
                    >
                      エラーが発生した場合:
                      {tryStmt.handler.param &&
                        tryStmt.handler.param.type === "Identifier" &&
                        ` (${tryStmt.handler.param.name})`}
                    </Text>
                    <VStack align="stretch" gap={1.5} mt={2}>
                      {tryStmt.handler.body.body.map((stmt, idx) => (
                        <NestedControlFlowCard
                          key={idx}
                          statement={stmt}
                          depth={depth + 1}
                          colorScheme="red"
                        />
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // VariableDeclaration
  if (statement.type === "VariableDeclaration") {
    const varDecl = statement as VariableDeclaration;
    const decl = varDecl.declarations[0];
    if (decl && decl.id.type === "Identifier") {
      const varName = decl.id.name;
      const initCode = decl.init ? generateCode(decl.init) : "";
      const initValue = initCode.length > 50
        ? `${initCode.substring(0, 47)}...`
        : initCode;

      let title = `変数 ${varName}`;
      let description = initValue ? `= ${initValue}` : "を準備";

      if (initCode.includes("newPage")) {
        title = `新しいブラウザページ ${varName}`;
        description = "を作成";
      } else if (initCode.includes("title")) {
        title = `ページのタイトル`;
        description = `を取得して ${varName} に保存`;
      } else if (
        initCode.includes("textContent") || initCode.includes("innerHTML")
      ) {
        title = `要素のテキスト`;
        description = `を取得して ${varName} に保存`;
      }

      return (
        <Card.Root
          variant="outline"
          size="sm"
          borderLeft={`${3 + depth * 2}px solid`}
          borderColor={{
            base: "purple.200",
            _dark: "purple.700",
          }}
          bg={depth > 0 ? "bg.muted" : "bg"}
          ml={depth * 4}
        >
          <Card.Body p={2}>
            <HStack gap={2}>
              <Box color="purple.300" _dark={{ color: "purple.400" }}>
                <LuVariable size={14} />
              </Box>
              <VStack align="start" gap={0} flex={1}>
                <Text fontWeight="medium" fontSize="xs" color="fg">
                  {title}
                </Text>
                {description && (
                  <Text fontSize="2xs" color="fg.muted">
                    {description}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      );
    }
  }

  // ExpressionStatement (function calls)
  if (statement.type === "ExpressionStatement") {
    const exprStmt = statement as ExpressionStatement;
    if (exprStmt.expression.type === "CallExpression") {
      const callExpr = exprStmt.expression;
      const callee = generateCode(callExpr.callee);
      const args = callExpr.arguments.map((arg) => {
        const argCode = generateCode(arg as unknown as Statement);
        return argCode.length > 30 ? `${argCode.substring(0, 27)}...` : argCode;
      });
      const argsText = args.length > 0 ? `(${args.join(", ")})` : "()";

      let icon = <LuCode size={14} />;
      let title = callee;
      let description = argsText;
      let cardColor = "teal";

      if (callee.includes("goto") || callee.includes("navigate")) {
        icon = <LuArrowRight size={14} />;
        title = "ページに移動";
        description = args.length > 0 ? `→ ${args[0]}` : "";
        cardColor = "blue";
      } else if (callee.includes("click")) {
        icon = <LuMousePointer size={14} />;
        title = "要素をクリック";
        description = "";
        cardColor = "green";
      } else if (callee.includes("type") || callee.includes("fill")) {
        icon = <LuMousePointer size={14} />;
        title = "テキストを入力";
        description = args.length > 0 ? `→ ${args[0]}` : "";
        cardColor = "green";
      } else if (
        callee.includes("textContent") || callee.includes("innerHTML")
      ) {
        icon = <LuDatabase size={14} />;
        title = "テキストを取得";
        description = "";
        cardColor = "purple";
      } else if (callee.includes("console.log")) {
        title = "コンソールに出力";
        description = args.length > 0 ? `→ ${args[0]}` : "";
        cardColor = "gray";
      } else if (callee.includes("console.error")) {
        title = "エラーを出力";
        description = args.length > 0 ? `→ ${args[0]}` : "";
        cardColor = "red";
      }

      return (
        <Card.Root
          variant="outline"
          size="sm"
          borderLeft={`${3 + depth * 2}px solid`}
          borderColor={{
            base: `${cardColor}.200`,
            _dark: `${cardColor}.700`,
          }}
          bg={depth > 0 ? "bg.muted" : "bg"}
          ml={depth * 4}
        >
          <Card.Body p={2}>
            <HStack gap={2}>
              <Box
                color={`${cardColor}.300`}
                _dark={{ color: `${cardColor}.400` }}
              >
                {icon}
              </Box>
              <VStack align="start" gap={0} flex={1}>
                <Text fontWeight="medium" fontSize="xs" color="fg">
                  {title}
                </Text>
                {description && (
                  <Text fontSize="2xs" color="fg.muted" fontFamily="monospace">
                    {description}
                  </Text>
                )}
                {!description && callee.length > 0 && (
                  <Text fontSize="2xs" color="fg.muted" fontFamily="monospace">
                    {callee.length > 40
                      ? `${callee.substring(0, 37)}...`
                      : callee}
                    {argsText}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      );
    }
  }

  // ReturnStatement
  if (statement.type === "ReturnStatement") {
    const returnStmt = statement as ReturnStatement;
    const returnValue = returnStmt.argument
      ? generateCode(returnStmt.argument)
      : "";
    const returnText = returnValue.length > 50
      ? `${returnValue.substring(0, 47)}...`
      : returnValue;

    return (
      <Card.Root
        variant="outline"
        size="sm"
        borderLeft={`${3 + depth * 2}px solid`}
        borderColor={{
          base: "green.200",
          _dark: "green.700",
        }}
        bg={depth > 0 ? "bg.muted" : "bg"}
        ml={depth * 4}
      >
        <Card.Body p={2}>
          <HStack gap={2}>
            <Box color="green.300" _dark={{ color: "green.400" }}>
              <LuCornerDownLeft size={14} />
            </Box>
            <VStack align="start" gap={0} flex={1}>
              <Text fontWeight="medium" fontSize="xs" color="fg">
                結果を返す
              </Text>
              {returnText && (
                <Text fontSize="2xs" color="fg.muted" fontFamily="monospace">
                  {returnText}
                </Text>
              )}
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // その他のステートメント（フォールバック）
  return (
    <Card.Root
      variant="outline"
      size="sm"
      borderLeft={`${2 + depth * 2}px solid`}
      borderColor={{
        base: `${colorScheme}.${100 + depth * 50}`,
        _dark: `${colorScheme}.${800 + depth * 30}`,
      }}
      bg={depth > 0 ? "bg.muted" : "bg.subtle"}
      ml={depth * 4}
    >
      <Card.Body p={2}>
        <Text fontSize="xs" color="fg">
          {getStatementDescription(statement)}
        </Text>
      </Card.Body>
    </Card.Root>
  );
};
