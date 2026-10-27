import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useRoutines } from "./useRoutines";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { queryWrapper } from "@/lib/queryTesting";
import type { Routine } from "@/lib/types";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

const push = { id: "r-1", name: "Push" } as Routine;

describe("useRoutines", () => {
  it("reuses the loaded list when another screen mounts it", async () => {
    vi.mocked(api.get).mockReset().mockResolvedValue([push]);
    const shared = queryWrapper();

    const first = renderHook(() => useRoutines(), shared);
    await waitFor(() => expect(first.result.current.routines).toEqual([push]));
    first.unmount();

    const second = renderHook(() => useRoutines(), shared);
    expect(second.result.current.routines).toEqual([push]);
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("drops a deleted routine from the list", async () => {
    vi.mocked(api.get).mockResolvedValue([push]);
    vi.mocked(api.delete).mockResolvedValue({});

    const { result } = renderHook(() => useRoutines(), queryWrapper());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDeletingRoutine(push));
    await act(() => result.current.confirmDelete());

    expect(result.current.routines).toEqual([]);
    expect(result.current.deletingRoutine).toBeNull();
  });

  it("tells the user when deleting a routine fails and keeps it", async () => {
    vi.mocked(api.get).mockResolvedValue([push]);
    vi.mocked(api.delete).mockRejectedValue(new Error("Request failed"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useRoutines(), queryWrapper());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setDeletingRoutine(push));
    await act(() => result.current.confirmDelete());

    expect(notifyError).toHaveBeenCalledWith("No se pudo eliminar la rutina");
    expect(result.current.routines).toEqual([push]);
  });
});
