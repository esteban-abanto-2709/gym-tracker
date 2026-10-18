import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingGate } from "./LandingGate";

let user: { id: string } | null = null;

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user }),
}));

describe("LandingGate", () => {
  it("shows the landing with links to sign up and log in when logged out", () => {
    user = null;
    render(
      <LandingGate>
        <p>Hoy entrenas</p>
      </LandingGate>,
    );

    expect(screen.queryByText("Hoy entrenas")).toBeNull();
    expect(
      screen
        .getAllByRole("link", { name: "Crear cuenta" })
        .every((a) => a.getAttribute("href") === "/register"),
    ).toBe(true);
    expect(
      screen
        .getByRole("link", { name: "Ya tengo cuenta" })
        .getAttribute("href"),
    ).toBe("/login");
    expect(
      screen.getByText("Varias sesiones al tope: toca subir."),
    ).toBeTruthy();
  });

  it("shows the app home when logged in", () => {
    user = { id: "u1" };
    render(
      <LandingGate>
        <p>Hoy entrenas</p>
      </LandingGate>,
    );

    expect(screen.getByText("Hoy entrenas")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Crear cuenta" })).toBeNull();
  });
});
