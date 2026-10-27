import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useExercises } from "./useExercises";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

describe("useExercises", () => {
  it("tells the user when creating an exercise fails", async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    vi.mocked(api.post).mockRejectedValue(new Error("Request failed"));

    const { result } = renderHook(() => useExercises());
    await waitFor(() => expect(result.current.loadingExercises).toBe(false));

    await act(() =>
      expect(result.current.createExercise("Remo")).rejects.toThrow(),
    );

    expect(notifyError).toHaveBeenCalledWith("No se pudo crear el ejercicio");
    expect(result.current.creatingExercise).toBe(false);
  });
});
