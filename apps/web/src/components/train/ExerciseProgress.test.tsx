import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ExerciseProgress as Progress } from "@/lib/types";
import { ExerciseProgress } from "./ExerciseProgress";

const get = vi.fn();

vi.mock("@/lib/api", () => ({
  api: { get: (url: string) => get(url) },
}));

const progress = (streak: number): Progress => ({
  target: { sets: 3, reps: 8, repsMax: 10 },
  streak,
  suggestion: streak > 0 ? "up" : null,
  sessions: [
    {
      date: "2026-10-15",
      free: false,
      equipmentId: null,
      equipment: null,
      sets: [{ weight: 50, reps: 10, durationSec: null }],
    },
  ],
});

describe("ExerciseProgress", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("asks for the streak again after each set on the same exercise", async () => {
    get.mockResolvedValueOnce(progress(2)).mockResolvedValueOnce(progress(0));
    const { rerender } = render(
      <ExerciseProgress exerciseId="ex" routineId="r" setsDone={0} />,
    );
    expect(await screen.findByText("2")).toBeTruthy();

    rerender(<ExerciseProgress exerciseId="ex" routineId="r" setsDone={1} />);

    expect(await screen.findByText("0")).toBeTruthy();
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("keeps the last streak on screen while the new one loads", async () => {
    get
      .mockResolvedValueOnce(progress(2))
      .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(
      <ExerciseProgress exerciseId="ex" routineId="r" setsDone={0} />,
    );
    expect(await screen.findByText("2")).toBeTruthy();

    rerender(<ExerciseProgress exerciseId="ex" routineId="r" setsDone={1} />);

    expect(screen.getByText("2")).toBeTruthy();
  });
});
