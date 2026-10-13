import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageSheet } from "./LanguageSheet";

const updateMe = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { exerciseLocale: "en" }, updateMe }),
}));

describe("LanguageSheet", () => {
  it("offers only English and Spanish, with English selected", () => {
    render(<LanguageSheet onClose={vi.fn()} />);
    const options = screen.getAllByRole("radio");

    expect(options).toHaveLength(2);
    expect(options[0].getAttribute("aria-checked")).toBe("true");
    expect(options[0].textContent).toContain("English");
    expect(options[1].textContent).toContain("Press de banca");
  });

  it("saves Spanish on tap and ignores a tap on the current language", async () => {
    render(<LanguageSheet onClose={vi.fn()} />);
    const [english, spanish] = screen.getAllByRole("radio");

    fireEvent.click(english);
    expect(updateMe).not.toHaveBeenCalled();

    fireEvent.click(spanish);
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ exerciseLocale: "es" }),
    );
  });

  it("closes from the X button", () => {
    const onClose = vi.fn();
    render(<LanguageSheet onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
