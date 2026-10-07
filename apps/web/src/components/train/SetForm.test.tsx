import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SetForm } from "./SetForm";
import { api } from "@/lib/api";
import type { SetPlan } from "@/lib/blocks";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
}));

const get = vi.mocked(api.get);

const plan: SetPlan = {
  measure: "weight_reps",
  setType: "WORKING",
  approx: false,
  targetReps: 8,
  targetRepsMax: null,
  targetDurationSec: null,
  step: null,
  pct: null,
};

const rec = (overrides: object = {}) => ({
  lastWeight: null,
  lastReps: null,
  lastDurationSec: null,
  lastMeasure: null,
  workingWeight: null,
  ...overrides,
});

const props = {
  exerciseId: "ex-bench",
  plan,
  selectable: false,
  preferLastMeasure: false,
  equipment: [],
  logging: false,
  onLog: vi.fn(),
};

const inputs = () => screen.getAllByRole("spinbutton") as HTMLInputElement[];
const values = () => inputs().map((i) => i.value);

describe("SetForm", () => {
  it("arranca con las reps de la meta y luego precarga la ultima serie", async () => {
    get.mockResolvedValue(rec({ lastWeight: 60, lastReps: 7 }));

    render(<SetForm {...props} />);

    expect(values()).toEqual(["", "8"]);
    await waitFor(() => expect(values()).toEqual(["60", "7"]));
    expect(screen.getByText("La última vez · 60 kg × 7")).toBeTruthy();
  });

  it("al pasar a otro ejercicio limpia el formulario y precarga el nuevo", async () => {
    get.mockResolvedValueOnce(rec({ lastWeight: 60, lastReps: 7 }));
    const { rerender } = render(<SetForm {...props} />);
    await waitFor(() => expect(values()).toEqual(["60", "7"]));

    get.mockReturnValueOnce(new Promise(() => {}));
    rerender(
      <SetForm {...props} exerciseId="ex-row" plan={{ ...plan, targetReps: 10 }} />,
    );

    expect(values()).toEqual(["", "10"]);
    expect(screen.getByText("Sin registro previo")).toBeTruthy();
    expect(get).toHaveBeenLastCalledWith(
      expect.stringContaining("exerciseId=ex-row"),
    );
  });

  it("en una rampa sin registro propone el porcentaje del peso efectivo", async () => {
    get.mockResolvedValue(rec({ workingWeight: 100 }));

    render(
      <SetForm {...props} plan={{ ...plan, setType: "RAMP", step: 1, pct: 63 }} />,
    );

    await waitFor(() => expect(values()[0]).toBe("63"));
  });

  it("con preferLastMeasure adopta la ultima medida usada", async () => {
    get.mockResolvedValue(rec({ lastMeasure: "time", lastDurationSec: 45 }));

    render(<SetForm {...props} selectable preferLastMeasure />);

    await waitFor(() => expect(values()).toEqual(["45"]));
  });

  it("si el usuario eligio la medida, la ultima usada no la pisa", async () => {
    let resolve!: (value: unknown) => void;
    get.mockReturnValue(new Promise((r) => (resolve = r)));

    render(<SetForm {...props} selectable preferLastMeasure />);
    fireEvent.click(screen.getByRole("button", { name: "Solo reps" }));
    await act(async () => resolve(rec({ lastMeasure: "time", lastReps: 12 })));

    expect(values()).toEqual(["12"]);
  });
});
