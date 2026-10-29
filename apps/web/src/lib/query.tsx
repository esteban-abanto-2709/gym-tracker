"use client";

import {
  isServer,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { errorText, useErrorText, type ErrorKey } from "@/i18n/errors";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { errorMessage?: ErrorKey };
  }
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiError && error.status === 401) return;
        if (query.state.data !== undefined) return;
        notifyError(errorText(query.meta?.errorMessage ?? "load.data"));
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useErrorText();
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
