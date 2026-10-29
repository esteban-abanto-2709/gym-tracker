import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { LanguageSheet } from "./LanguageSheet";

const updateMe = vi.fn().mockResolvedValue(undefined);
let user: { exerciseLocale: "en" | "es"; interfaceLocale: "en" | "es" };

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user, updateMe }),
}));

const select = (name: string) => screen.getByLabelText<HTMLSelectElement>(name);

describe("LanguageSheet", () => {
  beforeEach(() => {
    updateMe.mockClear();
    user = { exerciseLocale: "en", interfaceLocale: "es" };
  });

  it("shows each language as a select with only English and Spanish", () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);

    expect(select("Interfaz").value).toBe("es");
    expect(select("Nombres de ejercicios").value).toBe("en");
    expect([...select("Interfaz").options].map((o) => o.textContent)).toEqual([
      "English",
      "Español",
    ]);
  });

  it("saves the interface language without touching the exercise names", async () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);

    fireEvent.change(select("Interfaz"), { target: { value: "en" } });
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ interfaceLocale: "en" }),
    );
    expect(updateMe).toHaveBeenCalledTimes(1);
  });

  it("saves the exercise language on its own", async () => {
    renderWithIntl(<LanguageSheet onClose={vi.fn()} />);

    fireEvent.change(select("Nombres de ejercicios"), {
      target: { value: "es" },
    });
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ exerciseLocale: "es" }),
    );
  });

  it("closes from the X button", () => {
    const onClose = vi.fn();
    renderWithIntl(<LanguageSheet onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
