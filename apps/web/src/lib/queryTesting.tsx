import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query";
import { IntlWrapper } from "@/i18n/testing";

export function queryWrapper() {
  const client = makeQueryClient();
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <IntlWrapper>{children}</IntlWrapper>
    </QueryClientProvider>
  );
  return { client, wrapper };
}
