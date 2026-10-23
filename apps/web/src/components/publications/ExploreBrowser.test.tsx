import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ExploreBrowser } from "./ExploreBrowser";
import { api } from "@/lib/api";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), delete: vi.fn() } }));

const item = (overrides: object) => ({
  id: "p-1",
  kind: "PROGRAM",
  slug: "upper-lower",
  name: "Upper/Lower",
  description: null,
  publishedAt: "2026-10-20T00:00:00Z",
  author: { username: "miguel", slug: "miguel" },
  likeCount: 7,
  copyCount: 3,
  likedByMe: false,
  isMine: false,
  routines: [
    { name: "Upper A", exerciseCount: 5 },
    { name: "Lower A", exerciseCount: 4 },
  ],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.get).mockImplementation(async (url: string) =>
    url.startsWith("/explore/programs")
      ? [item({})]
      : [
          item({
            id: "r-1",
            kind: "ROUTINE",
            slug: "espalda-cbum",
            name: "Espalda Cbum",
            isMine: true,
            routines: [{ name: "Espalda Cbum", exerciseCount: 1 }],
          }),
        ],
  );
});

describe("ExploreBrowser", () => {
  it("lista programas con autor, rutinas y contadores", async () => {
    render(<ExploreBrowser initialTab="programs" />);

    const card = (await screen.findByText("Upper/Lower")).closest("a")!;
    expect(card.getAttribute("href")).toBe("/explore/programs/upper-lower");
    expect(card.textContent).toContain("miguel");
    expect(card.textContent).toContain("2 rutinas");
    expect(card.textContent).toContain("Upper A → Lower A");
    expect(screen.getByLabelText("me gusta").textContent).toBe("7");
    expect(screen.getByLabelText("copias").textContent).toBe("3");
    expect(api.get).toHaveBeenCalledWith("/explore/programs?sort=likes");
  });

  it("cambia a rutinas y marca las tuyas", async () => {
    render(<ExploreBrowser initialTab="programs" />);
    await screen.findByText("Upper/Lower");

    fireEvent.click(screen.getByRole("tab", { name: "Rutinas" }));

    const card = (await screen.findByText("Espalda Cbum")).closest("a")!;
    expect(card.getAttribute("href")).toBe("/explore/routines/espalda-cbum");
    expect(card.textContent).toContain("1 ejercicio");
    expect(card.textContent).toContain("Tuya");
    expect(replace).toHaveBeenCalledWith("/explore?tab=routines", {
      scroll: false,
    });
  });

  it("pide el orden elegido", async () => {
    render(<ExploreBrowser initialTab="programs" />);
    await screen.findByText("Upper/Lower");

    fireEvent.click(screen.getByRole("button", { name: "Más copiados" }));

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/explore/programs?sort=copies"),
    );
  });

  it("la pestaña Mías trae tus publicaciones sin el orden", async () => {
    render(<ExploreBrowser initialTab="mine" />);

    expect(await screen.findByText("Espalda Cbum")).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/publications/mine");
    expect(screen.queryByRole("button", { name: "Populares" })).toBeNull();
  });

  it("sin publicaciones propias no muestra la pestaña Mías", async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) =>
      url === "/publications/mine" ? [] : [item({})],
    );
    render(<ExploreBrowser initialTab="mine" />);

    expect(await screen.findByText("Upper/Lower")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Mías" })).toBeNull();
    expect(
      screen
        .getByRole("tab", { name: "Programas" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("al eliminar tu última publicación vuelve a Programas sin la pestaña Mías", async () => {
    vi.mocked(api.delete).mockResolvedValue({ id: "r-1" });
    render(<ExploreBrowser initialTab="mine" />);
    await screen.findByText("Espalda Cbum");

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar Espalda Cbum" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Eliminar publicación" }),
    );

    expect(await screen.findByText("Upper/Lower")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Mías" })).toBeNull();
    expect(replace).toHaveBeenLastCalledWith("/explore?tab=programs", {
      scroll: false,
    });
  });
});
