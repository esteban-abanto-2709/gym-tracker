import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { LanguageSheet } from "./LanguageSheet";

const updateMe = vi.fn().mockResolvedValue(undefined);
let user: { exerciseLocale: "en" | "es"; interfaceLocale: "en" | "es" | null };

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user, updateMe }),
}));

const group = (name: string) =>
  within(screen.getByRole("radiogroup", { name }));

describe("LanguageSheet", () => {
  beforeEach(() => {
    updateMe.mockClear();
    user = { exerciseLocale: "en", interfaceLocale: null };
  });

  it("offers English and Spanish for exercise names, with English selected", () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);
    const options = group("Nombres de ejercicios").getAllByRole("radio");

    expect(options).toHaveLength(2);
    expect(options[0].getAttribute("aria-checked")).toBe("true");
    expect(options[0].textContent).toContain("English");
    expect(options[1].textContent).toContain("Press de banca");
  });

  it("saves Spanish exercise names on tap and ignores a tap on the current one", async () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);
    const [english, spanish] = group("Nombres de ejercicios").getAllByRole(
      "radio",
    );

    fireEvent.click(english);
    expect(updateMe).not.toHaveBeenCalled();

    fireEvent.click(spanish);
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ exerciseLocale: "es" }),
    );
  });

  it("follows the phone for the interface until one is chosen, apart from the exercises", async () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);
    const [phone, english, spanish] = group("Interfaz").getAllByRole("radio");

    expect(phone.getAttribute("aria-checked")).toBe("true");
    expect(english.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(spanish);
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ interfaceLocale: "es" }),
    );
    expect(updateMe).not.toHaveBeenCalledWith(
      expect.objectContaining({ exerciseLocale: expect.anything() }),
    );
  });

  it("goes back to the phone language by saving no interface language", async () => {
    user = { exerciseLocale: "en", interfaceLocale: "en" };
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);

    fireEvent.click(group("Interfaz").getByRole("radio", { name: /Teléfono/ }));
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ interfaceLocale: null }),
    );
  });

  it("closes from the X button", () => {
    const onClose = vi.fn();
    renderWithIntl(<LanguageSheet onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
