import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const run = (path: string, token?: string) => {
  const request = new NextRequest(`http://localhost:3000${path}`);
  if (token) request.cookies.set("token", token);
  return proxy(request);
};

const location = (path: string, token?: string) =>
  run(path, token).headers.get("location");

describe("proxy", () => {
  it("sends a guest on a private page to login, keeping where they were", () => {
    expect(location("/routines/abc?tab=x")).toBe(
      "http://localhost:3000/login?next=%2Froutines%2Fabc%3Ftab%3Dx",
    );
  });

  it("lets a request with a session cookie through", () => {
    expect(location("/history", "jwt")).toBeNull();
  });

  it.each([
    "/",
    "/login",
    "/register",
    "/privacidad",
    "/explore",
    "/explore/routines/push",
    "/no-existe",
    "/routinesx",
  ])("lets a guest open %s", (path) => {
    expect(location(path)).toBeNull();
  });
});
