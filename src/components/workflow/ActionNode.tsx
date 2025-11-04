import { Badge, Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import {
  LuArrowRight,
  LuCode,
  LuCornerDownRight,
  LuDatabase,
  LuGitBranch,
  LuMousePointer,
  LuPlay,
} from "react-icons/lu";
import React, { useState } from "react";
import type { WorkflowAction } from "./action-grouper";
import generate from "@babel/generator";
import type { Statement } from "@babel/types";

const generateCode = (node: Statement) => {
  try {
    // @ts-expect-error @babel/generator's ESM/CJS module is a bit weird.
    const generator = generate.default ?? generate;
    const { code } = generator(node, {
      compact: false,
      comments: false,
      concise: false,
    });
    return code;
  } catch {
    return "";
  }
};

const getActionIcon = (type: string, size = 20) => {
  switch (type) {
    case "navigation":
      return <LuArrowRight size={size} />;
    case "interaction":
      return <LuMousePointer size={size} />;
    case "data-extraction":
      return <LuDatabase size={size} />;
    case "control-flow":
      return <LuGitBranch size={size} />;
    case "return":
      return <LuCornerDownRight size={size} />;
    case "computation":
    default:
      return <LuCode size={size} />;
  }
};

const getActionColor = (type: string, importance: string) => {
  if (importance === "high") {
    switch (type) {
      case "navigation":
        return "blue";
      case "interaction":
        return "purple";
      case "data-extraction":
        return "green";
      case "control-flow":
        return "orange";
      case "return":
        return "pink";
      default:
        return "gray";
    }
  }
  return "gray";
};

export interface ActionNodeProps {
  action: WorkflowAction;
  index: number;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ action, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = getActionColor(action.type, action.importance);

  return (
    <Card.Root
      variant="outline"
      size="sm"
      cursor="pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      borderLeft="4px solid"
      borderColor={`${colorScheme}.500`}
      _hover={{
        shadow: "md",
        borderColor: `${colorScheme}.600`,
      }}
      _dark={{
        _hover: {
          borderColor: `${colorScheme}.400`,
        },
      }}
      transition="all 0.2s"
      bg={action.importance === "high" ? "bg" : "bg.muted"}
    >
      <Card.Body>
        <VStack align="stretch" gap={2}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack gap={2}>
              <Box color={`${colorScheme}.500`}>
                {getActionIcon(action.type, 20)}
              </Box>
              <VStack align="start" gap={0}>
                <HStack gap={2}>
                  <Text fontWeight="semibold" fontSize="sm">
                    {action.title}
                  </Text>
                  {action.importance === "high" && (
                    <Badge colorPalette={colorScheme} size="xs">
                      重要
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  {action.description}
                </Text>
              </VStack>
            </HStack>
            <Box
              transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
              transition="transform 0.2s"
            >
              <LuPlay size={12} />
            </Box>
          </HStack>

          {/* Variables */}
          {action.variables && action.variables.length > 0 && (
            <HStack gap={1} flexWrap="wrap">
              {action.variables.map((varName) => (
                <Badge key={varName} colorPalette="purple" size="xs" variant="subtle">
                  {varName}
                </Badge>
              ))}
            </HStack>
          )}

          {/* Human-readable description (always shown) */}
          {action.humanReadable && (
            <Box
              bg={{
                base: `${colorScheme}.50`,
                _dark: `${colorScheme}.950`,
              }}
              p={3}
              rounded="md"
              borderLeft="3px solid"
              borderColor={{
                base: `${colorScheme}.400`,
                _dark: `${colorScheme}.600`,
              }}
            >
              <Text fontSize="sm" color="fg" lineHeight="1.6">
                {action.humanReadable}
              </Text>
            </Box>
          )}

          {/* Detailed steps (expanded state) */}
          {isExpanded && action.details && action.details.length > 0 && (
            <VStack align="stretch" gap={2} mt={2} pl={4}>
              {action.details.map((detail, idx) => (
                <HStack key={idx} gap={2} align="start">
                  <Box color={`${colorScheme}.500`} mt={0.5}>
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
              <Text
                fontSize="xs"
                color="fg.muted"
                mb={1}
                fontWeight="medium"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const codeBlock = e.currentTarget.nextElementSibling;
                  if (codeBlock) {
                    codeBlock.style.display = codeBlock.style.display === "none" ? "block" : "none";
                  }
                }}
                _hover={{ color: "fg" }}
              >
                📝 技術者向けコードを表示
              </Text>
              <VStack align="stretch" gap={1} display="none">
                {action.statements.map((statement, idx) => (
                  <Box
                    key={idx}
                    bg={{
                      base: "gray.50",
                      _dark: "gray.800",
                    }}
                    p={2}
                    rounded="md"
                    fontSize="xs"
                    fontFamily="monospace"
                    borderLeft="2px solid"
                    borderColor={{
                      base: `${colorScheme}.300`,
                      _dark: `${colorScheme}.600`,
                    }}
                  >
                    <Text
                      as="pre"
                      fontSize="xs"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {generateCode(statement)}
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

