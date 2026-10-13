import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { NEWS } from "@/lib/news";
import { NewsButton } from "./NewsButton";

const updateMe = vi.fn().mockResolvedValue(undefined);
let user: { newsOpened: string[]; newsSeen: string[] };

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user, updateMe }),
}));

const allIds = NEWS.map((n) => n.id);
const cardTitles = () =>
  screen
    .getAllByRole("button", { expanded: false })
    .map((b) => b.textContent ?? "");

describe("NewsButton", () => {
  beforeEach(() => {
    updateMe.mockClear();
    user = { newsOpened: [], newsSeen: [] };
  });

  it("shows the dot to a new user and clears it on open", () => {
    render(<NewsButton />);
    fireEvent.click(screen.getByLabelText("Novedades, hay algo nuevo"));

    expect(updateMe).toHaveBeenCalledWith({ newsOpened: allIds });
    expect(screen.queryByLabelText("Novedades, hay algo nuevo")).toBeNull();
    expect(screen.getAllByText("Nuevo")).toHaveLength(NEWS.length);
  });

  it("keeps ids already opened, so a card removed and restored stays quiet", () => {
    user = { newsOpened: ["removed-card"], newsSeen: [] };
    render(<NewsButton />);
    fireEvent.click(screen.getByLabelText("Novedades, hay algo nuevo"));

    expect(updateMe).toHaveBeenCalledWith({
      newsOpened: ["removed-card", ...allIds],
    });
  });

  it("has no dot and saves nothing when everything was opened", () => {
    user = { newsOpened: allIds, newsSeen: [] };
    render(<NewsButton />);
    fireEvent.click(screen.getByRole("button", { name: "Novedades" }));

    expect(updateMe).not.toHaveBeenCalled();
  });

  it("lists unseen news first and seen ones under 'Ya vistas'", () => {
    const [first, second] = NEWS;
    user = { newsOpened: allIds, newsSeen: [first.id] };
    render(<NewsButton />);
    fireEvent.click(screen.getByRole("button", { name: "Novedades" }));

    const titles = cardTitles();
    expect(titles[0]).toContain(second.title);
    expect(titles.at(-1)).toContain(first.title);
    expect(screen.getByText("Ya vistas")).toBeTruthy();
  });

  it("marks a card seen when expanded and links 'Ir' to its screen", () => {
    const item = NEWS.find((n) => n.href)!;
    user = { newsOpened: allIds, newsSeen: ["other"] };
    render(<NewsButton />);
    fireEvent.click(screen.getByRole("button", { name: "Novedades" }));

    const card = screen.getByText(item.title).closest("button")!;
    fireEvent.click(card);

    expect(updateMe).toHaveBeenCalledWith({ newsSeen: ["other", item.id] });
    expect(card.getAttribute("aria-expanded")).toBe("true");
    const go = within(card.parentElement!).getByRole("link");
    expect(go.getAttribute("href")).toBe(item.href);
  });

  it("does not offer 'Ir' for news without a screen", () => {
    const item = NEWS.find((n) => !n.href)!;
    render(<NewsButton />);
    fireEvent.click(screen.getByLabelText("Novedades, hay algo nuevo"));

    const card = screen.getByText(item.title).closest("button")!;
    fireEvent.click(card);
    expect(within(card.parentElement!).queryByRole("link")).toBeNull();
  });
});
