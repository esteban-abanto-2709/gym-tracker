import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineEditor } from "./RoutineEditor";
import { api } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api", () => ({ api: { get: vi.fn() } }));

vi.mock("@/hooks/useExercises", () => ({
  useExercises: () => ({
    exercises: [],
    loadingExercises: false,
    search: "",
    setSearch: vi.fn(),
    filteredExercises: [],
    createExercise: vi.fn(),
    creatingExercise: false,
  }),
}));

const torso = { id: "r-torso", name: "Torso A", items: [] };

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url: string) =>
    url === "/routines" ? [torso] : torso,
  );
});

const nameInput = () => screen.getByLabelText("Nombre de la rutina");
const warning = "Ya tienes una rutina con ese nombre.";

describe("RoutineEditor", () => {
  it("avisa si el nombre ya es de otra rutina tuya", async () => {
    render(<RoutineEditor />);
    await screen.findByLabelText("Nombre de la rutina");

    fireEvent.change(nameInput(), { target: { value: "Torso A " } });

    expect(await screen.findByText(warning)).toBeTruthy();
  });

  it("no avisa al editar una rutina que conserva su nombre", async () => {
    render(<RoutineEditor routineId="r-torso" />);

    expect(await screen.findByDisplayValue("Torso A")).toBeTruthy();
    expect(screen.queryByText(warning)).toBeNull();
  });
});
