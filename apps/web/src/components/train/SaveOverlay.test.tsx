import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaveOverlay } from "./SaveOverlay";

const flash = {
  title: "Serie 2",
  detail: "Hip Thrust · 60 kg × 8 reps",
  next: null,
  leaving: false,
};

describe("SaveOverlay", () => {
  it("muestra la serie desde el toque", () => {
    render(<SaveOverlay flash={flash} />);
    expect(screen.getByText("Serie 2")).toBeDefined();
    expect(screen.getByText("Hip Thrust · 60 kg × 8 reps")).toBeDefined();
  });

  it("muestra a que ejercicio pasas", () => {
    render(<SaveOverlay flash={{ ...flash, next: "Leg Extension" }} />);
    expect(screen.getByText("Leg Extension")).toBeDefined();
  });
});
