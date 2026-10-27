import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useRoutines } from "./useRoutines";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import type { Routine } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

const push = { id: "r-1", name: "Push" } as Routine;

describe("useRoutines", () => {
  it("tells the user when deleting a routine fails and keeps it", async () => {
    vi.mocked(api.get).mockResolvedValue([push]);
    vi.mocked(api.delete).mockRejectedValue(new Error("Request failed"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useRoutines());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDeletingRoutine(push));
    await act(() => result.current.confirmDelete());

    expect(notifyError).toHaveBeenCalledWith("No se pudo eliminar la rutina");
    expect(result.current.routines).toEqual([push]);
  });
});
