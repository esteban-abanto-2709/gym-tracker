import { describe, it, expect } from "vitest";
import { isValidSlug, slugify } from "./slug";

describe("slugify", () => {
  it("convierte un nombre en un slug sin tildes ni espacios", () => {
    expect(slugify("  Espalda de Cbum Ñandú ")).toBe("espalda-de-cbum-nandu");
    expect(slugify("Upper/Lower (V2)")).toBe("upper-lower-v2");
  });

  it("corta a 60 caracteres sin dejar un guion al final", () => {
    const slug = slugify(`${"a".repeat(59)} b`);
    expect(slug).toBe("a".repeat(59));
  });
});

describe("isValidSlug", () => {
  it("acepta minúsculas, números y guiones simples", () => {
    expect(isValidSlug("torso-a-2")).toBe(true);
  });

  it.each(["ab", "Bad", "doble--guion", "-borde", "new", "a".repeat(61)])(
    "rechaza %s",
    (slug) => {
      expect(isValidSlug(slug)).toBe(false);
    },
  );
});
