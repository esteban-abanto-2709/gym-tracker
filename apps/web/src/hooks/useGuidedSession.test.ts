import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGuidedSession } from "./useGuidedSession";
import { api } from "@/lib/api";
import { readActiveSession, type ActiveSession } from "@/lib/activeSession";
import type { Routine } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const routine: Routine = {
  id: "r-upper",
  name: "Upper A",
  programId: null,
  createdAt: "2026-10-01T00:00:00Z",
  items: [
    {
      exerciseId: "ex-bench",
      exercise: { id: "ex-bench", name: "Press banca" },
      position: 0,
      blocks: [{ kind: "weight_reps", sets: 3, reps: 8, repsMax: null, approx: false }],
    },
    {
      exerciseId: "ex-row",
      exercise: { id: "ex-row", name: "Remo" },
      position: 1,
      blocks: [{ kind: "weight_reps", sets: 3, reps: 10, repsMax: null, approx: false }],
    },
  ],
};

const saveSession = (overrides: Partial<ActiveSession> = {}) =>
  localStorage.setItem(
    "gymtrack-active-routine",
    JSON.stringify({
      routineId: "r-upper",
      routineName: "Upper A",
      startedAt: new Date().toISOString(),
      currentIndex: 1,
      progress: { 0: 3, 1: 1 },
      extras: [],
      skipped: {},
      replacedBy: {},
      ...overrides,
    }),
  );

describe("useGuidedSession", () => {
  it("sin sesion activa termina de cargar sin rutina", async () => {
    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(result.current.routine).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("retoma la sesion guardada donde se dejo", async () => {
    saveSession();
    vi.mocked(api.get).mockResolvedValue(routine);

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith("/routines/r-upper");
    expect(result.current.currentItem?.exerciseId).toBe("ex-row");
    expect(result.current.setsDoneForCurrent).toBe(1);
    expect(result.current.mapItems.map((m) => m.status)).toEqual(["done", "partial"]);
    expect(result.current.position).toBe(2);
    expect(result.current.totalCount).toBe(2);
  });

  it("una sesion de otro dia no se retoma", async () => {
    saveSession({ startedAt: "2020-01-01T10:00:00Z" });

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(readActiveSession()).toBeNull();
  });

  it("si la rutina ya no existe descarta la sesion", async () => {
    saveSession();
    vi.mocked(api.get).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.routine).toBeNull();
    expect(readActiveSession()).toBeNull();
  });
});
