import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SetDoneScreen } from "./SetDoneScreen";
import type { RoutineItem } from "@/lib/types";

const result = {
  exerciseName: "Leg Extension",
  weightKg: 40,
  reps: 8,
  durationSec: null,
  setNumber: 2,
};

const nextItem: RoutineItem = {
  exerciseId: "ex-hack",
  exercise: { id: "ex-hack", name: "Hack Squat" },
  position: 0,
  blocks: [],
};

const renderScreen = (finished: boolean) => {
  const handlers = {
    onContinueSet: vi.fn(),
    onNext: vi.fn(),
    onFinish: vi.fn(),
  };
  render(
    <SetDoneScreen
      result={result}
      hasPendingSets={false}
      nextItem={finished ? null : nextItem}
      nextUp={
        finished
          ? null
          : { label: "Prepara la siguiente máquina", name: "Hack Squat", detail: "" }
      }
      {...handlers}
    />,
  );
  return handlers;
};

describe("SetDoneScreen", () => {
  it("al completar la rutina, terminar es la accion principal", () => {
    const { onFinish } = renderScreen(true);

    expect(screen.getByText("¡Rutina completada!")).toBeDefined();
    expect(screen.queryByText(/descansa/i)).toBeNull();

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toBe("Terminar sesión");
    fireEvent.click(buttons[0]);
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("una serie extra vuelve al mismo ejercicio", () => {
    const { onContinueSet, onFinish } = renderScreen(true);

    fireEvent.click(screen.getByRole("button", { name: "Una serie extra" }));
    expect(onContinueSet).toHaveBeenCalledOnce();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("a mitad de rutina sigue ofreciendo el siguiente ejercicio", () => {
    const { onNext } = renderScreen(false);

    expect(screen.queryByText("Una serie extra")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Siguiente: Hack Squat" }),
    );
    expect(onNext).toHaveBeenCalledOnce();
  });
});
