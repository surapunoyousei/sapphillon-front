import { useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { Separator } from "@/components/common/separator.tsx";
import { getBrowserOS } from "@/lib/browser-os.ts";
import { createMockVersionClient } from "../lib/mock/sapphillon-client.ts";

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch (_e) {
    return String(value);
  }
}

export function Debug() {
  const [floorpOutput, setFloorpOutput] = useState<string>("");
  const [sapphillonOutput, setSapphillonOutput] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

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

  const runSapphillonCheck = useCallback(async () => {
    setErrorText("");
    setSapphillonOutput("");
    try {
      const client = createMockVersionClient();
      const res = await client.getVersion({});
      setSapphillonOutput(stringify(res));
    } catch (err) {
      setErrorText(
        `Sapphillon error: ${String((err as Error)?.message ?? err)}`,
      );
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Debug Console</h1>
      {errorText && (
        <div className="alert alert-error text-sm whitespace-pre-wrap break-words">
          {errorText}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Floorp (BrowserOS) Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Separator />
          <pre className="bg-base-300/30 p-3 rounded text-xs whitespace-pre-wrap break-all min-h-24">
            {floorpOutput || "(no output)"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sapphillon (gRPC) Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" onClick={runSapphillonCheck}>
              VersionService.GetVersion (mock)
            </Button>
            <Button
              size="sm"
              variant="light"
              onClick={() => setSapphillonOutput("")}
            >
              Clear
            </Button>
          </div>
          <Separator />
          <pre className="bg-base-300/30 p-3 rounded text-xs whitespace-pre-wrap break-all min-h-24">
            {sapphillonOutput || "(no output)"}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
