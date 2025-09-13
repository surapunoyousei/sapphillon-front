import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { TopNav } from "@/components/nav/TopNav";
import { StatusBar } from "@/components/status/StatusBar";
import { OmniBar } from "@/components/omni/OmniBar";
import { SideNav } from "@/components/nav/SideNav";

export function AppShell({ children }: { children?: React.ReactNode }) {
  const [omniOpen, setOmniOpen] = React.useState(false);
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
      <Flex as="main" flex="1">
        <Box
          as="aside"
          w={{ base: "0", md: "56" }}
          display={{ base: "none", md: "block" }}
          borderRightWidth="1px"
          py={3}
        >
          <SideNav />
        </Box>
        <Box flex="1" p={4}>
          {children}
        </Box>
      </Flex>
      <StatusBar />
      <OmniBar isOpen={omniOpen} onClose={() => setOmniOpen(false)} />
    </Flex>
  );
}
