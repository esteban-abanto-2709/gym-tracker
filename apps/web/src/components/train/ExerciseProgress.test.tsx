import { beforeEach, describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import type { ExerciseProgress as Progress } from "@/lib/types";
import { ExerciseProgress } from "./ExerciseProgress";
import { addPendingSets } from "@/lib/pendingSets";

const get = vi.fn();
const post = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (url: string) => get(url),
    post: (url: string, body: unknown) => post(url, body),
  },
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
    post.mockReset();
  });

  it("sends the pending set before asking for the streak", async () => {
    addPendingSets([
      {
        clientId: "c-1",
        label: "ex",
        body: {
          exerciseId: "ex",
          routineId: "r",
          sessionId: "s-1",
          performedAt: "2026-10-24T10:00:00.000Z",
          timeZone: "America/Lima",
          reps: 8,
          weight: 50,
          durationSec: null,
          equipmentId: null,
          setType: "WORKING",
          step: null,
        },
      },
    ]);
    const order: string[] = [];
    post.mockImplementationOnce(async () => {
      order.push("post");
    });
    get.mockImplementationOnce(async () => {
      order.push("get");
      return progress(1);
    });

    renderWithIntl(
      <ExerciseProgress exerciseId="ex" routineId="r" setsDone={1} />,
    );

    expect(await screen.findByText("1")).toBeTruthy();
    expect(order).toEqual(["post", "get"]);
  });

  it("asks for the streak again after each set on the same exercise", async () => {
    get.mockResolvedValueOnce(progress(2)).mockResolvedValueOnce(progress(0));
    const { rerender } = renderWithIntl(
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
    const { rerender } = renderWithIntl(
      <ExerciseProgress exerciseId="ex" routineId="r" setsDone={0} />,
    );
    expect(await screen.findByText("2")).toBeTruthy();

    rerender(<ExerciseProgress exerciseId="ex" routineId="r" setsDone={1} />);

    expect(screen.getByText("2")).toBeTruthy();
  });
});
