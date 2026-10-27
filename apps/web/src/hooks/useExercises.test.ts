import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useExercises } from "./useExercises";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import type { Exercise } from "@/lib/types";
import { queryWrapper } from "@/lib/queryTesting";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

describe("useExercises", () => {
  it("shows a new exercise on every screen that lists exercises", async () => {
    const remo = { id: "ex-remo", name: "Remo" } as Exercise;
    vi.mocked(api.get).mockResolvedValue([]);
    vi.mocked(api.post).mockResolvedValue(remo);
    const shared = queryWrapper();

    const creator = renderHook(() => useExercises(), shared);
    const other = renderHook(() => useExercises(), shared);
    await waitFor(() =>
      expect(other.result.current.loadingExercises).toBe(false),
    );

    await act(() => creator.result.current.createExercise("Remo"));

    await waitFor(() => expect(other.result.current.exercises).toEqual([remo]));
  });

  it("tells the user when creating an exercise fails", async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    vi.mocked(api.post).mockRejectedValue(new Error("Request failed"));

    const { result } = renderHook(() => useExercises(), queryWrapper());
    await waitFor(() => expect(result.current.loadingExercises).toBe(false));

    await act(() =>
      expect(result.current.createExercise("Remo")).rejects.toThrow(),
    );

    expect(notifyError).toHaveBeenCalledWith("No se pudo crear el ejercicio");
    expect(result.current.creatingExercise).toBe(false);
  });
});
