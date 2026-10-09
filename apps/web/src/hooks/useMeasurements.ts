import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { BodyMeasurement } from "@/lib/types";

const byDateDesc = (a: BodyMeasurement, b: BodyMeasurement) =>
  b.date.localeCompare(a.date);

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BodyMeasurement[]>(routes.api.measurements.list())
      .then(setMeasurements)
      .catch(() => notifyError("No se pudieron cargar tus medidas"))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (measurement: BodyMeasurement) => {
    const saved = await api.put<BodyMeasurement>(
      routes.api.measurements.upsert(),
      measurement,
    );
    setMeasurements((prev) =>
      [saved, ...prev.filter((m) => m.date !== saved.date)].sort(byDateDesc),
    );
  }, []);

  const remove = useCallback(async (date: string) => {
    await api.delete(routes.api.measurements.delete(date));
    setMeasurements((prev) => prev.filter((m) => m.date !== date));
  }, []);

  return { measurements, loading, save, remove };
}
