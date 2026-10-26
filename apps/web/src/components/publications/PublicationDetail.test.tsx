import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PublicationDetail } from "./PublicationDetail";
import { api } from "@/lib/api";
import type { ExploreDetail } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }));

let auth: { user: { id: string } | null; loading: boolean };

vi.mock("@/lib/auth-context", () => ({ useAuth: () => auth }));

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
} as unknown as ExploreDetail;

beforeEach(() => {
  vi.clearAllMocks();
  auth = { user: { id: "u1" }, loading: false };
});

describe("PublicationDetail", () => {
  it("shows the published program with its author and counters", async () => {
    render(
      <PublicationDetail
        kind="PROGRAM"
        slug="upper-lower"
        publication={program}
      />,
    );

    expect(screen.getByText("Upper/Lower")).toBeTruthy();
    expect(screen.getByText("miguel")).toBeTruthy();
    expect(screen.getByText("Cuatro días")).toBeTruthy();
    expect(screen.getByText("2 me gusta")).toBeTruthy();
    expect(screen.getByText("1 copia")).toBeTruthy();
  });

  it("copies the whole program and goes to Today if it became active", async () => {
    vi.mocked(api.post).mockResolvedValue({ program: {}, activated: true });
    render(
      <PublicationDetail
        kind="PROGRAM"
        slug="upper-lower"
        publication={program}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copiar programa" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(api.post).toHaveBeenCalledWith(
      "/explore/programs/upper-lower/copy",
      {},
    );
  });

  it("copies a single routine of the program", async () => {
    vi.mocked(api.post).mockResolvedValue({ routine: {} });
    render(
      <PublicationDetail
        kind="PROGRAM"
        slug="upper-lower"
        publication={program}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar solo Lower A" }),
    );

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/routines"));
    expect(api.post).toHaveBeenCalledWith(
      "/explore/programs/upper-lower/copy",
      { routinePosition: 1 },
    );
  });

  it("warns when the publication no longer exists", () => {
    render(
      <PublicationDetail kind="ROUTINE" slug="borrada" publication={null} />,
    );

    expect(
      screen.getByText("Esta publicación ya no está disponible."),
    ).toBeTruthy();
  });

  it("invites a guest to sign up and come back instead of copying", () => {
    auth = { user: null, loading: false };
    render(
      <PublicationDetail
        kind="PROGRAM"
        slug="upper-lower"
        publication={program}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Crea tu cuenta" }).getAttribute("href"),
    ).toBe("/register?next=%2Fexplore%2Fprograms%2Fupper-lower");
    expect(
      screen
        .getByRole("link", { name: "Ya tengo cuenta" })
        .getAttribute("href"),
    ).toBe("/login?next=%2Fexplore%2Fprograms%2Fupper-lower");
    expect(
      screen.queryByRole("button", { name: "Copiar programa" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /Copiar solo/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Me gusta" })).toBeNull();
    expect(screen.getByText("2 me gusta")).toBeTruthy();
  });
});
