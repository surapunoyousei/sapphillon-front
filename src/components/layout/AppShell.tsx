import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { TopNav } from "@/components/nav/TopNav";
import { StatusBar } from "@/components/status/StatusBar";
import { OmniBar } from "@/components/omni/OmniBar";
import { SideNav } from "@/components/nav/SideNav";
import { MemoryRouter, useInRouterContext } from "react-router-dom";

export interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [omniOpen, setOmniOpen] = React.useState(false);
  const inRouter = useInRouterContext();
  // Always render standard chrome (TopNav/SideNav/StatusBar).
  // Individual pages control their own vertical sizing.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOmniOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Flex direction="column" minH="100dvh">
      <TopNav onOpenOmni={() => setOmniOpen(true)} />
      <Flex as="main" flex="1" minH="0" overflow="hidden">
        {inRouter
          ? (
            <Box
              as="aside"
              w={{ base: "0", md: "56" }}
              display={{ base: "none", md: "block" }}
              borderRightWidth="1px"
              py={3}
            >
              <SideNav />
            </Box>
          )
          : null}
        <Box
          flex="1"
          p={4}
          minH="0"
          minW="0"
          overflow="hidden"
          display="grid"
          gridTemplateRows="1fr"
        >
          <Box minH="0" minW="0" overflow="hidden" h="full">
            {children}
          </Box>
        </Box>
      </Flex>
      <StatusBar />
      {inRouter
        ? <OmniBar isOpen={omniOpen} onClose={() => setOmniOpen(false)} />
        : (
          <MemoryRouter>
            <OmniBar isOpen={omniOpen} onClose={() => setOmniOpen(false)} />
          </MemoryRouter>
        )}
    </Flex>
  );
}
