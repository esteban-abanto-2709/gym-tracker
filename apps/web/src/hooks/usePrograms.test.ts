import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePrograms } from "./usePrograms";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { queryWrapper } from "@/lib/queryTesting";
import type { Program } from "@/lib/types";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { get: vi.fn(), put: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

const ppl = { id: "p-ppl", name: "PPL", routines: [] } as unknown as Program;
const full = { id: "p-full", name: "Full", routines: [] } as unknown as Program;

const serve = () =>
  vi
    .mocked(api.get)
    .mockImplementation(async (url: string) =>
      url === "/programs/active"
        ? { program: ppl, nextRoutineId: null }
        : [ppl, full],
    );

describe("usePrograms", () => {
  it("marks the new active program at once", async () => {
    serve();
    vi.mocked(api.put).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePrograms(), queryWrapper());
    await waitFor(() => expect(result.current.activeProgramId).toBe("p-ppl"));

    act(() => {
      result.current.setActive("p-full");
    });

    await waitFor(() => expect(result.current.activeProgramId).toBe("p-full"));
  });

  it("goes back to the previous program when the change fails", async () => {
    serve();
    vi.mocked(api.put).mockRejectedValue(new Error("Request failed"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => usePrograms(), queryWrapper());
    await waitFor(() => expect(result.current.activeProgramId).toBe("p-ppl"));

    await act(() => result.current.setActive("p-full"));

    expect(result.current.activeProgramId).toBe("p-ppl");
    expect(notifyError).toHaveBeenCalledWith(
      "No se pudo cambiar el programa activo",
    );
  });
});
