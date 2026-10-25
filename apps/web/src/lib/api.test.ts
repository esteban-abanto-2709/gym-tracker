import { describe, it, expect, vi, afterEach } from "vitest";
import { api } from "./api";

function stubLocation(pathname: string) {
  const replace = vi.fn();
  vi.stubGlobal("location", { pathname, replace });
  return replace;
}

function stubResponse(status: number) {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Unauthorized" }), { status }),
      ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api", () => {
  it("replaces the page with login when the session expires", async () => {
    const replace = stubLocation("/train");
    stubResponse(401);

    await expect(api.get("/workouts")).rejects.toThrow("Unauthorized");
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("stays on login when the login call itself is rejected", async () => {
    const replace = stubLocation("/login");
    stubResponse(401);

    await expect(api.post("/auth/login", {})).rejects.toThrow();
    expect(replace).not.toHaveBeenCalled();
  });
});
