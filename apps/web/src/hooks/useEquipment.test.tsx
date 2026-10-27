import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import { useEquipment } from "./useEquipment";
import { api, ApiError } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { queryWrapper } from "@/lib/queryTesting";
import type { Equipment } from "@/lib/types";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { get: vi.fn() },
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

const barbell = { id: "eq-1", name: "Barra" } as Equipment;

let client: QueryClient;
let wrapper: ReturnType<typeof queryWrapper>["wrapper"];

const render = () => renderHook(() => useEquipment(), { wrapper });

describe("useEquipment", () => {
  beforeEach(() => {
    vi.mocked(notifyError).mockReset();
    ({ client, wrapper } = queryWrapper());
  });

  it("loads the equipment list", async () => {
    vi.mocked(api.get).mockResolvedValue([barbell]);
    const { result } = render();
    await waitFor(() => expect(result.current.equipment).toEqual([barbell]));
  });

  it("tells the user when the first load fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError("boom", 500));
    render();
    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        "No se pudieron cargar los equipos",
      ),
    );
  });

  it("stays quiet on a 401, the client already sends the user to login", async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError("Unauthorized", 401));
    render();
    await waitFor(() =>
      expect(client.getQueryState(["equipment"])?.status).toBe("error"),
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it("keeps showing cached data when a background refresh fails", async () => {
    client.setQueryData(["equipment"], [barbell]);
    vi.mocked(api.get).mockRejectedValue(new ApiError("boom", 500));
    const { result } = render();
    await act(() => client.refetchQueries({ queryKey: ["equipment"] }));
    expect(result.current.equipment).toEqual([barbell]);
    expect(notifyError).not.toHaveBeenCalled();
  });
});
