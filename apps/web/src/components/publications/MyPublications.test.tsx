import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MyPublications } from "./MyPublications";
import { api } from "@/lib/api";
import type { ExploreListItem } from "@/lib/types";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({
  api: { patch: vi.fn(), delete: vi.fn() },
}));

const mine: ExploreListItem = {
  id: "pub-1",
  kind: "ROUTINE",
  slug: "espalda-cbum",
  name: "Espalda Cbum",
  description: null,
  publishedAt: "2026-10-20T00:00:00Z",
  author: { username: "esteban", slug: "esteban" },
  likeCount: 12,
  copyCount: 3,
  likedByMe: false,
  isMine: true,
  routines: [{ name: "Espalda Cbum", exerciseCount: 6 }],
};

const onChange = vi.fn();

function Harness() {
  const [items, setItems] = useState([mine]);
  return (
    <MyPublications
      items={items}
      onChange={(next) => {
        onChange(next);
        setItems(next);
      }}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyPublications", () => {
  it("muestra tus publicaciones con su tipo y contadores", async () => {
    render(<Harness />);

    const card = (await screen.findByText("Espalda Cbum")).closest("a")!;
    expect(card.textContent).toContain("Rutina · 6 ejercicios");
    expect(screen.getByLabelText("me gusta").textContent).toBe("12");
    expect(screen.getByLabelText("copias").textContent).toBe("3");
  });

  it("avisa lo que se pierde y elimina la publicación", async () => {
    vi.mocked(api.delete).mockResolvedValue({ id: "pub-1" });
    render(<Harness />);
    await screen.findByText("Espalda Cbum");

    fireEvent.click(screen.getByRole("button", { name: "Eliminar Espalda Cbum" }));

    expect(await screen.findByText("Pierdes 12 me gusta.")).toBeTruthy();
    expect(
      screen.getByText("3 personas la copiaron: sus copias se quedan."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar publicación" }));

    await vi.waitFor(() =>
      expect(screen.queryByText("Espalda Cbum")).toBeNull(),
    );
    expect(api.delete).toHaveBeenCalledWith("/publications/pub-1");
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("renombra sin tocar el slug", async () => {
    vi.mocked(api.patch).mockResolvedValue({
      id: "pub-1",
      name: "Espalda Cbum V2",
    });
    render(<Harness />);
    await screen.findByText("Espalda Cbum");

    fireEvent.click(screen.getByRole("button", { name: "Renombrar Espalda Cbum" }));
    fireEvent.change(await screen.findByLabelText("Nombre"), {
      target: { value: "  Espalda Cbum V2 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    const card = (await screen.findByText("Espalda Cbum V2")).closest("a")!;
    expect(card.getAttribute("href")).toBe("/explore/routines/espalda-cbum");
    expect(api.patch).toHaveBeenCalledWith("/publications/pub-1", {
      name: "Espalda Cbum V2",
    });
  });
});
