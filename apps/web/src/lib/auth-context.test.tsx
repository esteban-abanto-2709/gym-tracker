import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "./auth-context";

const replace = vi.fn();
const setTheme = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => pathname,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: (theme: string) => setTheme(theme) }),
}));

const meResponds = (loggedIn: boolean, theme = "system") =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: loggedIn,
      json: () =>
        Promise.resolve(
          loggedIn ? { id: "u1", theme } : { message: "Unauthorized" },
        ),
    }),
  );

const renderAt = (path: string) => {
  pathname = path;
  return render(
    <AuthProvider>
      <p>contenido</p>
    </AuthProvider>,
  );
};

describe("AuthProvider guard", () => {
  beforeEach(() => replace.mockReset());
  afterEach(() => vi.unstubAllGlobals());

  it("shows the privacy page without a session", async () => {
    meResponds(false);
    renderAt("/privacidad");
    expect(await screen.findByText("contenido")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the privacy page with a session", async () => {
    meResponds(true);
    renderAt("/privacidad");
    expect(await screen.findByText("contenido")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("lets a logged-out user stay on the home page to see the landing", async () => {
    meResponds(false);
    renderAt("/");
    expect(await screen.findByText("contenido")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("still sends a logged-out user from a private page to login", async () => {
    meResponds(false);
    renderAt("/perfil");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("contenido")).toBeNull();
  });
});

describe("AuthProvider theme", () => {
  beforeEach(() => setTheme.mockReset());
  afterEach(() => vi.unstubAllGlobals());

  it("applies the theme saved in the account", async () => {
    meResponds(true, "light");
    renderAt("/perfil");
    await waitFor(() => expect(setTheme).toHaveBeenCalledWith("light"));
  });

  it("follows the system without a session", async () => {
    meResponds(false);
    renderAt("/login");
    await waitFor(() => expect(setTheme).toHaveBeenCalledWith("system"));
  });

  it("does not reapply the account theme when the provider re-renders", async () => {
    meResponds(true, "light");
    const { rerender } = renderAt("/perfil");
    await screen.findByText("contenido");
    rerender(
      <AuthProvider>
        <p>contenido</p>
      </AuthProvider>,
    );
    expect(setTheme).toHaveBeenCalledTimes(1);
  });
});
