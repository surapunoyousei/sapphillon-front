/**
 * @fileoverview ワークフローノードコンテナコンポーネント
 *
 * ワークフローのステップを視覚化するための再利用可能なコンテナ。
 * 展開/折りたたみ、アイコン、カラーパレットなどをサポート。
 *
 * @module components/workflow/NodeContainer
 */

import { Box, Code } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuChevronDown, LuChevronRight, LuZap } from "react-icons/lu";
import type { NodeContainerProps } from "./types";
import { ANIMATIONS } from "./constants";

/**
 * ノードコンテナコンポーネント
 *
 * ワークフローのステップやアクションを表示するための汎用コンテナ。
 *
 * ## 機能
 * - 展開/折りたたみ
 * - カスタムアイコン
 * - タイプベースまたはパレットベースのカラースキーム
 * - レスポンシブデザイン
 * - ダークモード対応
 *
 * @example
 * ```tsx
 * <NodeContainer
 *   title="変数を準備"
 *   summary="const x = 10"
 *   icon={<LuVariable />}
 *   palette="purple"
 *   expandable={true}
 * >
 *   <Text>詳細な内容...</Text>
 * </NodeContainer>
 * ```
 */
export const NodeContainer: React.FC<
  React.PropsWithChildren<NodeContainerProps>
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
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

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

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      w="100%"
      mx="auto"
      flexShrink={0}
      transition={`all ${ANIMATIONS.transitionDuration} ${ANIMATIONS.transitionTiming}`}
      bg={colors.bg}
      _dark={{ bg: colors._dark.bg, borderColor: colors._dark.borderColor }}
      borderColor={colors.borderColor}
      _hover={{ borderColor: "gray.300", _dark: { borderColor: "gray.600" } }}
      position="relative"
    >
      {/* 左側のタイプバー */}
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

      {/* ヘッダー行 */}
      <Box px={{ base: 1.5, md: 2.5 }} py={{ base: 1, md: 1.5 }}>
        <Box
          display="flex"
          alignItems="center"
          gap={{ base: 1, md: 2 }}
          minH="24px"
        >
          {/* 展開/折りたたみトグル */}
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
                w={{ base: "14px", md: "18px" }}
                h={{ base: "14px", md: "18px" }}
              >
                {collapsed
                  ? (
                    <LuChevronRight
                      size={12}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )
                  : (
                    <LuChevronDown
                      size={12}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
              </Box>
            )
            : <Box w={{ base: "14px", md: "18px" }} h={{ base: "14px", md: "18px" }} />}

          {/* アイコン */}
          <Box
            w={{ base: 4, md: 5 }}
            h={{ base: 4, md: 5 }}
            borderRadius="sm"
            bg={colors.iconBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={{ base: "2xs", md: "xs" }}
            color={colors.iconColor}
            _dark={{ bg: colors._dark.iconBg, color: colors._dark.iconColor }}
            flexShrink={0}
          >
            {icon}
          </Box>

          {/* タイトル + サマリー */}
          <Box
            flex={1}
            minWidth={0}
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
          >
            <Box
              fontWeight="medium"
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.900"
              _dark={{ color: "gray.200" }}
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Box>
            {summary && (
              <Code
                fontSize={{ base: "2xs", md: "xs" }}
                px={{ base: 1, md: 1.5 }}
                py={{ base: 0, md: 0.5 }}
                borderRadius="sm"
                bg="gray.50"
                color="gray.700"
                _dark={{ bg: "gray.800", color: "gray.300" }}
                whiteSpace="nowrap"
                maxW="100%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {summary}
              </Code>
            )}
          </Box>
        </Box>
      </Box>

      {/* 詳細 */}
      {(!expandable || !collapsed) && children && (
        <Box px={{ base: 1.5, md: 2.5 }} pb={{ base: 1, md: 2 }}>
          <Box w="100%" display="flex" flexDirection="column" gap={1}>
            {children}
          </Box>
        </Box>
      )}
    </Box>
  );
};

