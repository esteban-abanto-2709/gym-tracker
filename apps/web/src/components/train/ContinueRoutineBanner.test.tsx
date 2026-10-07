import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContinueRoutineBanner } from "./ContinueRoutineBanner";

const saveSession = (startedAt: string) =>
  localStorage.setItem(
    "gymtrack-active-routine",
    JSON.stringify({
      routineId: "r-upper",
      routineName: "Upper A",
      startedAt,
      currentIndex: 0,
      progress: {},
    }),
  );

describe("ContinueRoutineBanner", () => {
  it("sin sesion activa no se muestra", () => {
    const { container } = render(<ContinueRoutineBanner />);

    expect(container.innerHTML).toBe("");
  });

  it("con sesion de hoy invita a continuar la rutina", () => {
    saveSession(new Date().toISOString());

    render(<ContinueRoutineBanner />);

    expect(screen.getByText("En curso · Upper A")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/train");
  });

  it("con sesion de otro dia no se muestra", () => {
    saveSession("2020-01-01T10:00:00Z");

    const { container } = render(<ContinueRoutineBanner />);

    expect(container.innerHTML).toBe("");
  });
});
