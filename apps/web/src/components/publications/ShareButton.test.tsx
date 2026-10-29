import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithIntl } from "@/i18n/testing";
import { toast } from "sonner";
import { ShareButton } from "./ShareButton";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

const path = "/explore/programs/upper-lower";
const url = `${window.location.origin}${path}`;

afterEach(() => {
  vi.clearAllMocks();
  Reflect.deleteProperty(navigator, "share");
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("ShareButton", () => {
  it("opens the phone share sheet with the link", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });
    renderWithIntl(<ShareButton title="Upper/Lower" path={path} />);

    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    await vi.waitFor(() =>
      expect(share).toHaveBeenCalledWith({ title: "Upper/Lower", url }),
    );
  });

  it("copies the link without a share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    renderWithIntl(<ShareButton title="Upper/Lower" path={path} />);

    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Link copiado"),
    );
    expect(writeText).toHaveBeenCalledWith(url);
  });

  it("shows the link when the browser cannot copy", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    renderWithIntl(<ShareButton title="Upper/Lower" path={path} />);

    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    await vi.waitFor(() =>
      expect(toast).toHaveBeenCalledWith("Copia este link", {
        description: url,
        duration: 10000,
      }),
    );
  });
});
