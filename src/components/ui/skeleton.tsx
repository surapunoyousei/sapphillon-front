"use client";

import { Box, HStack, Stack, VStack } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";

export interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  rounded?: string;
  css?: SystemStyleObject;
}

export const Skeleton = ({ 
  height = "4", 
  width = "full", 
  rounded = "md",
  css 
}: SkeletonProps) => {
  return (
    <Box
      height={height}
      width={width}
      rounded={rounded}
      bg="bg.muted"
      css={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "@keyframes pulse": {
          "0%, 100%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.5,
          },
        },
        ...css,
      }}
    />
  );
};

// テーブル用のスケルトン
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <Stack gap={3} p={4}>
      {Array.from({ length: rows }).map((_, i) => (
        <HStack key={i} gap={4}>
          <Skeleton width="40%" height="5" />
          <Skeleton width="30%" height="5" />
          <Skeleton width="20%" height="5" />
          <Skeleton width="10%" height="5" />
        </HStack>
      ))}
    </Stack>
  );
};

// カード用のスケルトン
export const CardSkeleton = () => {
  return (
    <Box p={4} borderWidth="1px" rounded="lg">
      <VStack align="stretch" gap={3}>
        <Skeleton width="60%" height="5" />
        <Skeleton width="full" height="4" />
        <Skeleton width="full" height="4" />
        <Skeleton width="80%" height="4" />
      </VStack>
    </Box>
  );
};

// フォーム用のスケルトン
export const FormSkeleton = ({ fields = 3 }: { fields?: number }) => {
  return (
    <Stack gap={4}>
      {Array.from({ length: fields }).map((_, i) => (
        <VStack key={i} align="stretch" gap={2}>
          <Skeleton width="20%" height="4" />
          <Skeleton width="full" height="10" />
        </VStack>
      ))}
    </Stack>
  );
};





