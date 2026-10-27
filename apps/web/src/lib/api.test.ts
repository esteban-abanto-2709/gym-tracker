import { describe, it, expect, vi, afterEach } from "vitest";
import { api, ApiError } from "./api";

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

  it("carries the HTTP status on a failed request", async () => {
    stubLocation("/train");
    stubResponse(404);

    const error = await api.get("/routines/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: "Unauthorized" });
  });

  it("does not redirect when the caller handles the 401 itself", async () => {
    const replace = stubLocation("/perfil");
    stubResponse(401);

    await expect(
      api.get("/auth/me", { redirectOn401: false }),
    ).rejects.toMatchObject({ status: 401 });
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends a body with DELETE", async () => {
    stubLocation("/perfil");
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);

    await api.delete("/auth/me", { email: "a@b.c" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ email: "a@b.c" }),
      }),
    );
  });
});
