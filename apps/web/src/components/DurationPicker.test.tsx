import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { DurationField, DurationPicker } from "./DurationPicker";

describe("DurationPicker", () => {
  it("shows seconds split into minutes and seconds", () => {
    renderWithIntl(<DurationPicker value="90" onChange={vi.fn()} />);

    expect(screen.getByText("1 min 30 s")).toBeTruthy();
  });

  it("an empty value starts at zero", () => {
    renderWithIntl(<DurationPicker value="" onChange={vi.fn()} />);

    expect(screen.getByText("0 min 0 s")).toBeTruthy();
  });
});

describe("DurationField", () => {
  it("shows the time as a clock with no wheels until tapped", () => {
    renderWithIntl(
      <DurationField value="110" onChange={vi.fn()} label="Tiempo" />,
    );

    expect(screen.getByRole("button", { name: /1:50/ })).toBeTruthy();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("closing the sheet keeps the time unchanged", () => {
    const onChange = vi.fn();
    renderWithIntl(
      <DurationField value="110" onChange={onChange} label="Tiempo" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /1:50/ }));
    expect(screen.getByRole("dialog", { name: "Tiempo" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Listo applies the time chosen in the sheet", () => {
    const onChange = vi.fn();
    renderWithIntl(
      <DurationField value="110" onChange={onChange} label="Tiempo" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /1:50/ }));
    fireEvent.click(screen.getByRole("button", { name: "Listo" }));

    expect(onChange).toHaveBeenCalledWith("110");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Listo is disabled at zero", () => {
    renderWithIntl(
      <DurationField value="" onChange={vi.fn()} label="Tiempo" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /sin tiempo/ }));

    expect(
      (screen.getByRole("button", { name: "Listo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
