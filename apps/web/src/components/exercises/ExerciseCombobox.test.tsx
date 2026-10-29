import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { ExerciseCombobox } from "./ExerciseCombobox";
import type { Exercise } from "@/lib/types";

const exercises = [
  { id: "1", name: "Squat", slug: "squat", createdById: null },
  { id: "2", name: "Wall Sit", slug: "wall-sit", createdById: "u1" },
] as Exercise[];

describe("ExerciseCombobox", () => {
  it("marks only user-created exercises as not official", () => {
    renderWithIntl(
      <ExerciseCombobox
        exercises={exercises}
        loadingExercises={false}
        selectedExercise={null}
        search=""
        onSearchChange={vi.fn()}
        onSelect={vi.fn()}
        onClearSelection={vi.fn()}
        onCreateClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("textbox"));

    const labels = screen.getAllByText("No oficial");
    expect(labels).toHaveLength(1);
    expect(labels[0].closest("button")?.textContent).toContain("Wall Sit");
  });
});
