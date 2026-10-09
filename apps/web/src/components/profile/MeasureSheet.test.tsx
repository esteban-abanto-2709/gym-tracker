import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MeasureSheet } from "./MeasureSheet";

const props = {
  initialDate: "2026-10-08",
  measurements: [
    { date: "2026-09-29", weightKg: 78.4, bodyFatPct: 19, heightCm: null },
  ],
  onDelete: vi.fn(),
  onClose: vi.fn(),
};

const save = () => screen.getByRole("button", { name: /guardar|actualizar/i });

describe("MeasureSheet", () => {
  it("guarda con un solo dato y deja los otros vacios", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<MeasureSheet {...props} onSave={onSave} />);

    expect(save()).toHaveProperty("disabled", true);
    fireEvent.change(screen.getByLabelText("Peso (kg)"), {
      target: { value: "77.9" },
    });
    fireEvent.click(save());

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        date: "2026-10-08",
        weightKg: 77.9,
        bodyFatPct: null,
        heightCm: null,
      }),
    );
  });

  it("una fecha que ya tiene medida trae sus valores para actualizarla", () => {
    render(<MeasureSheet {...props} onSave={vi.fn()} />);

    const date = document.querySelector('input[type="date"]')!;
    fireEvent.change(date, { target: { value: "2026-09-29" } });

    expect(screen.getByLabelText("Peso (kg)")).toHaveProperty("value", "78.4");
    expect(screen.getByLabelText("Grasa (%)")).toHaveProperty("value", "19");
    expect(save().textContent).toContain("Actualizar");
  });

  it("un valor fuera de rango bloquea el guardado y dice por que", () => {
    render(<MeasureSheet {...props} onSave={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Grasa (%)"), {
      target: { value: "95" },
    });

    expect(save()).toHaveProperty("disabled", true);
    expect(screen.getByText("Grasa entre 2 y 70 %")).toBeTruthy();
  });
});
