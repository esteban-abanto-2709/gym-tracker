import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PublicationDetail } from "./PublicationDetail";
import { api } from "@/lib/api";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const routine = (position: number, name: string) => ({
  id: `pr-${position}`,
  name,
  position,
  items: [
    {
      id: `i-${position}`,
      exerciseId: "e-1",
      exercise: { id: "e-1", name: "Sentadilla" },
      position: 0,
      blocks: [],
    },
  ],
});

const program = {
  id: "p-1",
  kind: "PROGRAM",
  slug: "upper-lower",
  name: "Upper/Lower",
  description: "Cuatro días",
  publishedAt: "2026-10-20T00:00:00Z",
  author: { username: "miguel", slug: "miguel" },
  likeCount: 2,
  copyCount: 1,
  likedByMe: false,
  isMine: false,
  routines: [routine(0, "Upper A"), routine(1, "Lower A")],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.get).mockResolvedValue(program);
});

describe("PublicationDetail", () => {
  it("muestra el programa publicado con su autor y contadores", async () => {
    render(<PublicationDetail kind="PROGRAM" slug="upper-lower" />);

    expect(await screen.findByText("Upper/Lower")).toBeTruthy();
    expect(screen.getByText("miguel")).toBeTruthy();
    expect(screen.getByText("Cuatro días")).toBeTruthy();
    expect(screen.getByText("2 me gusta")).toBeTruthy();
    expect(screen.getByText("1 copia")).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/explore/programs/upper-lower");
  });

  it("copia el programa entero y va a Hoy si quedó activo", async () => {
    vi.mocked(api.post).mockResolvedValue({ program: {}, activated: true });
    render(<PublicationDetail kind="PROGRAM" slug="upper-lower" />);
    await screen.findByText("Upper/Lower");

    fireEvent.click(screen.getByRole("button", { name: "Copiar programa" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(api.post).toHaveBeenCalledWith(
      "/explore/programs/upper-lower/copy",
      {},
    );
  });

  it("copia solo una rutina del programa", async () => {
    vi.mocked(api.post).mockResolvedValue({ routine: {} });
    render(<PublicationDetail kind="PROGRAM" slug="upper-lower" />);
    await screen.findByText("Upper/Lower");

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar solo Lower A" }),
    );

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/routines"));
    expect(api.post).toHaveBeenCalledWith(
      "/explore/programs/upper-lower/copy",
      { routinePosition: 1 },
    );
  });

  it("avisa si la publicación ya no existe", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Not found"));
    render(<PublicationDetail kind="ROUTINE" slug="borrada" />);

    expect(
      await screen.findByText("Esta publicación ya no está disponible."),
    ).toBeTruthy();
  });
});
