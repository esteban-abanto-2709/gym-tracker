import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SessionMap } from "./SessionMap";

const renderMap = (remainingCount: number) => {
  const onFinish = vi.fn();
  render(
    <SessionMap
      items={[]}
      position={1}
      totalCount={2}
      remainingCount={remainingCount}
      onGoTo={vi.fn()}
      onSkip={vi.fn()}
      onReplace={vi.fn()}
      onFinish={onFinish}
      onClose={vi.fn()}
    />,
  );
  return onFinish;
};

describe("SessionMap", () => {
  it("terminar la sesion pide confirmar y dice cuantos faltan", () => {
    const onFinish = renderMap(2);

    fireEvent.click(screen.getByRole("button", { name: /Terminar sesión/ }));
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("ejercicios sin hacer")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Terminar" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("seguir entrenando cierra el aviso sin terminar", () => {
    const onFinish = renderMap(0);

    fireEvent.click(screen.getByRole("button", { name: /Terminar sesión/ }));
    expect(screen.queryByText(/sin hacer/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Seguir entrenando" }));
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.queryByText("¿Terminar la sesión?")).toBeNull();
  });
});
