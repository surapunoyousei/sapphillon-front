import { useCallback, useRef, useState } from "react";

/**
 * 汎用的なサーバーストリーム (AsyncIterable) 進捗管理 Hook。
 * 任意の streaming RPC / 非同期チャンクソースに適用できる。
 *
 * 型パラメータ T: 各ストリーム要素の型。
 */
export interface UseStreamProgressOptions<T> {
  /** 要素受信ごと (部分結果) */
  onPartial?: (item: T, all: T[]) => void;
  /** エラー発生時 */
  onError?: (err: Error) => void;
  /** 完了時 (abort も含む) */
  onComplete?: (all: T[], aborted: boolean) => void;
  /**
   * アイテムからエラー情報を抽出する関数 (サーバーがステータスを各メッセージに含める場合)。
   * エラー文字列を返したらその時点でストリームを中断しエラー扱い。
   */
  extractErrorMessage?: (item: T) => string | undefined;
}

export interface UseStreamProgressReturn<T> {
  start: (
    factory: () => AsyncIterable<T> | Promise<AsyncIterable<T>>
  ) => Promise<void>;
  abort: () => void;
  reset: () => void;
  isStreaming: boolean;
  items: T[];
  error: string | null;
  aborted: boolean;
  /** 直近のアイテム */
  lastItem: T | null;
  /** 進捗率 (任意) - total を start 時に与えない場合は undefined */
  progress: number | undefined;
  /** total 推定値 (任意) */
  total: number | undefined;
  /** 現在カウント */
  count: number;
}

/**
 * 汎用ストリーム進捗 Hook。
 * `start` に渡す factory は `AsyncIterable<T>` を生成 (リトライ時などの再利用を考慮) する無引数関数。
 */
export function useStreamProgress<T>(
  options: UseStreamProgressOptions<T> = {}
): UseStreamProgressReturn<T> {
  const optsRef = useRef(options);
  optsRef.current = options;

  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [aborted, setAborted] = useState(false);
  const [lastItem, setLastItem] = useState<T | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const countRef = useRef(0);
  const abortRef = useRef(false);

  const abort = useCallback(() => {
    if (!isStreaming) return;
    abortRef.current = true;
    setAborted(true);
    setIsStreaming(false);
  }, [isStreaming]);

  const reset = useCallback(() => {
    abortRef.current = false;
    setItems([]);
    setError(null);
    setIsStreaming(false);
    setAborted(false);
    setLastItem(null);
    setProgress(undefined);
    setTotal(undefined);
    countRef.current = 0;
  }, []);

  const start = useCallback(
    async (factory: () => AsyncIterable<T> | Promise<AsyncIterable<T>>) => {
      if (isStreaming) return;
      reset();
      setIsStreaming(true);
      try {
        const iterable = await factory();
        const collected: T[] = [];
        for await (const item of iterable) {
          if (abortRef.current) break;
          collected.push(item);
          countRef.current += 1;
          setItems([...collected]);
          setLastItem(item);
          if (total) {
            setProgress(countRef.current / total);
          }
          const errMsg = optsRef.current.extractErrorMessage?.(item);
          if (errMsg) {
            setError(errMsg);
            optsRef.current.onError?.(new Error(errMsg));
            break;
          }
          optsRef.current.onPartial?.(item, collected);
        }
        setIsStreaming(false);
        optsRef.current.onComplete?.(collected, abortRef.current);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setIsStreaming(false);
        optsRef.current.onError?.(new Error(msg));
      }
    },
    [isStreaming, reset, total]
  );

  return {
    start,
    abort,
    reset,
    isStreaming,
    items,
    error,
    aborted,
    lastItem,
    progress,
    total,
    count: countRef.current,
  };
}
