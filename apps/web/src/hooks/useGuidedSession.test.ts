import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useGuidedSession } from "./useGuidedSession";
import { api } from "@/lib/api";
import { readActiveSession, type ActiveSession } from "@/lib/activeSession";
import { addPendingSets, readPendingSets } from "@/lib/pendingSets";
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
      sessionId: "s-upper",
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
  it("finishes loading without a routine when there is no active session", async () => {
    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(result.current.routine).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("resumes the saved session where it was left", async () => {
    saveSession();
    vi.mocked(api.get).mockResolvedValue(routine);

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith("/routines/r-upper");
    expect(result.current.currentItem?.exerciseId).toBe("ex-row");
    expect(result.current.setsDoneForCurrent).toBe(1);
    expect(result.current.mapItems.map((m) => m.status)).toEqual([
      "done",
      "partial",
    ]);
    expect(result.current.position).toBe(2);
    expect(result.current.totalCount).toBe(2);
  });

  it("logging a set stores the time to count the rest", async () => {
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

  describe("next exercise", () => {
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

    const nextFor = async (r: Routine, overrides: Partial<ActiveSession>) => {
      saveSession(overrides);
      vi.mocked(api.get).mockResolvedValue(r);
      const { result } = renderHook(() => useGuidedSession());
      await waitFor(() => expect(result.current.loading).toBe(false));
      return result.current.nextItem?.exerciseId ?? null;
    };

    it("goes back to an earlier pending one when nothing is left ahead", async () => {
      const twoItems = { ...legs, items: legs.items.slice(0, 2) };
      expect(
        await nextFor(twoItems, { currentIndex: 1, progress: { 1: 3 } }),
      ).toBe("hack");
    });

    it("does not recommend a finished exercise", async () => {
      expect(
        await nextFor(legs, { currentIndex: 0, progress: { 0: 3, 1: 3 } }),
      ).toBe("leg-extension");
    });

    it("moves forward before going back to the one left behind", async () => {
      expect(await nextFor(legs, { currentIndex: 1, progress: { 1: 3 } })).toBe(
        "leg-extension",
      );
    });

    it("counts the remaining exercises, without the skipped ones", async () => {
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

    it("a half-done exercise stays pending", async () => {
      expect(
        await nextFor(legs, {
          currentIndex: 2,
          progress: { 0: 1, 1: 3, 2: 3 },
        }),
      ).toBe("hack");
    });

    it("does not recommend skipped ones and has no next without pending ones", async () => {
      expect(
        await nextFor(legs, {
          currentIndex: 1,
          progress: { 1: 3, 2: 3 },
          skipped: { 0: true },
        }),
      ).toBeNull();
    });

    it("a free exercise counts as done with one set", async () => {
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

    describe("on logging", () => {
      const start = async (r: Routine, overrides: Partial<ActiveSession>) => {
        saveSession(overrides);
        vi.mocked(api.get).mockResolvedValue(r);
        vi.mocked(api.post).mockResolvedValue(undefined);
        const hook = renderHook(() => useGuidedSession());
        await waitFor(() => expect(hook.result.current.loading).toBe(false));
        return hook.result;
      };
      const set = { weightKg: 60, reps: 8 };

      it("each set carries its session, its time and the timezone", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockClear();
        await act(() => result.current.logSet(set));
        expect(api.post).toHaveBeenCalledWith(
          "/workouts",
          expect.objectContaining({
            sessionId: "s-upper",
            routineId: "r-upper",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            performedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          }),
        );
      });

      it("stays on the exercise while it has sets left", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        await act(() => result.current.logSet(set));
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.setsDoneForCurrent).toBe(1);
        expect(result.current.phase).toBe("logging");
        expect(result.current.flash).toBeNull();
      });

      it("moves on to the next pending one after the last set", async () => {
        const result = await start(legs, {
          currentIndex: 0,
          progress: { 0: 2, 1: 3 },
        });
        await act(() => result.current.logSet(set));
        expect(result.current.currentItem?.exerciseId).toBe("leg-extension");
        expect(result.current.phase).toBe("logging");
      });

      it("a free exercise stays to keep logging", async () => {
        const withFree = {
          ...legs,
          items: [item("free", 0, 0), ...legs.items.slice(1)],
        };
        const result = await start(withFree, { currentIndex: 0, progress: {} });
        await act(() => result.current.logSet(set));
        expect(result.current.currentItem?.exerciseId).toBe("free");
        expect(result.current.nextItem?.exerciseId).toBe("hip-thrust");
      });

      it("ends on the final screen without pending ones", async () => {
        const result = await start(legs, {
          currentIndex: 2,
          progress: { 0: 3, 1: 3, 2: 2 },
        });
        await act(() => result.current.logSet(set));
        expect(result.current.phase).toBe("done");
      });

      it("two quick taps save a single set", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockClear();
        await act(() =>
          Promise.all([result.current.logSet(set), result.current.logSet(set)]),
        );
        expect(api.post).toHaveBeenCalledOnce();
        expect(result.current.setsDoneForCurrent).toBe(1);
      });

      it("advances without waiting for the server", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        let answer: (v: unknown) => void = () => {};
        vi.mocked(api.post).mockReturnValueOnce(
          new Promise((r) => (answer = r)),
        );
        await act(() => result.current.logSet(set));
        expect(result.current.setsDoneForCurrent).toBe(1);
        expect(readPendingSets()).toHaveLength(1);
        await act(async () => answer(undefined));
        await waitFor(() => expect(readPendingSets()).toHaveLength(0));
      });

      it("advances anyway when sending fails and the set stays pending", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockRejectedValueOnce(new Error("offline"));
        await act(() => result.current.logSet(set));
        expect(result.current.setsDoneForCurrent).toBe(1);
        expect(result.current.flash).toBeNull();
        expect(readPendingSets()).toHaveLength(1);
      });

      it("finishing with pending sets offers a retry with the same clientId", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockClear();
        vi.mocked(api.post).mockRejectedValueOnce(new Error("offline"));
        await act(() => result.current.logSet(set));
        const clientId = readPendingSets()[0].clientId;

        vi.mocked(api.post).mockRejectedValueOnce(new Error("offline"));
        await act(async () => result.current.finish());
        await waitFor(() => expect(result.current.retrying).toBe(false));
        expect(result.current.unsaved).toHaveLength(1);
        expect(readActiveSession()).not.toBeNull();

        await act(() => result.current.retryUnsaved());
        expect(readPendingSets()).toHaveLength(0);
        expect(readActiveSession()).toBeNull();
        const sent = vi
          .mocked(api.post)
          .mock.calls.map(
            ([, body]) => (body as { clientId: string }).clientId,
          );
        expect(sent).toEqual([clientId, clientId, clientId]);
      });

      it("discarding drops the pending sets and closes the session", async () => {
        const result = await start(legs, { currentIndex: 0, progress: {} });
        vi.mocked(api.post).mockRejectedValue(new Error("offline"));
        await act(() => result.current.logSet(set));
        await act(async () => result.current.finish());
        await waitFor(() => expect(result.current.unsaved).toHaveLength(1));

        act(() => result.current.discardUnsaved());
        expect(readPendingSets()).toHaveLength(0);
        expect(readActiveSession()).toBeNull();
      });

      it("sends what was left pending on open", async () => {
        addPendingSets([
          {
            clientId: "c-1",
            label: "Press banca · 60 kg × 8 reps",
            body: {
              exerciseId: "ex-bench",
              routineId: "r-upper",
              sessionId: "s-1",
              performedAt: "2026-10-24T10:00:00.000Z",
              timeZone: "America/Lima",
              reps: 8,
              weight: 60,
              durationSec: null,
              equipmentId: null,
              setType: "WORKING",
              step: null,
            },
          },
        ]);
        vi.mocked(api.post).mockClear();
        await start(legs, { currentIndex: 0, progress: {} });
        await waitFor(() => expect(readPendingSets()).toHaveLength(0));
        expect(api.post).toHaveBeenCalledWith(
          "/workouts",
          expect.objectContaining({ clientId: "c-1", exerciseId: "ex-bench" }),
        );
      });
    });
  });

  it("does not resume a session idle for more than 3 hours", async () => {
    saveSession({ startedAt: "2020-01-01T10:00:00Z" });

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toBeNull();
    expect(readActiveSession()).toBeNull();
  });

  it("discards the session when the routine no longer exists", async () => {
    saveSession();
    vi.mocked(api.get).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useGuidedSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.routine).toBeNull();
    expect(readActiveSession()).toBeNull();
  });
});
