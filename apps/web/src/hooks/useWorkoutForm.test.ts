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

const squat: Exercise = { id: "ex-squat", name: "Sentadilla", slug: "sentadilla" };
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

describe("useWorkoutForm: repetir un set", () => {
  it("precarga ejercicio, peso, reps y medida con ?repeat=true", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5", measure: "weight_reps" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    await waitFor(() => expect(result.current.selectedExercise).toEqual(squat));
    expect(result.current.weight).toBe("80");
    expect(result.current.reps).toBe("5");
    expect(result.current.measure).toBe("weight_reps");
  });

  it("repite una serie de tiempo con su medida aunque la API sugiera otra", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({ exerciseId: "ex-curl", weight: "", reps: "1", durationSec: "45", measure: "time" });
    get.mockResolvedValue({ lastMeasure: "weight_reps" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    await waitFor(() => expect(result.current.selectedExercise).toEqual(curl));
    expect(result.current.seconds).toBe("45");
    expect(result.current.measure).toBe("time");
    expect(get).not.toHaveBeenCalled();
  });

  it("espera a que carguen los ejercicios antes de repetir", async () => {
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

  it("repite una sola vez: elegir otro ejercicio despues no vuelve al repetido", async () => {
    searchParams = new URLSearchParams("repeat=true");
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5" });

    const { result, rerender } = renderHook(() => useWorkoutForm(exercises, false));
    await waitFor(() => expect(result.current.selectedExercise).toEqual(squat));

    act(() => result.current.setSelectedExercise(curl));
    rerender();

    expect(result.current.selectedExercise).toEqual(curl);
  });

  it("sin ?repeat=true ignora lo guardado", () => {
    saveRepeat({ exerciseId: "ex-squat", weight: "80", reps: "5" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    expect(result.current.selectedExercise).toBeNull();
    expect(result.current.weight).toBe("");
  });
});

describe("useWorkoutForm: elegir ejercicio", () => {
  it("toma el ultimo equipo usado en ese ejercicio", async () => {
    rememberEquipment({ "ex-squat": "eq-rack" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(squat));

    await waitFor(() => expect(result.current.equipmentId).toBe("eq-rack"));
  });

  it("sin ejercicio no hay equipo", () => {
    const { result } = renderHook(() => useWorkoutForm(exercises, false));

    expect(result.current.equipmentId).toBeNull();
  });

  it("usa la ultima medida que devuelve la API", async () => {
    get.mockResolvedValue({ lastMeasure: "reps" });

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(curl));

    await waitFor(() => expect(result.current.measure).toBe("reps"));
  });

  it("si el usuario ya cambio la medida, la API no la pisa", async () => {
    let resolve!: (value: { lastMeasure: string }) => void;
    get.mockReturnValue(new Promise((r) => (resolve = r)));

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(curl));
    act(() => result.current.changeMeasure("time"));
    await act(async () => resolve({ lastMeasure: "reps" }));

    expect(result.current.measure).toBe("time");
  });

  it("al cambiar de ejercicio vuelve a peso y reps mientras llega la API", async () => {
    get.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useWorkoutForm(exercises, false));
    act(() => result.current.setSelectedExercise(squat));
    act(() => result.current.changeMeasure("time"));
    act(() => result.current.setSelectedExercise(curl));

    expect(result.current.measure).toBe("weight_reps");
  });
});
