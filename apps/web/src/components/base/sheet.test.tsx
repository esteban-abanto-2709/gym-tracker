import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { BottomSheet, SheetHeader } from "./sheet";

function renderSheet(onClose = vi.fn()) {
  renderWithIntl(
    <>
      <button type="button">Detrás</button>
      <BottomSheet label="Tema" onClose={onClose}>
        <SheetHeader kicker="// preferencias" title="Tema" onClose={onClose} />
        <button type="button">Claro</button>
      </BottomSheet>
    </>,
  );
  return onClose;
}

describe("BottomSheet", () => {
  it("is a named dialog that takes the focus when it opens", () => {
    renderSheet();

    const dialog = screen.getByRole("dialog", { name: "Tema" });
    expect(document.activeElement).toBe(dialog);
  });

  it("closes with Escape", () => {
    const onClose = renderSheet();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes with its X button", () => {
    const onClose = renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the page behind it from assistive technology", () => {
    renderSheet();

    expect(screen.queryByRole("button", { name: "Detrás" })).toBeNull();
    expect(screen.getByRole("button", { name: "Claro" })).toBeTruthy();
  });
});
