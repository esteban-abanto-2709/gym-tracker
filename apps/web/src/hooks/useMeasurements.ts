import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { measurementsQuery } from "@/lib/queries";
import type { BodyMeasurement } from "@/lib/types";

const NONE: BodyMeasurement[] = [];

const byDateDesc = (a: BodyMeasurement, b: BodyMeasurement) =>
  b.date.localeCompare(a.date);

export function useMeasurements() {
  const queryClient = useQueryClient();
  const { data: measurements = NONE, isPending: loading } =
    useQuery(measurementsQuery);

  const save = useCallback(
    async (measurement: BodyMeasurement) => {
      const saved = await api.put<BodyMeasurement>(
        routes.api.measurements.upsert(),
        measurement,
      );
      queryClient.setQueryData(measurementsQuery.queryKey, (prev = []) =>
        [saved, ...prev.filter((m) => m.date !== saved.date)].sort(byDateDesc),
      );
    },
    [queryClient],
  );

  const remove = useCallback(
    async (date: string) => {
      await api.delete(routes.api.measurements.delete(date));
      queryClient.setQueryData(measurementsQuery.queryKey, (prev = []) =>
        prev.filter((m) => m.date !== date),
      );
    },
    [queryClient],
  );

  return { measurements, loading, save, remove };
}
