import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkoutHistory } from "./useWorkoutHistory";
import { api } from "@/lib/api";
import type { SessionPage, SessionSummary, Workout } from "@/lib/types";

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
    createdAt,
  }) as Workout;

const newest = set("w-newest", "2026-10-05T15:00:00Z");
const older = set("w-older", "2026-10-03T15:00:00Z");
const oldest = set("w-oldest", "2026-09-20T15:00:00Z");

const session = (
  id: string,
  startedAt: string,
  routine: string | null = "Upper A",
): SessionSummary => ({
  id,
  startedAt,
  endedAt: startedAt,
  timeZone: "America/Lima",
  routine: routine ? { id: `r-${id}`, name: routine } : null,
  sets: 1,
});

const s1 = session("s-1", "2026-10-05T15:00:00Z");
const s2 = session("s-2", "2026-10-03T15:00:00Z", null);
const s3 = session("s-3", "2026-09-20T15:00:00Z");
const setsOf: Record<string, Workout[]> = {
  "s-1": [newest],
  "s-2": [older],
  "s-3": [oldest],
};

const mockApi = (pages: Record<string, SessionPage>) =>
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith("/sessions/")) {
      return { sets: setsOf[url.slice("/sessions/".length)] };
    }
    const before = new URL(url, "http://x").searchParams.get("before") ?? "";
    return pages[before];
  });

const twoPages = {
  "": { sessions: [s1, s2], next: s2.startedAt, first: s3.startedAt },
  [s2.startedAt]: { sessions: [s3], next: null, first: null },
};

const loadHistory = async (pages: Record<string, SessionPage> = twoPages) => {
  mockApi(pages);
  vi.mocked(api.delete).mockResolvedValue(undefined);
  const hook = renderHook(() => useWorkoutHistory());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe("useWorkoutHistory", () => {
  it("opens on the most recent session with its sets", async () => {
    const { result } = await loadHistory();

    expect(result.current.sessions.map((s) => s.id)).toEqual(["s-1", "s-2"]);
    expect(result.current.currentSession?.id).toBe("s-1");
    expect(result.current.currentWorkouts).toEqual([newest]);
    expect(api.get).toHaveBeenCalledWith("/sessions/s-1");
  });

  it("tapping another session requests only that session", async () => {
    const { result } = await loadHistory();

    act(() => result.current.setSelectedSession("s-2"));

    await waitFor(() =>
      expect(result.current.currentWorkouts).toEqual([older]),
    );
    expect(vi.mocked(api.get).mock.lastCall?.[0]).toBe("/sessions/s-2");
  });

  it("loads the next page after the last session and then stops", async () => {
    const { result } = await loadHistory();
    expect(result.current.hasMore).toBe(true);

    await act(() => result.current.loadMore());

    expect(result.current.sessions.map((s) => s.id)).toEqual([
      "s-1",
      "s-2",
      "s-3",
    ]);
    expect(result.current.hasMore).toBe(false);
    expect(api.get).toHaveBeenCalledWith(
      `/sessions?before=${encodeURIComponent(s2.startedAt)}`,
    );
  });

  it("the export starts at the first session, even before loading it", async () => {
    const { result } = await loadHistory();
    expect(result.current.firstDay).toBe(
      new Date(s3.startedAt).toLocaleDateString("en-CA"),
    );
  });

  it("names the session by its routine, or as a free day", async () => {
    const { result } = await loadHistory();
    expect(result.current.sessionTitle(s1)).toMatch(/· Upper A$/);
    expect(result.current.sessionTitle(s2)).toMatch(/· Día libre$/);
  });

  it("two sessions on the same day show their time", async () => {
    const morning = session("s-am", "2026-10-05T13:00:00Z");
    const evening = session("s-pm", "2026-10-05T23:30:00Z");
    const { result } = await loadHistory({
      "": { sessions: [evening, morning, s2], next: null, first: null },
    });

    expect(result.current.sessionLabel(evening)).toMatch(/· 18:30$/);
    expect(result.current.sessionLabel(morning)).toMatch(/· 08:00$/);
    expect(result.current.sessionLabel(s2)).not.toMatch(/·/);
  });

  it("deleting the last set of a session drops it and moves to the next", async () => {
    const { result } = await loadHistory();

    act(() => result.current.setDeletingWorkout(newest));
    await act(() => result.current.confirmDelete());

    expect(result.current.sessions.map((s) => s.id)).toEqual(["s-2"]);
    await waitFor(() =>
      expect(result.current.currentWorkouts).toEqual([older]),
    );
  });

  it("without history there is no session nor first day", async () => {
    const { result } = await loadHistory({
      "": { sessions: [], next: null, first: null },
    });

    expect(result.current.currentSession).toBeNull();
    expect(result.current.firstDay).toBeNull();
    expect(result.current.hasMore).toBe(false);
  });
});
