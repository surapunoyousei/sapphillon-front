import { useQuery } from "@tanstack/react-query";
import { createMockVersionClient } from "../lib/mock/sapphillon-client.ts";

export function Home() {
  const client = createMockVersionClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["version"],
    queryFn: async () =>
      (await client.getVersion({
        $typeName: "sapphillon.v1.GetVersionRequest",
      })).version?.version ?? "",
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your personalized dashboard. Widgets will be available here.</p>
      <div>
        <strong>API Version (Mock):</strong> {isLoading ? 'Loading...' : error ? 'Error' : data}
      </div>
    </div>
  )
}
