import { describe, it, expect, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SetForm } from "./SetForm";
import { api } from "@/lib/api";
import type { SetPlan } from "@/lib/blocks";
import { addPendingSets } from "@/lib/pendingSets";

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);

const plan: SetPlan = {
  measure: "weight_reps",
  setType: "WORKING",
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
  it("asks for the last set after sending the pending one", async () => {
    addPendingSets([
      {
        clientId: "c-1",
        label: "Press banca · 60 kg × 8 reps",
        body: {
          exerciseId: "ex-bench",
          routineId: "r-1",
          sessionId: "s-1",
          performedAt: "2026-10-24T10:00:00.000Z",
          timeZone: "America/Lima",
          reps: 8,
          weight: 60,
          durationSec: null,
          equipmentId: null,
          setType: "WORKING",
          step: null,
        },
      },
    ]);
    const order: string[] = [];
    vi.mocked(api.post).mockImplementationOnce(async () => {
      order.push("post");
    });
    get.mockImplementationOnce(async () => {
      order.push("get");
      return rec({ lastWeight: 60, lastReps: 8 });
    });

    render(<SetForm {...props} />);

    await waitFor(() => expect(values()).toEqual(["60", "8"]));
    expect(order).toEqual(["post", "get"]);
  });

  it("starts with the target reps and then preloads the last set", async () => {
    get.mockResolvedValue(rec({ lastWeight: 60, lastReps: 7 }));

    render(<SetForm {...props} />);

    expect(values()).toEqual(["", "8"]);
    await waitFor(() => expect(values()).toEqual(["60", "7"]));
    expect(screen.getByText("La última vez · 60 kg × 7")).toBeTruthy();
  });

  it("moving to another exercise clears the form and preloads the new one", async () => {
    get.mockResolvedValueOnce(rec({ lastWeight: 60, lastReps: 7 }));
    const { rerender } = render(<SetForm {...props} />);
    await waitFor(() => expect(values()).toEqual(["60", "7"]));

    get.mockReturnValueOnce(new Promise(() => {}));
    rerender(
      <SetForm
        {...props}
        exerciseId="ex-row"
        plan={{ ...plan, targetReps: 10 }}
      />,
    );

    expect(values()).toEqual(["", "10"]);
    expect(screen.getByText("Sin registro previo")).toBeTruthy();
    await waitFor(() =>
      expect(get).toHaveBeenLastCalledWith(
        expect.stringContaining("exerciseId=ex-row"),
      ),
    );
  });

  it("a ramp with no history suggests the percentage of the working weight", async () => {
    get.mockResolvedValue(rec({ workingWeight: 100 }));

    render(
      <SetForm
        {...props}
        plan={{ ...plan, setType: "RAMP", step: 1, pct: 63 }}
      />,
    );

    await waitFor(() => expect(values()[0]).toBe("63"));
  });

  it("with preferLastMeasure adopts the last measure used", async () => {
    get.mockResolvedValue(rec({ lastMeasure: "time", lastDurationSec: 45 }));

    render(<SetForm {...props} selectable preferLastMeasure />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /0:45/ })).toBeTruthy(),
    );
  });

  it("the last measure used does not override one the user chose", async () => {
    let resolve!: (value: unknown) => void;
    get.mockReturnValue(new Promise((r) => (resolve = r)));

    render(<SetForm {...props} selectable preferLastMeasure />);
    fireEvent.click(screen.getByRole("button", { name: "Solo reps" }));
    await act(async () => resolve(rec({ lastMeasure: "time", lastReps: 12 })));

    expect(values()).toEqual(["12"]);
  });

  it("a timed set is logged without reps", async () => {
    get.mockResolvedValue(rec({ lastDurationSec: 45 }));
    const onLog = vi.fn();

    const { container } = render(
      <SetForm
        {...props}
        onLog={onLog}
        plan={{
          ...plan,
          measure: "time",
          targetReps: null,
          targetDurationSec: 45,
        }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /0:45/ })).toBeTruthy(),
    );
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(onLog).toHaveBeenCalled());
    expect(onLog.mock.calls[0][0]).toMatchObject({ durationSec: 45 });
    expect(onLog.mock.calls[0][0]).not.toHaveProperty("reps");
  });
});
