import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ExportSheet } from "./ExportSheet";
import type { Workout } from "@/lib/types";

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { birthDate: null } }),
}));

vi.mock("@/hooks/useMeasurements", () => ({
  useMeasurements: () => ({ measurements: [], loading: false }),
}));

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const set = (createdAt: string): Workout => ({
  id: createdAt,
  exerciseId: "bench",
  exercise: { id: "bench", name: "Press banca" },
  weight: 80,
  reps: 8,
  createdAt,
});

const pressed = () =>
  screen
    .getAllByRole("button", { pressed: true })
    .map((b) => b.textContent);

describe("ExportSheet", () => {
  it("arranca en 30 dias y el resumen sigue al rango elegido", () => {
    render(
      <ExportSheet
        workouts={[set(daysAgo(1)), set(daysAgo(10)), set(daysAgo(60))]}
        onClose={vi.fn()}
      />,
    );

    expect(pressed()).toEqual(["30 días"]);
    expect(screen.getByText("2 series")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));
    expect(screen.getByText("1 serie")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));
    expect(screen.getByText("3 series")).toBeTruthy();
  });

  it("sin series en el rango no deja exportar", () => {
    render(<ExportSheet workouts={[set(daysAgo(60))]} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));

    expect(screen.getByText("Sin series en este rango.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /copiar texto/i }),
    ).toHaveProperty("disabled", true);
  });
});
