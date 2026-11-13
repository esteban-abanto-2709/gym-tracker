import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { RejectedSetsDialog } from "./RejectedSetsDialog";
import type { RejectedSet } from "@/lib/pendingSets";

const rejected = (clientId: string, label: string, reason: string) =>
  ({
    clientId,
    label,
    reason,
    status: 400,
    body: {},
  }) as unknown as RejectedSet;

describe("RejectedSetsDialog", () => {
  it("lists each rejected set with its reason", () => {
    renderWithIntl(
      <RejectedSetsDialog
        sets={[
          rejected(
            "a",
            "Press banca · 60 kg × 0 reps",
            "reps must be positive",
          ),
          rejected("b", "Remo · 40 kg × 8 reps", "weight is too large"),
        ]}
        onDiscard={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Press banca · 60 kg × 0 reps")).toBeTruthy();
    expect(screen.getByText("reps must be positive")).toBeTruthy();
    expect(screen.getByText("Remo · 40 kg × 8 reps")).toBeTruthy();
    expect(screen.getByText("weight is too large")).toBeTruthy();
  });

  it("calls onDiscard from the delete button", () => {
    const onDiscard = vi.fn();
    renderWithIntl(
      <RejectedSetsDialog
        sets={[rejected("a", "Remo", "bad")]}
        onDiscard={onDiscard}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /borrar y salir/i }));
    expect(onDiscard).toHaveBeenCalledOnce();
  });

  it("stays closed without rejected sets", () => {
    renderWithIntl(
      <RejectedSetsDialog sets={null} onDiscard={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.queryByText(/no se guard/i)).toBeNull();
  });
});
