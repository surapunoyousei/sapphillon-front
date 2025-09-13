import React from "react";
import { NavLink } from "react-router-dom";
import { routes } from "@/routes/registry";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

export function SideNav() {
  return (
    <VStack align="stretch" p={2} gap={1}>
      {routes.map((r) => (
        <NavItem key={r.key} to={r.path} label={r.label} Icon={r.icon} />
      ))}
    </VStack>
  );
}

function NavItem({ to, label, Icon }: { to: string; label: string; Icon: React.ComponentType<{ size?: string | number }> }) {
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <HStack
          px={3}
          py={2}
          rounded="md"
          gap={3}
          bg={isActive ? "bg.subtle" : undefined}
          color={isActive ? "fg" : "fg.muted"}
        >
          <Box as={Icon} css={{ width: 18, height: 18 }} />
          <Text>{label}</Text>
        </HStack>
      )}
    </NavLink>
  );
}
