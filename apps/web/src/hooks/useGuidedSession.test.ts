import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
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
      blocks: [{ kind: "weight_reps", sets: 3, reps: 8, repsMax: null }],
    },
    {
      exerciseId: "ex-row",
      exercise: { id: "ex-row", name: "Remo" },
      position: 1,
      blocks: [{ kind: "weight_reps", sets: 3, reps: 10, repsMax: null }],
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

  it("registrar una serie guarda la hora para contar el descanso", async () => {
    saveSession();
    vi.mocked(api.get).mockResolvedValue(routine);
    vi.mocked(api.post).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuidedSession());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const before = Date.now();
    await act(() => result.current.logSet({ weightKg: 60, reps: 10 }));

    const lastSetAt = readActiveSession()?.lastSetAt;
    expect(lastSetAt).toBeDefined();
    expect(Date.parse(lastSetAt!)).toBeGreaterThanOrEqual(before);
    expect(result.current.session?.lastSetAt).toBe(lastSetAt);
  });

  describe("siguiente ejercicio", () => {
    const item = (id: string, position: number, sets: number) => ({
      exerciseId: id,
      exercise: { id, name: id },
      position,
      blocks:
        sets > 0
          ? [{ kind: "weight_reps" as const, sets, reps: 8, repsMax: null }]
          : [],
    });
    const legs: Routine = {
      ...routine,
      items: [
        item("hack", 0, 3),
        item("hip-thrust", 1, 3),
        item("leg-extension", 2, 3),
      ],
    };

    const nextFor = async (
      r: Routine,
      overrides: Partial<ActiveSession>,
    ) => {
      saveSession(overrides);
      vi.mocked(api.get).mockResolvedValue(r);
      const { result } = renderHook(() => useGuidedSession());
      await waitFor(() => expect(result.current.loading).toBe(false));
      return result.current.nextItem?.exerciseId ?? null;
    };

    it("vuelve al pendiente de atras si ya no queda nada adelante", async () => {
      const twoItems = { ...legs, items: legs.items.slice(0, 2) };
      expect(
        await nextFor(twoItems, { currentIndex: 1, progress: { 1: 3 } }),
      ).toBe("hack");
    });

    it("no recomienda un ejercicio ya terminado", async () => {
      expect(
        await nextFor(legs, { currentIndex: 0, progress: { 0: 3, 1: 3 } }),
      ).toBe("leg-extension");
    });

    it("sigue hacia adelante antes de volver al que se dejo atras", async () => {
      expect(
        await nextFor(legs, { currentIndex: 1, progress: { 1: 3 } }),
      ).toBe("leg-extension");
    });

    it("cuenta los ejercicios que faltan, sin los saltados", async () => {
      saveSession({
        currentIndex: 1,
        progress: { 0: 1, 1: 3 },
        skipped: { 2: true },
      });
      vi.mocked(api.get).mockResolvedValue(legs);
      const { result } = renderHook(() => useGuidedSession());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.remainingCount).toBe(1);
    });

    it("un ejercicio a medias sigue pendiente", async () => {
      expect(
        await nextFor(legs, {
          currentIndex: 2,
          progress: { 0: 1, 1: 3, 2: 3 },
        }),
      ).toBe("hack");
    });

    it("no recomienda los saltados y sin pendientes no hay siguiente", async () => {
      expect(
        await nextFor(legs, {
          currentIndex: 1,
          progress: { 1: 3, 2: 3 },
          skipped: { 0: true },
        }),
      ).toBeNull();
    });

    it("un ejercicio libre cuenta como hecho con una serie", async () => {
      const withFree = {
        ...legs,
        items: [item("free", 0, 0), ...legs.items.slice(1)],
      };
      expect(
        await nextFor(withFree, {
          currentIndex: 1,
          progress: { 0: 1, 1: 3 },
        }),
      ).toBe("leg-extension");
      expect(
        await nextFor(withFree, {
          currentIndex: 2,
          progress: { 1: 3, 2: 3 },
        }),
      ).toBe("free");
    });
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
