import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

const deleteAccount = vi.fn();
let hasPassword = true;

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { hasPassword }, deleteAccount }),
}));

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Borrar mi cuenta" }));

describe("DeleteAccountDialog", () => {
  beforeEach(() => {
    deleteAccount.mockReset().mockResolvedValue(undefined);
  });

  it("asks for the password when the account has one", async () => {
    hasPassword = true;
    renderWithIntl(<DeleteAccountDialog open onOpenChange={vi.fn()} />);

    const field = screen.getByLabelText(/contraseña para confirmar/);
    expect(
      (
        screen.getByRole("button", {
          name: "Borrar mi cuenta",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    fireEvent.change(field, { target: { value: "secret-123" } });
    submit();
    await waitFor(() =>
      expect(deleteAccount).toHaveBeenCalledWith({ password: "secret-123" }),
    );
  });

  it("asks a Google-only account for its email", async () => {
    hasPassword = false;
    renderWithIntl(<DeleteAccountDialog open onOpenChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/correo para confirmar/), {
      target: { value: "me@gmail.com" },
    });
    submit();
    await waitFor(() =>
      expect(deleteAccount).toHaveBeenCalledWith({ email: "me@gmail.com" }),
    );
  });

  it("shows the error and lets you try again", async () => {
    hasPassword = true;
    deleteAccount.mockRejectedValueOnce(
      new Error("No coincide. Revisa lo que escribiste."),
    );
    renderWithIntl(<DeleteAccountDialog open onOpenChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/contraseña para confirmar/), {
      target: { value: "wrong" },
    });
    submit();

    expect(await screen.findByText(/No coincide/)).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Borrar mi cuenta",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
});
