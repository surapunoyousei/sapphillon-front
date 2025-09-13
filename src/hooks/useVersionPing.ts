import React from "react";
import { clients } from "@/lib/grpc-clients";

export type GrpcStatus = "connecting" | "connected" | "disconnected";

export function useVersionPing(intervalMs = 10000) {
  const [status, setStatus] = React.useState<GrpcStatus>("connecting");
  const [version, setVersion] = React.useState<string>("");
  const [error, setError] = React.useState<unknown>(undefined);
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  const refetch = React.useCallback(async () => {
    try {
      setStatus("connecting");
      setError(undefined);
      const res = await clients.version.getVersion({});
      setVersion(res.version?.version ?? "");
      setStatus("connected");
      setLastUpdated(Date.now());
    } catch (e) {
      setError(e);
      setStatus("disconnected");
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      await refetch();
    };
    tick();
    const t = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs, refetch]);

  return { status, version, error, lastUpdated, refetch } as const;
}
