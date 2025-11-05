# エラーハンドリング ベストプラクティス

このドキュメントでは、Sapphillon フロントエンドアプリケーションにおける推奨されるエラーハンドリングの方法を説明します。

## 目次

1. [gRPC エラーの処理](#grpcエラーの処理)
2. [コンポーネントでのエラー表示](#コンポーネントでのエラー表示)
3. [カスタムフックでのエラー管理](#カスタムフックでのエラー管理)
4. [リトライ戦略](#リトライ戦略)
5. [エラーログとモニタリング](#エラーログとモニタリング)

---

## gRPC エラーの処理

### 基本的なエラーキャッチ

gRPC 通信では常に`ConnectError`が発生する可能性があります。

```typescript
import { ConnectError } from "@connectrpc/connect";
import { clients, getErrorMessage, isRetryableError } from "@/lib/grpc-clients";

try {
  const result = await clients.version.getVersion({});
  console.log(result.version?.version);
} catch (error) {
  if (error instanceof ConnectError) {
    // 人間が読めるメッセージを取得
    const message = getErrorMessage(error);
    console.error(message); // "サービスが利用できません"

    // エラーコードで分岐
    switch (error.code) {
      case Code.Unavailable:
        // サービスが利用不可の場合の処理
        break;
      case Code.PermissionDenied:
        // 権限エラーの場合の処理
        break;
      default:
      // その他のエラー
    }
  }
}
```

### リトライ可能なエラーの判定

```typescript
try {
  await clients.workflow.runWorkflow({
    /* ... */
  });
} catch (error) {
  if (error instanceof ConnectError && isRetryableError(error)) {
    // リトライ処理を実行
    await retryWithBackoff(() =>
      clients.workflow.runWorkflow({
        /* ... */
      })
    );
  } else {
    // ユーザーに通知
    toast.error(getErrorMessage(error));
  }
}
```

### ストリーミングのエラー処理

ストリーミング RPC では、途中でエラーが発生する可能性があります。

```typescript
try {
  for await (const msg of clients.workflow.generateWorkflow({ prompt })) {
    // メッセージを処理
    processMessage(msg);
  }
} catch (error) {
  if (error instanceof ConnectError) {
    if (error.code === Code.Canceled) {
      // ユーザーがキャンセルした場合（正常）
      console.log("ストリーミングがキャンセルされました");
    } else {
      // その他のエラー
      console.error("ストリーミングエラー:", getErrorMessage(error));
    }
  }
}
```

---

## コンポーネントでのエラー表示

### Toast による通知

一時的なエラーメッセージには`Toast`を使用します。

```tsx
import { toaster } from "@/components/ui/toaster";
import { getErrorMessage } from "@/lib/grpc-clients";

function MyComponent() {
  const handleAction = async () => {
    try {
      await clients.workflow.runWorkflow({
        /* ... */
      });
      toaster.success({
        title: "成功",
        description: "ワークフローを実行しました",
      });
    } catch (error) {
      if (error instanceof ConnectError) {
        toaster.error({
          title: "エラー",
          description: getErrorMessage(error),
        });
      }
    }
  };

  return <Button onClick={handleAction}>実行</Button>;
}
```

### エラー状態の表示

永続的なエラー状態は UI に表示します。

```tsx
function StatusDisplay() {
  const { status, error } = useVersionPing();

  if (status === "disconnected" && error) {
    return (
      <Alert status="error">
        <Alert.Icon />
        <Alert.Title>接続エラー</Alert.Title>
        <Alert.Description>
          {error instanceof ConnectError
            ? getErrorMessage(error)
            : "不明なエラーが発生しました"}
        </Alert.Description>
      </Alert>
    );
  }

  return <Badge colorScheme="green">接続中</Badge>;
}
```

---

## カスタムフックでのエラー管理

### エラー状態の管理

カスタムフックではエラーを状態として保持します。

```typescript
function useMyData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<ConnectError | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clients.workflow.generateWorkflow({
        /* ... */
      });
      setData(result);
    } catch (err) {
      if (err instanceof ConnectError) {
        setError(err);
      } else {
        // 想定外のエラー
        console.error("Unexpected error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, fetch };
}
```

### エラーのクリア

```typescript
function useMyData() {
  const [error, setError] = useState<ConnectError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, clearError /* ... */ };
}
```

---

## リトライ戦略

### 指数バックオフ付きリトライ

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // リトライ不可能なエラーは即座に失敗
      if (error instanceof ConnectError && !isRetryableError(error)) {
        throw error;
      }

      // 最後の試行では待たない
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// 使用例
try {
  const result = await retryWithBackoff(
    () => clients.version.getVersion({}),
    3,
    1000
  );
} catch (error) {
  console.error("リトライ後も失敗:", error);
}
```

### React Query でのリトライ

React Query を使用する場合の推奨設定：

```typescript
import { useQuery } from "@tanstack/react-query";

function useVersionQuery() {
  return useQuery({
    queryKey: ["version"],
    queryFn: () => clients.version.getVersion({}),
    retry: (failureCount, error) => {
      // リトライ可能なエラーのみリトライ
      if (error instanceof ConnectError && isRetryableError(error)) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

---

## エラーログとモニタリング

### コンソールログ

開発環境では詳細なログを出力します。

```typescript
if (import.meta.env.DEV) {
  console.error("Error details:", {
    code: error.code,
    message: error.message,
    metadata: error.metadata,
    stack: error.stack,
  });
}
```

### 本番環境でのエラー報告

本番環境ではエラーを集約サービスに送信します。

```typescript
function reportError(error: Error, context?: Record<string, unknown>) {
  // Sentry、Datadog、などのサービスに送信
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context,
    });
  }
}

// 使用例
try {
  await clients.workflow.runWorkflow({
    /* ... */
  });
} catch (error) {
  reportError(error as Error, {
    operation: "runWorkflow",
    userId: getCurrentUserId(),
  });
  throw error;
}
```

---

## エラーコード一覧

### 主要な gRPC エラーコード

| コード              | 説明                         | 推奨対応                                       |
| ------------------- | ---------------------------- | ---------------------------------------------- |
| `CANCELLED`         | リクエストがキャンセルされた | ユーザー操作なので通常は無視                   |
| `INVALID_ARGUMENT`  | 無効な引数                   | 入力バリデーションを見直す                     |
| `DEADLINE_EXCEEDED` | タイムアウト                 | リトライまたはタイムアウト時間を増やす         |
| `NOT_FOUND`         | リソースが見つからない       | 404 エラーとして表示                           |
| `PERMISSION_DENIED` | 権限不足                     | ログインを促す                                 |
| `UNAVAILABLE`       | サービス利用不可             | リトライまたは「しばらくお待ちください」と表示 |
| `UNAUTHENTICATED`   | 認証が必要                   | ログイン画面にリダイレクト                     |
| `INTERNAL`          | サーバー内部エラー           | 「問題が発生しました」と表示                   |

詳細は [`src/lib/grpc-clients.ts`](../src/lib/grpc-clients.ts) の `GRPC_ERROR_CODES` を参照してください。

---

## まとめ

- 常に `ConnectError` をキャッチする
- `getErrorMessage()` でユーザーフレンドリーなメッセージを表示
- `isRetryableError()` でリトライ可能か判定
- 一時的なエラーは Toast、永続的なエラーは UI に表示
- リトライは指数バックオフを使用
- 本番環境ではエラーを集約サービスに送信

このベストプラクティスに従うことで、ユーザーエクスペリエンスを向上させ、デバッグを容易にできます。
