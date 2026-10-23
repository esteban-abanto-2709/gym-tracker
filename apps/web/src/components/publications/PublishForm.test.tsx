import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PublishForm } from "./PublishForm";
import { api } from "@/lib/api";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const routine = {
  id: "r-back",
  name: "Espalda Cbum",
  programId: null,
  createdAt: "2026-10-20T00:00:00Z",
  items: [
    {
      id: "i-1",
      exerciseId: "e-row",
      exercise: { id: "e-row", name: "Remo con barra" },
      position: 0,
      blocks: [],
    },
  ],
};

const serve = (taken: string[] = []) =>
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (url.startsWith("/publications/slug-available")) {
      const slug = new URL(url, "http://x").searchParams.get("slug")!;
      return { available: !taken.includes(slug) };
    }
    return routine;
  });

const publishButton = () =>
  screen.getByRole("button", { name: "Publicar" }) as HTMLButtonElement;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PublishForm", () => {
  it("sugiere el slug desde el nombre y publica la rutina", async () => {
    serve();
    vi.mocked(api.post).mockResolvedValue({});
    render(<PublishForm kind="ROUTINE" sourceId="r-back" />);

    expect(await screen.findByText("Remo con barra")).toBeTruthy();
    expect(screen.getByDisplayValue("espalda-cbum")).toBeTruthy();
    expect(await screen.findByText("Disponible")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Descripción (opcional)"), {
      target: { value: "  Para hipertrofia  " },
    });
    fireEvent.click(publishButton());

    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith("/routines/r-back"),
    );
    expect(api.post).toHaveBeenCalledWith("/routines/r-back/publish", {
      slug: "espalda-cbum",
      description: "Para hipertrofia",
    });
  });

  it("avisa si el slug ya está en uso y no deja publicar", async () => {
    serve(["espalda-cbum"]);
    render(<PublishForm kind="ROUTINE" sourceId="r-back" />);

    expect(
      await screen.findByText("Ya está en uso. Prueba otra."),
    ).toBeTruthy();
    expect(publishButton().disabled).toBe(true);
  });

  it("rechaza un slug inválido sin consultar a la API", async () => {
    serve();
    render(<PublishForm kind="ROUTINE" sourceId="r-back" />);
    await screen.findByDisplayValue("espalda-cbum");

    fireEvent.change(screen.getByLabelText("Dirección (URL)"), {
      target: { value: "ab" },
    });

    expect(
      screen.getByText("De 3 a 60 caracteres: minúsculas, números y guiones."),
    ).toBeTruthy();
    expect(publishButton().disabled).toBe(true);
    expect(api.get).not.toHaveBeenCalledWith(
      "/publications/slug-available?kind=ROUTINE&slug=ab",
    );
  });
});
