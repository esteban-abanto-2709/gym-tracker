import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useWorkoutForm } from "./useWorkoutForm";
import { api } from "@/lib/api";
import type { Exercise } from "@/lib/types";

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

const get = vi.mocked(api.get);

const squat: Exercise = {
  id: "ex-squat",
  name: "Sentadilla",
  slug: "sentadilla",
};
const curl: Exercise = { id: "ex-curl", name: "Curl", slug: "curl" };
const exercises = [squat, curl];

const saveRepeat = (data: object) =>
  sessionStorage.setItem("gymtrack-last-set", JSON.stringify(data));

const rememberEquipment = (map: Record<string, string>) =>
  localStorage.setItem("gymtrack-equipment-by-exercise", JSON.stringify(map));

beforeEach(() => {
  searchParams = new URLSearchParams();
  get.mockResolvedValue({ lastMeasure: null });
});

describe("useWorkoutForm: repeating a set", () => {
  it("preloads exercise, weight, reps and measure with ?repeat=true", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({
      exerciseId: "ex-squat",
      weight: "80",
      reps: "5",
      measure: "weight_reps",
    });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    await waitFor(() => expect(result.current.selectedExercise).toEqual(squat));
    expect(result.current.weight).toBe("80");
    expect(result.current.reps).toBe("5");
    expect(result.current.measure).toBe("weight_reps");
  });

  it("repeats a timed set with its measure even if the API suggests another", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({
      exerciseId: "ex-curl",
      weight: "",
      reps: "1",
      durationSec: "45",
      measure: "time",
    });
    get.mockResolvedValue({ lastMeasure: "weight_reps" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    await waitFor(() => expect(result.current.selectedExercise).toEqual(curl));
    expect(result.current.seconds).toBe("45");
    expect(result.current.measure).toBe("time");
    expect(get).not.toHaveBeenCalled();
  });

  it("waits for the exercises to load before repeating", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5" });

    const { result, rerender } = renderHook(
      ({ list, loading }) => useWorkoutForm(list, loading),
      { initialProps: { list: [] as Exercise[], loading: true } },
    );
    expect(result.current.selectedExercise).toBeNull();
    expect(result.current.weight).toBe("");

    rerender({ list: exercises, loading: false });

    await waitFor(() => expect(result.current.selectedExercise).toEqual(squat));
    expect(result.current.weight).toBe("80");
  });

  it("repeats only once: picking another exercise later does not go back", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5" });

    const { result, rerender } = renderHook(() =>
      useWorkoutForm(exercises, false),
    );
    await waitFor(() => expect(result.current.selectedExercise).toEqual(squat));

    act(() => result.current.setSelectedExercise(curl));
    rerender();

    expect(result.current.selectedExercise).toEqual(curl);
  });

  it("ignores the stored set without ?repeat=true", () => {
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    expect(result.current.selectedExercise).toBeNull();
    expect(result.current.weight).toBe("");
  });
});

describe("useWorkoutForm: picking an exercise", () => {
  it("takes the last equipment used for that exercise", async () => {
    rememberEquipment({ "ex-squat": "eq-rack" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(squat));

    await waitFor(() => expect(result.current.equipmentId).toBe("eq-rack"));
  });

  it("has no equipment without an exercise", () => {
    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    expect(result.current.equipmentId).toBeNull();
  });

  it("uses the last measure the API returns", async () => {
    get.mockResolvedValue({ lastMeasure: "reps" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(curl));

    await waitFor(() => expect(result.current.measure).toBe("reps"));
  });

  it("the API does not override a measure the user already changed", async () => {
    let resolve!: (value: { lastMeasure: string }) => void;
    get.mockReturnValue(new Promise((r) => (resolve = r)));

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(curl));
    act(() => result.current.changeMeasure("time"));
    await act(async () => resolve({ lastMeasure: "reps" }));

    expect(result.current.measure).toBe("time");
  });

  it("switching exercise goes back to weight and reps while the API responds", async () => {
    get.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(squat));
    act(() => result.current.changeMeasure("time"));
    act(() => result.current.setSelectedExercise(curl));

    expect(result.current.measure).toBe("weight_reps");
  });
});
