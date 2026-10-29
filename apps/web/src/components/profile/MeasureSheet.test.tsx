import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
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
  it("saves with a single value and leaves the others empty", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithIntl(<MeasureSheet {...props} onSave={onSave} />);

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

  it("a date that already has a measurement loads its values to update it", () => {
    renderWithIntl(<MeasureSheet {...props} onSave={vi.fn()} />);

    const date = document.querySelector('input[type="date"]')!;
    fireEvent.change(date, { target: { value: "2026-09-29" } });

    expect(screen.getByLabelText("Peso (kg)")).toHaveProperty("value", "78.4");
    expect(screen.getByLabelText("Grasa (%)")).toHaveProperty("value", "19");
    expect(save().textContent).toContain("Actualizar");
  });

  it("an out-of-range value blocks saving and says why", () => {
    renderWithIntl(<MeasureSheet {...props} onSave={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Grasa (%)"), {
      target: { value: "95" },
    });

    expect(save()).toHaveProperty("disabled", true);
    expect(screen.getByText("Grasa entre 2 y 70 %")).toBeTruthy();
  });
});
