import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LikeButton } from "./LikeButton";
import { api } from "@/lib/api";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/api", () => ({ api: { put: vi.fn(), delete: vi.fn() } }));

const props = {
  kind: "ROUTINE" as const,
  slug: "espalda-cbum",
  likeCount: 4,
  likedByMe: false,
  isMine: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LikeButton", () => {
  it("adds instantly and keeps what the server says", async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(api.put).mockReturnValue(new Promise((r) => (resolve = r)));
    render(<LikeButton {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Me gusta" }));

    expect(screen.getByText("5 me gusta")).toBeTruthy();
    expect(api.put).toHaveBeenCalledWith("/explore/routines/espalda-cbum/like");

    resolve({ likeCount: 9, likedByMe: true });
    expect(await screen.findByText("9 me gusta")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Quitar me gusta" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("removes the like", async () => {
    vi.mocked(api.delete).mockResolvedValue({ likeCount: 3, likedByMe: false });
    render(<LikeButton {...props} likedByMe />);

    fireEvent.click(screen.getByRole("button", { name: "Quitar me gusta" }));

    expect(await screen.findByText("3 me gusta")).toBeTruthy();
    expect(api.delete).toHaveBeenCalledWith(
      "/explore/routines/espalda-cbum/like",
    );
  });

  it("reverts when the network fails", async () => {
    vi.mocked(api.put).mockRejectedValue(new Error("offline"));
    render(<LikeButton {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Me gusta" }));

    expect(
      await screen.findByRole("button", { name: "Me gusta" }),
    ).toBeTruthy();
    expect(screen.getByText("4 me gusta")).toBeTruthy();
  });

  it("shows only the count on your own publication", () => {
    render(<LikeButton {...props} isMine />);

    expect(screen.getByText("4 me gusta")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
