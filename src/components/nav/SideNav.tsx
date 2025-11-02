import React from "react";
import { NavLink } from "react-router-dom";
import { routes } from "@/routes/registry";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";

export interface SideNavProps {
  onNavigate?: () => void;
}

export function SideNav({ onNavigate }: SideNavProps = {}) {
  return (
    <VStack align="stretch" p={2} gap={1} h="full">
      {routes.map((r) => (
        <NavItem
          key={r.key}
          to={r.path}
          label={r.label}
          Icon={r.icon}
          onClick={onNavigate}
        />
      ))}
      <Box
        px={3}
        py={2}
        display={{ base: "block", lg: "none" }}
        borderTopWidth="1px"
        borderTopColor="border"
        mt="auto"
      >
        <HStack gap={2} align="center">
          <Text fontSize="sm" color="fg.muted">
            Theme
          </Text>
          <ColorModeButton />
        </HStack>
      </Box>
    </VStack>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: string | number }>;
  onClick?: () => void;
}

function NavItem({ to, label, Icon, onClick }: NavItemProps) {
  return (
    <NavLink to={to} style={{ textDecoration: "none" }} onClick={onClick}>
      {({ isActive }) => (
        <HStack
          px={3}
          py={2}
          rounded="md"
          gap={3}
          bg={isActive ? "bg.subtle" : undefined}
          color={isActive ? "fg" : "fg.muted"}
          borderInlineStartWidth="2px"
          borderInlineStartColor={isActive ? "accent.focusRing" : "transparent"}
          transitionProperty="colors, shadow"
          transitionDuration="normal"
          _hover={{ bg: isActive ? "bg.subtle" : "bg.subtle" }}
        >
          <Box as={Icon} css={{ width: 18, height: 18 }} />
          <Text fontSize={{ base: "sm", md: "md" }}>{label}</Text>
        </HStack>
      )}
    </NavLink>
  );
}
