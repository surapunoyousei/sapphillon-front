import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/lib/query-keys.ts";
import { Button } from "@/components/common/button.tsx";
import { getBrowserOS } from "@/lib/browser-os.ts";
import { versionClient } from "../lib/sapphillon-client.ts";

export function Debug() {
  const [floorpOutput, setFloorpOutput] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const queryClient = useQueryClient();

  const latestWorkflowQuery = useQuery<{ definition: string | null }>({
    queryKey: QK.workflow.latest(),
    queryFn: () => {
      const v = queryClient.getQueryData<string>(QK.workflow.latest()) ??
        null;
      return { definition: v };
    },
    initialData: { definition: null },
    staleTime: Number.POSITIVE_INFINITY,
  });

  const versionMutation = useMutation({
    mutationKey: QK.version.get(),
    mutationFn: async () => {
      const res = await versionClient.getVersion({});
      return res.version?.version ?? "null";
    },
    onError: (err: unknown) => {
      setErrorText(
        `Sapphillon error: ${String((err as Error)?.message ?? err)}`,
      );
    },
  });

  const runFloorpCheck = useCallback(async () => {
    setErrorText("");
    setFloorpOutput("");
    try {
      const api = getBrowserOS();
      const json = await api.getAllContextData({
        historyLimit: 5,
        downloadLimit: 5,
      });
      setFloorpOutput(json ?? "null");
    } catch (err) {
      setErrorText(
        `BrowserOS error: ${String((err as Error)?.message ?? err)}`,
      );
    }
  }, []);

  const runSapphillonCheck = useCallback(() => {
    setErrorText("");
    versionMutation.mutate();
  }, [versionMutation]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Debug Console</h1>
      {errorText && (
        <div className="alert alert-error text-sm whitespace-pre-wrap break-words">
          {errorText}
        </div>
      )}

      <div className="card bg-base-200/50 border border-base-300/20 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Floorp (BrowserOS) Communication</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={runFloorpCheck}>
              getAllContextData()
            </Button>
            <Button
              size="sm"
              variant="light"
              onClick={() => setFloorpOutput("")}
            >
              Clear
            </Button>
          </div>
          <div className="divider"></div>
          <pre className="bg-base-300/30 p-3 rounded text-xs whitespace-pre-wrap break-all min-h-24">
            {floorpOutput || "(no output)"}
          </pre>
        </div>
      </div>

      <div className="card bg-base-200/50 border border-base-300/20 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Sapphillon (gRPC) Requests</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={runSapphillonCheck}
              disabled={versionMutation.isPending}
            >
              {versionMutation.isPending
                ? "Loading..."
                : "VersionService.GetVersion"}
            </Button>
            <Button
              size="sm"
              variant="light"
              onClick={() => versionMutation.reset()}
            >
              Clear
            </Button>
          </div>
          <div className="divider"></div>
          <pre className="bg-base-300/30 p-3 rounded text-xs whitespace-pre-wrap break-all min-h-24">
            {versionMutation.data || "(no output)"}
          </pre>
        </div>
      </div>

      <div className="card bg-base-200/50 border border-base-300/20 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Latest Workflow (cached)</h2>
          <div className="text-xs text-base-content/70 mb-2">
            Generate 画面で生成された最新定義を Query キャッシュから参照
          </div>
          <pre className="bg-base-300/30 p-3 rounded text-xs whitespace-pre-wrap break-all max-h-64 overflow-auto">
            {latestWorkflowQuery.data?.definition || "(no workflow cached)"}
          </pre>
        </div>
      </div>
    </div>
  );
}
