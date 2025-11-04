"use client";

import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Box p={12} textAlign="center">
      <VStack gap={4}>
        {icon && (
          <Box
            fontSize="4xl"
            color="fg.muted"
            opacity={0.5}
          >
            {icon}
          </Box>
        )}
        <VStack gap={2}>
          <Heading size="md" color="fg.muted">
            {title}
          </Heading>
          {description && (
            <Text color="fg.muted" fontSize="sm" maxW="md">
              {description}
            </Text>
          )}
        </VStack>
        {action && (
          <Button
            colorPalette="floorp"
            onClick={action.onClick}
            mt={2}
          >
            {action.icon && action.icon}
            {action.label}
          </Button>
        )}
      </VStack>
    </Box>
  );
};





