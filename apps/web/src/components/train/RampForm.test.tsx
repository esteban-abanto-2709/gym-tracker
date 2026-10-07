import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RampForm } from "./RampForm";
import { api } from "@/lib/api";
import type { RampStepPlan } from "@/lib/blocks";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn() },
}));

const get = vi.mocked(api.get);

const steps: RampStepPlan[] = [
  { step: 1, reps: 10, pct: 50 },
  { step: 2, reps: 5, pct: 70 },
  { step: 3, reps: 3, pct: 85 },
];

const rec = (overrides: object = {}) => ({
  lastWeight: null,
  lastReps: null,
  workingWeight: null,
  ...overrides,
});

const weights = () =>
  steps.map(
    (s) =>
      (screen.getByLabelText(`Peso del escalón ${s.step}`) as HTMLInputElement)
        .value,
  );

const props = {
  exerciseId: "ex-press",
  steps,
  equipment: [],
  logging: false,
};

describe("RampForm", () => {
  it("muestra todos los escalones con el peso de la ultima vez o el porcentaje", async () => {
    get.mockImplementation(async (url: string) =>
      url.includes("step=2")
        ? rec({ lastWeight: 45, workingWeight: 60 })
        : rec({ workingWeight: 60 }),
    );

    render(<RampForm {...props} onLog={vi.fn()} />);

    await waitFor(() => expect(weights()).toEqual(["30", "45", "51"]));
  });

  it("si el efectivo subio, la etiqueta propone el peso y al tocarla lo aplica", async () => {
    get.mockImplementation(async (url: string) =>
      url.includes("step=1")
        ? rec({ lastWeight: 30, workingWeight: 70 })
        : rec({ lastWeight: 60, workingWeight: 70 }),
    );

    render(<RampForm {...props} onLog={vi.fn()} />);
    const chip = await screen.findByRole("button", { name: "Sube a 35 kg" });
    expect(chip.textContent).toBe("35 kg");

    fireEvent.click(chip);

    expect(weights()[0]).toBe("35");
    expect(screen.queryByRole("button", { name: /^Sube a/ })).toBeNull();
  });

  it("un toque registra todos los escalones como rampa", async () => {
    get.mockResolvedValue(rec({ workingWeight: 100 }));
    const onLog = vi.fn().mockResolvedValue(undefined);

    render(<RampForm {...props} onLog={onLog} />);
    await waitFor(() => expect(weights()).toEqual(["50", "70", "85"]));
    fireEvent.change(screen.getByLabelText("Peso del escalón 2"), {
      target: { value: "72.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /rampa hecha/i }));

    await waitFor(() => expect(onLog).toHaveBeenCalledTimes(1));
    expect(onLog.mock.calls[0][0]).toEqual([
      { weightKg: 50, reps: 10, equipmentId: null, setType: "RAMP", step: 1 },
      { weightKg: 72.5, reps: 5, equipmentId: null, setType: "RAMP", step: 2 },
      { weightKg: 85, reps: 3, equipmentId: null, setType: "RAMP", step: 3 },
    ]);
  });
});
