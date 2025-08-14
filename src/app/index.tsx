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

  if (isLoading) return <div>Home - Loading...</div>;
  if (error) return <div>Home - Error</div>;
  return <div>Home{data ? ` - ${data}` : ""}</div>;
}
