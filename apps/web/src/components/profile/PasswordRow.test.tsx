import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { PasswordRow } from "./PasswordRow";

const changePassword = vi.fn();
const success = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ changePassword }),
}));
vi.mock("sonner", () => ({ toast: { success: (m: string) => success(m) } }));

const fill = (current: string, next: string) => {
  fireEvent.change(screen.getByLabelText("Contraseña actual"), {
    target: { value: current },
  });
  fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
    target: { value: next },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
};

describe("PasswordRow", () => {
  beforeEach(() => {
    changePassword.mockReset().mockResolvedValue(undefined);
    success.mockReset();
    renderWithIntl(<PasswordRow />);
    fireEvent.click(screen.getByRole("button", { name: /Contraseña/ }));
  });

  it("changes the password and closes", async () => {
    fill("old-password", "new-password");

    await waitFor(() =>
      expect(changePassword).toHaveBeenCalledWith(
        "old-password",
        "new-password",
      ),
    );
    await waitFor(() => expect(success).toHaveBeenCalled());
    expect(screen.queryByLabelText("Contraseña actual")).toBeNull();
  });

  it("asks for at least 8 characters before calling the API", () => {
    fill("old-password", "short");

    expect(screen.getByText(/al menos 8 caracteres/)).toBeTruthy();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("keeps the dialog open with the error when the current one is wrong", async () => {
    changePassword.mockRejectedValueOnce(
      new Error("La contraseña actual no es correcta."),
    );
    fill("wrong", "new-password");

    expect(await screen.findByText(/no es correcta/)).toBeTruthy();
    expect(screen.getByLabelText("Contraseña actual")).toBeTruthy();
  });
});
