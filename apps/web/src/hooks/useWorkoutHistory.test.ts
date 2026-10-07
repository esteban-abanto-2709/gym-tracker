import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkoutHistory } from "./useWorkoutHistory";
import { api } from "@/lib/api";
import type { Workout } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), delete: vi.fn() },
}));

const set = (id: string, createdAt: string): Workout =>
  ({
    id,
    exerciseId: "ex-squat",
    exercise: { id: "ex-squat", name: "Sentadilla" },
    weight: 80,
    reps: 5,
    opinion: "",
    createdAt,
  }) as Workout;

const newest = set("w-newest", "2026-10-05T15:00:00");
const older = set("w-older", "2026-10-03T15:00:00");

const loadHistory = async () => {
  vi.mocked(api.get).mockResolvedValue([newest, older]);
  vi.mocked(api.delete).mockResolvedValue(undefined);
  const hook = renderHook(() => useWorkoutHistory());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe("useWorkoutHistory", () => {
  it("abre en el dia mas reciente", async () => {
    const { result } = await loadHistory();

    expect(result.current.dates).toEqual(["2026-10-05", "2026-10-03"]);
    expect(result.current.selectedDate).toBe("2026-10-05");
    expect(result.current.currentWorkouts).toEqual([newest]);
  });

  it("al borrar el ultimo set del dia elegido salta a un dia que exista", async () => {
    const { result } = await loadHistory();

    act(() => result.current.setDeletingWorkout(newest));
    await act(() => result.current.confirmDelete());

    expect(result.current.dates).toEqual(["2026-10-03"]);
    expect(result.current.selectedDate).toBe("2026-10-03");
    expect(result.current.currentWorkouts).toEqual([older]);
  });

  it("al borrar un set de otro dia mantiene el dia elegido", async () => {
    const { result } = await loadHistory();

    act(() => result.current.setDeletingWorkout(older));
    await act(() => result.current.confirmDelete());

    expect(result.current.selectedDate).toBe("2026-10-05");
  });

  it("sin historial no elige dia", async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    const { result } = renderHook(() => useWorkoutHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.selectedDate).toBe("");
    expect(result.current.dates).toEqual([]);
  });
});
