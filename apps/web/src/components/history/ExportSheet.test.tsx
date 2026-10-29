import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { ExportSheet } from "./ExportSheet";
import { api } from "@/lib/api";
import type { Workout } from "@/lib/types";

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { birthDate: null } }),
}));

vi.mock("@/lib/api", () => ({ api: { get: vi.fn() } }));

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

const serveSets = (sets: Workout[]) =>
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    const params = new URL(url, "http://x").searchParams;
    const from = params.get("from")!;
    const to = params.get("to")!;
    return sets.filter((s) => s.createdAt >= from && s.createdAt < to);
  });

const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA");

const pressed = () =>
  screen.getAllByRole("button", { pressed: true }).map((b) => b.textContent);

describe("ExportSheet", () => {
  it("starts at 30 days and the summary follows the chosen range", async () => {
    serveSets([set(daysAgo(1)), set(daysAgo(10)), set(daysAgo(60))]);
    renderWithIntl(
      <ExportSheet firstDay={dayOf(daysAgo(60))} onClose={vi.fn()} />,
    );

    expect(pressed()).toEqual(["30 días"]);
    expect(await screen.findByText("2 series")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));
    expect(await screen.findByText("1 serie")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));
    expect(await screen.findByText("3 series")).toBeTruthy();
  });

  it("does not allow exporting without sets in the range", async () => {
    serveSets([set(daysAgo(60))]);
    renderWithIntl(
      <ExportSheet firstDay={dayOf(daysAgo(60))} onClose={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));

    expect(await screen.findByText("Sin series en este rango.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /copiar texto/i }),
    ).toHaveProperty("disabled", true);
  });
});
