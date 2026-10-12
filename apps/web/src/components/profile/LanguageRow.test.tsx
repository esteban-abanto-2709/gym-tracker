import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageRow } from "./LanguageRow";

const updateMe = vi.fn().mockResolvedValue(undefined);
let locale: "es" | "en" | null = null;

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { locale }, updateMe }),
}));

describe("LanguageRow", () => {
  it("shows automatic when no language is saved", () => {
    locale = null;
    render(<LanguageRow />);
    const select = screen.getByLabelText<HTMLSelectElement>(
      "Idioma de los ejercicios",
    );
    expect(select.value).toBe("");
    expect(
      screen.getByText("Automático (según tu celular)", { selector: "p" }),
    ).toBeTruthy();
  });

  it("saves the chosen language, and null to go back to automatic", async () => {
    locale = "es";
    render(<LanguageRow />);
    const select = screen.getByLabelText("Idioma de los ejercicios");

    fireEvent.change(select, { target: { value: "en" } });
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ locale: "en" }),
    );

    fireEvent.change(select, { target: { value: "" } });
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith({ locale: null }),
    );
  });
});
