import { Box, Tabs } from "@chakra-ui/react";
import { ProvidersPage } from "./ProvidersPage";
import { ModelsPage } from "./ModelsPage";

export function SettingsPage() {
    return (
        <Box h="full" overflow="auto">
            <Tabs.Root defaultValue="providers" variant="enclosed">
                <Tabs.List>
                    <Tabs.Trigger value="providers">プロバイダ</Tabs.Trigger>
                    <Tabs.Trigger value="models">モデル</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="providers">
                    <ProvidersPage />
                </Tabs.Content>

                <Tabs.Content value="models">
                    <ModelsPage />
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}
