import React from "react";
import {
    Badge,
    Box,
    Card,
    HStack,
    Input,
    InputGroup,
    Separator,
    Text,
    VStack,
} from "@chakra-ui/react";
import { EmptyState } from "@/components/ui/empty-state";
import { LuPackage } from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";

export function PluginsPage() {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = React.useState("");
    
    // TODO: 実際のプラグインAPIから取得する
    const plugins = [
        { name: "Floorp", version: "0.0.1", enabled: true },
        { name: "Fetch", version: "0.0.1", enabled: true },
    ];

    const filteredPlugins = React.useMemo(() => {
        if (!searchQuery.trim()) return plugins;
        const query = searchQuery.toLowerCase();
        return plugins.filter((plugin) =>
            plugin.name.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <Box h="full" overflow="auto" p={{ base: 4, md: 6 }}>
            <VStack align="stretch" gap={4} maxW="4xl" mx="auto">
                <Card.Root>
                    <Card.Body>
                        <VStack align="stretch" gap={4}>
                            <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                <Text fontWeight="semibold" fontSize="lg">
                                    {t("common.plugins")}
                                </Text>
                                <InputGroup maxW={{ base: "full", sm: "64" }}>
                                    <Input
                                        placeholder={t("plugins.searchPlaceholder")}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </InputGroup>
                            </HStack>
                            <Separator />
                            <VStack align="stretch" gap={2}>
                                {filteredPlugins.length === 0
                                    ? (
                                        <EmptyState
                                            icon={<LuPackage />}
                                            title={t("plugins.emptyTitle")}
                                            description={t("plugins.emptyDescription")}
                                        />
                                    )
                                    : (
                                        filteredPlugins.map((plugin) => (
                                            <PluginItem
                                                key={plugin.name}
                                                name={plugin.name}
                                                version={plugin.version}
                                                enabled={plugin.enabled}
                                            />
                                        ))
                                    )}
                            </VStack>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </VStack>
        </Box>
    );
}

interface PluginItemProps {
    name: string;
    version: string;
    enabled: boolean;
}

function PluginItem({ name, version, enabled }: PluginItemProps) {
    const { t } = useI18n();
    return (
        <HStack
            justify="space-between"
            borderWidth="1px"
            rounded="md"
            p={{ base: 3, md: 4 }}
            _hover={{ bg: "bg.subtle" }}
            transition="background-color 0.2s"
        >
            <VStack align="start" gap={1}>
                <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                    {name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                    v{version}
                </Text>
            </VStack>
            <Badge
                colorPalette={enabled ? "green" : "gray"}
                fontSize="xs"
                px={{ base: 2, md: 3 }}
                py={1}
            >
                {enabled ? t("plugins.enabled") : t("plugins.disabled")}
            </Badge>
        </HStack>
    );
}

