import React from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Spinner,
    Stack,
    Table,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LuCheck, LuPencil, LuPlus, LuTrash2, LuX } from "react-icons/lu";
import { clients } from "@/lib/grpc-clients";
import { create } from "@bufbuild/protobuf";
import {
    CreateProviderRequestSchema,
    DeleteProviderRequestSchema,
    ListProvidersRequestSchema,
    UpdateProviderRequestSchema,
} from "@/gen/sapphillon/ai/v1/provider_service_pb";
import { ProviderSchema } from "@/gen/sapphillon/ai/v1/provider_pb";
import type { Provider } from "@/gen/sapphillon/ai/v1/provider_pb";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster-instance";

// バリデーションスキーマ
const providerFormSchema = z.object({
    displayName: z.string().min(1, "表示名は必須です"),
    apiKey: z.string().min(1, "APIキーは必須です"),
    apiEndpoint: z.string().url("有効なURLを入力してください"),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

export function ProvidersPage() {
    const [providers, setProviders] = React.useState<Provider[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [isCreating, setIsCreating] = React.useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProviderFormData>({
        resolver: zodResolver(providerFormSchema),
    });

    // 編集用のフォーム（テーブル内編集用）
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        formState: { isSubmitting: isSubmittingEdit },
    } = useForm<ProviderFormData>({
        resolver: zodResolver(providerFormSchema),
    });

    // プロバイダ一覧の取得
    const fetchProviders = React.useCallback(async () => {
        try {
            setLoading(true);
            const request = create(ListProvidersRequestSchema, {
                pageSize: 100,
            });
            const response = await clients.provider.listProviders(request);
            setProviders(response.providers);
        } catch (error) {
            console.error("Failed to fetch providers:", error);
            toaster.create({
                title: "プロバイダの取得に失敗しました",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    // プロバイダの作成
    const onCreateProvider = async (data: ProviderFormData) => {
        try {
            const provider = create(ProviderSchema, {
                displayName: data.displayName,
                apiKey: data.apiKey,
                apiEndpoint: data.apiEndpoint,
            });

            const request = create(CreateProviderRequestSchema, {
                provider,
            });

            await clients.provider.createProvider(request);
            toaster.create({
                title: "プロバイダを作成しました",
                type: "success",
            });
            reset();
            setIsCreating(false);
            fetchProviders();
        } catch (error) {
            console.error("Failed to create provider:", error);
            toaster.create({
                title: "プロバイダの作成に失敗しました",
                type: "error",
            });
        }
    };

    // プロバイダの更新
    const onUpdateProvider = async (
        providerId: string,
        data: ProviderFormData,
    ) => {
        try {
            const provider = create(ProviderSchema, {
                name: providerId,
                displayName: data.displayName,
                apiKey: data.apiKey,
                apiEndpoint: data.apiEndpoint,
            });

            const request = create(UpdateProviderRequestSchema, {
                provider,
            });

            await clients.provider.updateProvider(request);
            toaster.create({
                title: "プロバイダを更新しました",
                type: "success",
            });
            reset();
            setEditingId(null);
            fetchProviders();
        } catch (error) {
            console.error("Failed to update provider:", error);
            toaster.create({
                title: "プロバイダの更新に失敗しました",
                type: "error",
            });
        }
    };

    // プロバイダの削除
    const onDeleteProvider = async (providerId: string) => {
        if (!confirm("このプロバイダを削除してもよろしいですか？")) {
            return;
        }

        try {
            const request = create(DeleteProviderRequestSchema, {
                name: providerId,
            });

            await clients.provider.deleteProvider(request);
            toaster.create({
                title: "プロバイダを削除しました",
                type: "success",
            });
            fetchProviders();
        } catch (error) {
            console.error("Failed to delete provider:", error);
            toaster.create({
                title: "プロバイダの削除に失敗しました",
                type: "error",
            });
        }
    };

    // 編集開始
    const startEdit = (provider: Provider) => {
        setEditingId(provider.name);
        resetEdit({
            displayName: provider.displayName,
            apiKey: "", // セキュリティのため空にする
            apiEndpoint: provider.apiEndpoint,
        });
    };

    // 作成フォームの表示
    const startCreate = () => {
        setIsCreating(true);
        setEditingId(null);
        reset({
            displayName: "",
            apiKey: "",
            apiEndpoint: "",
        });
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" h="50vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box p={6}>
            <VStack align="stretch" gap={6}>
                <Flex justify="space-between" align="center">
                    <Heading size="xl">LLMプロバイダ管理</Heading>
                    {!isCreating && (
                        <Button
                            colorPalette="floorp"
                            onClick={startCreate}
                        >
                            <LuPlus />
                            新規作成
                        </Button>
                    )}
                </Flex>

                {/* 作成フォーム */}
                {isCreating && (
                    <Card.Root>
                        <Card.Header>
                            <Flex justify="space-between" align="center">
                                <Heading size="md">
                                    新しいプロバイダを作成
                                </Heading>
                                <IconButton
                                    aria-label="キャンセル"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsCreating(false);
                                        reset();
                                    }}
                                >
                                    <LuX />
                                </IconButton>
                            </Flex>
                        </Card.Header>
                        <Card.Body>
                            <form onSubmit={handleSubmit(onCreateProvider)}>
                                <Stack gap={4}>
                                    <Field
                                        label="表示名"
                                        invalid={!!errors.displayName}
                                        errorText={errors.displayName?.message}
                                    >
                                        <Input {...register("displayName")} />
                                    </Field>

                                    <Field
                                        label="APIキー"
                                        invalid={!!errors.apiKey}
                                        errorText={errors.apiKey?.message}
                                    >
                                        <Input
                                            type="password"
                                            {...register("apiKey")}
                                        />
                                    </Field>

                                    <Field
                                        label="APIエンドポイント"
                                        invalid={!!errors.apiEndpoint}
                                        errorText={errors.apiEndpoint?.message}
                                    >
                                        <Input {...register("apiEndpoint")} />
                                    </Field>

                                    <HStack justify="flex-end">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsCreating(false);
                                                reset();
                                            }}
                                        >
                                            キャンセル
                                        </Button>
                                        <Button
                                            type="submit"
                                            colorPalette="floorp"
                                            loading={isSubmitting}
                                        >
                                            作成
                                        </Button>
                                    </HStack>
                                </Stack>
                            </form>
                        </Card.Body>
                    </Card.Root>
                )}

                {/* プロバイダ一覧 */}
                <Card.Root>
                    <Card.Header>
                        <Heading size="md">プロバイダ一覧</Heading>
                    </Card.Header>
                    <Card.Body p={0}>
                        {providers.length === 0
                            ? (
                                <Box p={8} textAlign="center">
                                    <Text color="fg.muted">
                                        プロバイダが登録されていません。
                                    </Text>
                                </Box>
                            )
                            : (
                                <Table.Root>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader>
                                                表示名
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                APIエンドポイント
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                リソース名
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign="right">
                                                操作
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {providers.map((provider) => (
                                            <Table.Row key={provider.name}>
                                                <Table.Cell>
                                                    {editingId === provider.name
                                                        ? (
                                                            <Input
                                                                size="sm"
                                                                {...registerEdit(
                                                                    "displayName",
                                                                )}
                                                            />
                                                        )
                                                        : (
                                                            provider.displayName
                                                        )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {editingId === provider.name
                                                        ? (
                                                            <Input
                                                                size="sm"
                                                                {...registerEdit(
                                                                    "apiEndpoint",
                                                                )}
                                                            />
                                                        )
                                                        : (
                                                            <Text
                                                                fontSize="sm"
                                                                color="fg.muted"
                                                            >
                                                                {provider
                                                                    .apiEndpoint}
                                                            </Text>
                                                        )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Text
                                                        fontSize="sm"
                                                        color="fg.muted"
                                                    >
                                                        {provider.name}
                                                    </Text>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <HStack
                                                        justify="flex-end"
                                                        gap={2}
                                                    >
                                                        {editingId ===
                                                                provider.name
                                                            ? (
                                                                <>
                                                                    <IconButton
                                                                        aria-label="保存"
                                                                        size="sm"
                                                                        colorPalette="green"
                                                                        onClick={handleSubmitEdit(
                                                                            (
                                                                                data,
                                                                            ) => onUpdateProvider(
                                                                                provider
                                                                                    .name,
                                                                                data,
                                                                            ),
                                                                        )}
                                                                        loading={isSubmittingEdit}
                                                                    >
                                                                        <LuCheck />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        aria-label="キャンセル"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setEditingId(
                                                                                null,
                                                                            );
                                                                            resetEdit();
                                                                        }}
                                                                    >
                                                                        <LuX />
                                                                    </IconButton>
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <IconButton
                                                                        aria-label="編集"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            startEdit(
                                                                                provider,
                                                                            )}
                                                                    >
                                                                        <LuPencil />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        aria-label="削除"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorPalette="red"
                                                                        onClick={() =>
                                                                            onDeleteProvider(
                                                                                provider
                                                                                    .name,
                                                                            )}
                                                                    >
                                                                        <LuTrash2 />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                    </HStack>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            )}
                    </Card.Body>
                </Card.Root>
            </VStack>
        </Box>
    );
}
