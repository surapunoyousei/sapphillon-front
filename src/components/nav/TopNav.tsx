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
import { useI18n } from "@/hooks/useI18n";

export interface TopNavProps {
  onOpenOmni?: () => void;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
}

export function TopNav(
  { onOpenOmni, onOpenMenu, showMenuButton = false }: TopNavProps,
) {
  const { t } = useI18n();
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
      px={{ base: 1, md: 2 }}
      py={{ base: 0.5, md: 1 }}
      align="center"
      gap={{ base: 1, md: 1.5 }}
      position="relative"
      borderBottomWidth="1px"
      borderBottomColor="border"
      bg="bg.panel"
      h="auto"
      minH={{ base: "10", md: "12" }}
      css={{
        "@media (max-height: 600px) and (orientation: landscape)": {
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
          minHeight: "2rem",
        },
      }}
    >
      <HStack gap={{ base: 1, md: 1.5 }} flexShrink={0}>
        {showMenuButton && (
          <IconButton
            aria-label={t("nav.openMenu")}
            size="sm"
            variant="ghost"
            onClick={onOpenMenu}
            display={{ base: "flex", lg: "none" }}
          >
            <LuMenu />
          </IconButton>
        )}
        <Image
          src={logoUrl}
          alt="Floorp OS"
          height={{ base: "4", md: "6" }}
          width="auto"
          display={{ base: "none", md: "block" }}
          css={{ objectFit: "contain" }}
        />
      </HStack>
      {/* Centered Omni Bar trigger (absolute centering) */}
      <Box
        display={"block"}
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="full"
        maxW={{ base: "calc(100% - 4rem)", sm: "20rem", md: "24rem" }}
        px={{ base: 2, md: 0 }}
      >
        <Box
          role="button"
          tabIndex={0}
          aria-label={t("nav.openOmniBar")}
          onClick={() => onOpenOmni?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenOmni?.();
          }}
          px={1.5}
          py={1.5}
          rounded="md"
          borderWidth="1px"
          borderColor="border"
          bg="bg"
          cursor="text"
          display="flex"
          alignItems="center"
          transitionProperty="colors, shadow"
          transitionDuration="normal"
          _hover={{ bg: "bg.subtle" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "accent.focusRing",
            outlineOffset: "2px",
          }}
        >
          <HStack
            justify="space-between"
            align="center"
            color="fg.muted"
            gap={1}
            h="full"
          >
            <Text fontSize="xs" whiteSpace="nowrap" lineHeight="1.5">
              {t("nav.searchOrRun")}
            </Text>
            <HStack display={"flex"} align="center" gap={0.5}>
              <Kbd fontSize="xs">⌘</Kbd>
              <Kbd fontSize="xs">K</Kbd>
            </HStack>
          </HStack>
        </Box>
      </Box>
      <Spacer />
      <HStack gap={0.5} flexShrink={0} display={{ base: "none", sm: "flex" }}>
        <ColorModeButton />
      </HStack>
    </HStack>
  );
}
