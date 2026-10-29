import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { ThemeSheet } from "./ThemeSheet";

const setTheme = vi.fn();
const updateMe = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { theme: "system" }, updateMe }),
}));

vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }));

describe("ThemeSheet", () => {
  beforeEach(() => {
    setTheme.mockReset();
    updateMe.mockReset().mockResolvedValue(undefined);
  });

  it("offers system, light and dark, with system selected", () => {
    renderWithIntl(<ThemeSheet onClose={vi.fn()} />);
    const options = screen.getAllByRole("radio");

    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining("Sistema"),
      expect.stringContaining("Claro"),
      expect.stringContaining("Oscuro"),
    ]);
    expect(options[0].getAttribute("aria-checked")).toBe("true");
  });

  it("applies the theme on tap and saves it to the account", async () => {
    renderWithIntl(<ThemeSheet onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: /Claro/ }));

    expect(setTheme).toHaveBeenCalledWith("light");
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ theme: "light" }),
    );
  });

  it("goes back to the account theme when saving fails", async () => {
    updateMe.mockRejectedValue(new Error("offline"));
    renderWithIntl(<ThemeSheet onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: /Oscuro/ }));

    await waitFor(() => expect(setTheme).toHaveBeenLastCalledWith("system"));
  });

  it("ignores a tap on the current theme", () => {
    renderWithIntl(<ThemeSheet onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: /Sistema/ }));
    expect(setTheme).not.toHaveBeenCalled();
    expect(updateMe).not.toHaveBeenCalled();
  });

  it("closes from the X button", () => {
    const onClose = vi.fn();
    renderWithIntl(<ThemeSheet onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
