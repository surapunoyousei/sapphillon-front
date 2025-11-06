import React from "react";
import {
  Box,
  Button,
  Card,
  createListCollection,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Stack,
  Table,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LuCheck,
  LuDatabase,
  LuPencil,
  LuPlus,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { clients } from "@/lib/grpc-clients";
import { create } from "@bufbuild/protobuf";
import {
  CreateModelRequestSchema,
  DeleteModelRequestSchema,
  ListModelsRequestSchema,
  UpdateModelRequestSchema,
} from "@/gen/sapphillon/ai/v1/model_service_pb";
import { SearchModelRequestSchema } from "@/gen/sapphillon/ai/v1/search_model_service_pb";
import { ModelsSchema } from "@/gen/sapphillon/ai/v1/model_pb";
import type { Models } from "@/gen/sapphillon/ai/v1/model_pb";
import type { Provider } from "@/gen/sapphillon/ai/v1/provider_pb";
import { ListProvidersRequestSchema } from "@/gen/sapphillon/ai/v1/provider_service_pb";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster-instance";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";

// バリデーションスキーマ
const modelFormSchema = z.object({
  displayName: z.string().min(1, "表示名は必須です"),
  description: z.string().optional(),
  providerName: z.string().min(1, "プロバイダは必須です"), // provider.nameを保存
});

type ModelFormData = z.infer<typeof modelFormSchema>;

export function ModelsPage() {
  const [models, setModels] = React.useState<Models[]>([]);
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [providerFilter, setProviderFilter] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
  });

  // 編集用のフォーム（テーブル内編集用）
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { isSubmitting: isSubmittingEdit },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
  });

  // プロバイダ一覧の取得
  const fetchProviders = React.useCallback(async () => {
    try {
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
    }
  }, []);

  // モデル一覧の取得
  const fetchModels = React.useCallback(async () => {
    try {
      setLoading(true);

      // 検索クエリがある場合はSearchModelServiceを使用
      if (searchQuery || providerFilter) {
        const request = create(SearchModelRequestSchema, {
          modelNameQuery: searchQuery || undefined,
          providerNameQuery: providerFilter || undefined,
          pageSize: 100,
          pageToken: "",
        });
        const response = await clients.searchModel.searchModel(request);
        setModels(response.models);
      } else {
        // 検索クエリがない場合はListModelsを使用
        const request = create(ListModelsRequestSchema, {
          pageSize: 100,
        });
        const response = await clients.model.listModels(request);
        setModels(response.models);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toaster.create({
        title: "モデルの取得に失敗しました",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, providerFilter]);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  React.useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // モデルの作成
  const onCreateModel = async (data: ModelFormData) => {
    try {
      // プロバイダオブジェクトを取得
      const selectedProvider = providers.find((p) =>
        p.name === data.providerName
      );
      if (!selectedProvider) {
        toaster.create({
          title: "プロバイダが見つかりません",
          type: "error",
        });
        return;
      }

      const model = create(ModelsSchema, {
        displayName: data.displayName,
        description: data.description,
        provider: selectedProvider,
      });

      const request = create(CreateModelRequestSchema, {
        model,
      });

      await clients.model.createModel(request);
      toaster.create({
        title: "モデルを作成しました",
        type: "success",
      });
      reset();
      setIsCreating(false);
      fetchModels();
    } catch (error) {
      console.error("Failed to create model:", error);
      toaster.create({
        title: "モデルの作成に失敗しました",
        type: "error",
      });
    }
  };

  // モデルの更新
  const onUpdateModel = async (modelId: string, data: ModelFormData) => {
    try {
      // プロバイダオブジェクトを取得
      const selectedProvider = providers.find((p) =>
        p.name === data.providerName
      );
      if (!selectedProvider) {
        toaster.create({
          title: "プロバイダが見つかりません",
          type: "error",
        });
        return;
      }

      const model = create(ModelsSchema, {
        name: modelId,
        displayName: data.displayName,
        description: data.description,
        provider: selectedProvider,
      });

      const request = create(UpdateModelRequestSchema, {
        model,
      });

      await clients.model.updateModel(request);
      toaster.create({
        title: "モデルを更新しました",
        type: "success",
      });
      reset();
      setEditingId(null);
      fetchModels();
    } catch (error) {
      console.error("Failed to update model:", error);
      toaster.create({
        title: "モデルの更新に失敗しました",
        type: "error",
      });
    }
  };

  // モデルの削除
  const onDeleteModel = async (modelId: string) => {
    if (!confirm("このモデルを削除してもよろしいですか？")) {
      return;
    }

    try {
      const request = create(DeleteModelRequestSchema, {
        name: modelId,
      });

      await clients.model.deleteModel(request);
      toaster.create({
        title: "モデルを削除しました",
        type: "success",
      });
      fetchModels();
    } catch (error) {
      console.error("Failed to delete model:", error);
      toaster.create({
        title: "モデルの削除に失敗しました",
        type: "error",
      });
    }
  };

  // 編集開始
  const startEdit = (model: Models) => {
    setEditingId(model.name);
    resetEdit({
      displayName: model.displayName,
      description: model.description,
      providerName: model.provider?.name || "",
    });
  };

  // 作成フォームの表示
  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    reset({
      displayName: "",
      description: "",
      providerName: "",
    });
  };

  const providerCollection = createListCollection({
    items: providers.map((p) => ({
      label: p.displayName,
      value: p.name,
    })),
  });

  return (
    <Box p={6}>
      <VStack align="stretch" gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="xl">LLMモデル管理</Heading>
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

        {/* 検索フィルター */}
        {!isCreating && (
          <Card.Root>
            <Card.Body>
              <HStack gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Field label="モデル名で検索">
                    <Input
                      placeholder="モデル名を入力..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Field>
                </Box>
                <Box flex="1" minW="200px">
                  <Field label="プロバイダでフィルター">
                    <SelectRoot
                      collection={providerCollection}
                      value={providerFilter ? [providerFilter] : []}
                      onValueChange={(details) => {
                        setProviderFilter(details.value[0] || "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="すべてのプロバイダ" />
                      </SelectTrigger>
                      <SelectPositioner>
                        <SelectContent>
                          <SelectItem item="">すべてのプロバイダ</SelectItem>
                          {providers.map((provider) => (
                            <SelectItem
                              key={provider.name}
                              item={provider.name}
                            >
                              {provider.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectPositioner>
                    </SelectRoot>
                  </Field>
                </Box>
                <Box alignSelf="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setProviderFilter("");
                    }}
                  >
                    クリア
                  </Button>
                </Box>
              </HStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* 作成フォーム */}
        {isCreating && (
          <Card.Root>
            <Card.Header>
              <Flex justify="space-between" align="center">
                <Heading size="md">新しいモデルを作成</Heading>
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
              <form onSubmit={handleSubmit(onCreateModel)}>
                <Stack gap={4}>
                  <Field
                    label="表示名"
                    invalid={!!errors.displayName}
                    errorText={errors.displayName?.message}
                  >
                    <Input {...register("displayName")} />
                  </Field>

                  <Field
                    label="説明"
                    invalid={!!errors.description}
                    errorText={errors.description?.message}
                  >
                    <Textarea {...register("description")} rows={3} />
                  </Field>

                  <Field
                    label="プロバイダ"
                    invalid={!!errors.providerName}
                    errorText={errors.providerName?.message}
                  >
                    <Controller
                      name="providerName"
                      control={control}
                      render={({ field }) => (
                        <SelectRoot
                          collection={providerCollection}
                          value={field.value ? [field.value] : []}
                          onValueChange={(details) => {
                            field.onChange(details.value[0]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValueText placeholder="プロバイダを選択" />
                          </SelectTrigger>
                          <SelectPositioner>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem
                                  key={provider.name}
                                  item={provider.name}
                                >
                                  {provider.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </SelectPositioner>
                        </SelectRoot>
                      )}
                    />
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

        {/* モデル一覧 */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">モデル一覧</Heading>
          </Card.Header>
          <Card.Body p={0}>
            {loading
              ? <TableSkeleton rows={5} />
              : models.length === 0
              ? (
                <EmptyState
                  icon={<LuDatabase />}
                  title="モデルが登録されていません"
                  description="LLMモデルを追加して、ワークフローで使用できるようにしましょう。モデルはプロバイダに関連付けられます。"
                  action={{
                    label: "モデルを追加",
                    onClick: startCreate,
                    icon: <LuPlus />,
                  }}
                />
              )
              : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>表示名</Table.ColumnHeader>
                      <Table.ColumnHeader>説明</Table.ColumnHeader>
                      <Table.ColumnHeader>プロバイダ</Table.ColumnHeader>
                      <Table.ColumnHeader>リソース名</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">
                        操作
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {models.map((model) => (
                      <Table.Row key={model.name}>
                        <Table.Cell>
                          {editingId === model.name
                            ? (
                              <Input
                                size="sm"
                                {...registerEdit("displayName")}
                              />
                            )
                            : (
                              model.displayName
                            )}
                        </Table.Cell>
                        <Table.Cell>
                          {editingId === model.name
                            ? (
                              <Textarea
                                size="sm"
                                {...registerEdit("description")}
                                rows={2}
                              />
                            )
                            : (
                              <Text fontSize="sm" color="fg.muted">
                                {model.description || "-"}
                              </Text>
                            )}
                        </Table.Cell>
                        <Table.Cell>
                          {editingId === model.name
                            ? (
                              <Controller
                                name="providerName"
                                control={controlEdit}
                                render={({ field }) => (
                                  <SelectRoot
                                    collection={providerCollection}
                                    value={field.value ? [field.value] : []}
                                    onValueChange={(details) => {
                                      field.onChange(details.value[0]);
                                    }}
                                    size="sm"
                                  >
                                    <SelectTrigger>
                                      <SelectValueText placeholder="プロバイダを選択" />
                                    </SelectTrigger>
                                    <SelectPositioner>
                                      <SelectContent>
                                        {providers.map((provider) => (
                                          <SelectItem
                                            key={provider.name}
                                            item={provider.name}
                                          >
                                            {provider.displayName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </SelectPositioner>
                                  </SelectRoot>
                                )}
                              />
                            )
                            : (
                              <Text fontSize="sm">
                                {model.provider?.displayName ||
                                  model.provider?.name || "-"}
                              </Text>
                            )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" color="fg.muted">
                            {model.name}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack justify="flex-end" gap={2}>
                            {editingId === model.name
                              ? (
                                <>
                                  <IconButton
                                    aria-label="保存"
                                    size="sm"
                                    colorPalette="green"
                                    onClick={handleSubmitEdit((data) =>
                                      onUpdateModel(model.name, data)
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
                                      setEditingId(null);
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
                                    onClick={() => startEdit(model)}
                                  >
                                    <LuPencil />
                                  </IconButton>
                                  <IconButton
                                    aria-label="削除"
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="red"
                                    onClick={() => onDeleteModel(model.name)}
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
