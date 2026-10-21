import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeSheet } from "./ThemeSheet";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme }),
}));

describe("ThemeSheet", () => {
  it("offers system, light and dark, with system selected", () => {
    render(<ThemeSheet onClose={vi.fn()} />);
    const options = screen.getAllByRole("radio");

    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining("Sistema"),
      expect.stringContaining("Claro"),
      expect.stringContaining("Oscuro"),
    ]);
    expect(options[0].getAttribute("aria-checked")).toBe("true");
  });

  it("applies the theme on tap", () => {
    render(<ThemeSheet onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: /Claro/ }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("closes from the X button", () => {
    const onClose = vi.fn();
    render(<ThemeSheet onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
