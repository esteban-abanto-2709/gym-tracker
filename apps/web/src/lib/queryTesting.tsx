import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query";

export function queryWrapper() {
  const client = makeQueryClient();
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}
