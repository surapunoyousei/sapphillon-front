import {
  Box,
  HStack,
  IconButton,
  Image,
  Kbd,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useColorMode } from "@/components/ui/use-color-mode";
import { LuMenu } from "react-icons/lu";

export interface TopNavProps {
  onOpenOmni?: () => void;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
}

export function TopNav(
  { onOpenOmni, onOpenMenu, showMenuButton = false }: TopNavProps,
) {
  const lightLogoUrl = new URL(
    "../../assets/Floorp_Logo_OS_C_Light.png",
    import.meta.url,
  ).toString();
  const darkLogoUrl = new URL(
    "../../assets/Floorp_Logo_OS_D_Dark.png",
    import.meta.url,
  ).toString();
  const { colorMode } = useColorMode();
  const logoUrl = colorMode === "dark" ? darkLogoUrl : lightLogoUrl;
  return (
    <HStack
      as="header"
      px={{ base: 2, md: 4 }}
      py={{ base: 1.5, md: 3 }}
      align="center"
      gap={{ base: 2, md: 3 }}
      position="relative"
      borderBottomWidth="1px"
      borderBottomColor="border"
      bg="bg.panel"
      css={{
        "@media (max-height: 600px) and (orientation: landscape)": {
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
        },
      }}
    >
      <HStack gap={2} flexShrink={0}>
        {showMenuButton && (
          <IconButton
            aria-label="Open menu"
            size="md"
            variant="ghost"
            onClick={onOpenMenu}
            display={{ base: "flex", md: "none" }}
          >
            <LuMenu />
          </IconButton>
        )}
        <Image
          src={logoUrl}
          alt="Floorp OS"
          height={{ base: "6", md: "8" }}
          width="auto"
          display={{ base: "none", md: "block" }}
          css={{ objectFit: "contain" }}
        />
      </HStack>
      {/* Centered Omni Bar trigger (absolute centering) */}
      <Box
        display={{ base: "none", sm: "block" }}
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="full"
        maxW={{ base: "xs", sm: "md", md: "lg" }}
        px={{ base: 2, md: 0 }}
      >
        <Box
          role="button"
          tabIndex={0}
          aria-label="Open Omni Bar"
          onClick={() => onOpenOmni?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenOmni?.();
          }}
          px={{ base: 2, md: 3 }}
          py={{ base: 1.5, md: 2 }}
          rounded="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg"
          cursor="text"
          transitionProperty="colors, shadow"
          transitionDuration="normal"
          _hover={{ bg: "bg.subtle" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "accent.focusRing",
            outlineOffset: "2px",
          }}
        >
          <HStack justify="space-between" color="fg.muted" gap={2}>
            <Text fontSize={{ base: "xs", sm: "sm" }} whiteSpace="nowrap">
              Search or run…
            </Text>
            <HStack display={{ base: "none", sm: "flex" }} gap={1}>
              <Kbd fontSize="xs">⌘</Kbd>
              <Kbd fontSize="xs">K</Kbd>
            </HStack>
          </HStack>
        </Box>
      </Box>
      <Spacer />
      <HStack gap={2} flexShrink={0}>
        <ColorModeButton />
      </HStack>
    </HStack>
  );
}
