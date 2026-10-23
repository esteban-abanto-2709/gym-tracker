import { describe, it, expect } from "vitest";
import { isValidSlug, slugify } from "./slug";

describe("slugify", () => {
  it("turns a name into a slug without accents or spaces", () => {
    expect(slugify("  Espalda de Cbum Ñandú ")).toBe("espalda-de-cbum-nandu");
    expect(slugify("Upper/Lower (V2)")).toBe("upper-lower-v2");
  });

  it("cuts at 60 characters without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(59)} b`);
    expect(slug).toBe("a".repeat(59));
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase letters, numbers and single dashes", () => {
    expect(isValidSlug("torso-a-2")).toBe(true);
  });

  it.each(["ab", "Bad", "double--dash", "-edge", "new", "a".repeat(61)])(
    "rejects %s",
    (slug) => {
      expect(isValidSlug(slug)).toBe(false);
    },
  );
});
