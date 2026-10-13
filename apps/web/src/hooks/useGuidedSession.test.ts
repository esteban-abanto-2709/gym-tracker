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

    describe("al registrar", () => {
      const start = async (r: Routine, overrides: Partial<ActiveSession>) => {
        saveSession(overrides);
        vi.mocked(api.get).mockResolvedValue(r);
        vi.mocked(api.post).mockResolvedValue(undefined);
        const hook = renderHook(() => useGuidedSession());
        await waitFor(() => expect(hook.result.current.loading).toBe(false));
        return hook.result;
      };
      const set = { weightKg: 60, reps: 8 };

      it("se queda en el ejercicio si le faltan series", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        await act(() => result.current.logSet(set));
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.setsDoneForCurrent).toBe(1);
        expect(result.current.phase).toBe("logging");
        expect(result.current.flash).toBeNull();
      });

      it("con la ultima serie pasa solo al siguiente pendiente", async () => {
        const result = await start(legs, {
          currentIndex: 0,
          progress: { 0: 2, 1: 3 },
        });
        await act(() => result.current.logSet(set));
        expect(result.current.currentItem?.exerciseId).toBe("leg-extension");
        expect(result.current.phase).toBe("logging");
      });

      it("un ejercicio libre se queda para seguir registrando", async () => {
        const withFree = {
          ...legs,
          items: [item("free", 0, 0), ...legs.items.slice(1)],
        };
        const result = await start(withFree, { currentIndex: 0, progress: {} });
        await act(() => result.current.logSet(set));
        expect(result.current.currentItem?.exerciseId).toBe("free");
        expect(result.current.nextItem?.exerciseId).toBe("hip-thrust");
      });

      it("sin pendientes termina en la pantalla final", async () => {
        const result = await start(legs, {
          currentIndex: 2,
          progress: { 0: 3, 1: 3, 2: 2 },
        });
        await act(() => result.current.logSet(set));
        expect(result.current.phase).toBe("done");
      });

      it("dos toques seguidos guardan una sola serie", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockClear();
        await act(() =>
          Promise.all([
            result.current.logSet(set),
            result.current.logSet(set),
          ]),
        );
        expect(api.post).toHaveBeenCalledOnce();
        expect(result.current.setsDoneForCurrent).toBe(1);
      });

      it("si falla el guardado sigue en la misma serie", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockRejectedValueOnce(new Error("offline"));
        await act(() => result.current.logSet(set));
        expect(result.current.setsDoneForCurrent).toBe(0);
        expect(result.current.phase).toBe("logging");
        expect(result.current.flash).toBeNull();
      });
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
