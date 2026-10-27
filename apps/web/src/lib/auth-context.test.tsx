import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-context";
import {
  type PendingSet,
  addPendingSets,
  readPendingSets,
  setPendingOwner,
} from "./pendingSets";

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

  it.each(["/", "/privacidad"])(
    "renders %s before the session answers, so the server HTML has content",
    (path) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => new Promise(() => {})),
      );
      renderAt(path);
      expect(screen.getByText("contenido")).toBeTruthy();
    },
  );

  it("waits for the session on a private page", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    renderAt("/perfil");
    expect(screen.queryByText("contenido")).toBeNull();
  });

  it.each(["/explore", "/explore/routines/push"])(
    "lets a logged-out user browse %s",
    async (path) => {
      meResponds(false);
      renderAt(path);
      expect(await screen.findByText("contenido")).toBeTruthy();
      expect(replace).not.toHaveBeenCalled();
    },
  );

  it("does not open look-alike paths", async () => {
    meResponds(false);
    renderAt("/explorer");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it.each([
    ["?next=%2Fexplore%2Froutines%2Fpush", "/explore/routines/push"],
    ["?next=%2F%2Fevil.example", "/"],
    ["?next=%2F%5Cevil.example", "/"],
    ["?next=https%3A%2F%2Fevil.example", "/"],
    ["", "/"],
  ])("after signing in with %s goes to %s", async (search, target) => {
    window.history.replaceState(null, "", `/login${search}`);
    meResponds(true);
    renderAt("/login");
    await waitFor(() => expect(replace).toHaveBeenCalledWith(target));
    window.history.replaceState(null, "", "/");
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

describe("AuthProvider errors", () => {
  afterEach(() => vi.unstubAllGlobals());

  function LoginAttempt() {
    const { login } = useAuth();
    const [error, setError] = useState("");
    return (
      <button
        onClick={() =>
          login("a@b.c", "12345678").catch((e: Error) => setError(e.message))
        }
      >
        {error || "entrar"}
      </button>
    );
  }

  it.each([
    [401, "Correo o contraseña incorrectos."],
    [429, "Demasiados intentos. Espera un minuto y vuelve a probar."],
    [500, "No se pudo ingresar."],
  ])(
    "shows Spanish copy for a %i on login, not the API message",
    async (status, copy) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status,
          json: () => Promise.resolve({ message: "Invalid credentials" }),
        }),
      );
      pathname = "/login";
      render(
        <AuthProvider>
          <LoginAttempt />
        </AuthProvider>,
      );
      fireEvent.click(await screen.findByText("entrar"));
      expect(await screen.findByText(copy)).toBeTruthy();
    },
  );
});

describe("AuthProvider pending sets", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setPendingOwner(null);
  });

  const set = { clientId: "c-1", label: "Press banca" } as PendingSet;
  const ownQueue = () => localStorage.getItem("gymtrack-pending-sets:u1");

  function Account() {
    const { logout, deleteAccount } = useAuth();
    return (
      <>
        <button onClick={() => logout()}>salir</button>
        <button onClick={() => deleteAccount({ email: "a@b.c" })}>
          borrar
        </button>
      </>
    );
  }

  const signedIn = () => {
    meResponds(true);
    pathname = "/perfil";
    render(
      <AuthProvider>
        <Account />
      </AuthProvider>,
    );
  };

  it("keeps the queue under the signed-in account", async () => {
    signedIn();
    await screen.findByText("salir");
    addPendingSets([set]);
    expect(ownQueue()).not.toBeNull();
    expect(localStorage.getItem("gymtrack-pending-sets")).toBeNull();
  });

  it("signing out keeps the account's sets but stops reading them", async () => {
    signedIn();
    await screen.findByText("salir");
    addPendingSets([set]);
    fireEvent.click(screen.getByText("salir"));
    await waitFor(() => expect(readPendingSets()).toEqual([]));
    expect(ownQueue()).not.toBeNull();
  });

  it("deleting the account discards its pending sets", async () => {
    signedIn();
    await screen.findByText("borrar");
    addPendingSets([set]);
    fireEvent.click(screen.getByText("borrar"));
    await waitFor(() => expect(ownQueue()).toBeNull());
  });
});
