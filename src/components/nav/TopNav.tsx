import { Box, HStack, Image, Kbd, Spacer, Text } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useColorMode } from "@/components/ui/use-color-mode";

export function TopNav({ onOpenOmni }: { onOpenOmni?: () => void }) {
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
      px={4}
      py={3}
      align="center"
      gap={3}
      position="relative"
      borderBottomWidth="1px"
    >
      <HStack gap={2}>
        <Image
          src={logoUrl}
          alt="Floorp OS"
          height="8"
          width="auto"
          css={{ display: "block", objectFit: "contain" }}
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
        maxW="lg"
      >
        <Box
          role="button"
          tabIndex={0}
          aria-label="Open Omni Bar"
          onClick={() => onOpenOmni?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenOmni?.();
          }}
          px={3}
          py={2}
          rounded="md"
          borderWidth="1px"
          bg="bg"
          cursor="text"
        >
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="sm">Search or run…</Text>
            <HStack>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </HStack>
          </HStack>
        </Box>
      </Box>
      <Spacer />
      <HStack gap={2}>
        <ColorModeButton />
      </HStack>
    </HStack>
  );
}
