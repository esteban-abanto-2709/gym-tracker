import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SetDoneScreen } from "./SetDoneScreen";

describe("SetDoneScreen", () => {
  it("finishing is the main action and an extra set keeps training", () => {
    const onFinish = vi.fn();
    const onExtraSet = vi.fn();
    render(<SetDoneScreen onFinish={onFinish} onExtraSet={onExtraSet} />);

    expect(screen.getByText("¡Rutina completada!")).toBeDefined();
    const [first, second] = screen.getAllByRole("button");
    expect(first.textContent).toBe("Terminar sesión");
    expect(second.textContent).toBe("Una serie extra");

    fireEvent.click(second);
    expect(onExtraSet).toHaveBeenCalledOnce();
    fireEvent.click(first);
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
