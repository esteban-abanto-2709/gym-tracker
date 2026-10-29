import { describe, it, expect } from "vitest";
import { phoneLocale } from "./locale";

describe("phoneLocale", () => {
  it("uses the phone language when it is Spanish or English", () => {
    expect(phoneLocale("es-PE,es;q=0.9,en;q=0.8")).toBe("es");
    expect(phoneLocale("en-US,en;q=0.9")).toBe("en");
  });

  it("skips languages the app does not have and respects the order", () => {
    expect(phoneLocale("pt-BR,pt;q=0.9,es;q=0.8,en;q=0.7")).toBe("es");
    expect(phoneLocale("en;q=0.5,es;q=0.9")).toBe("es");
  });

  it("falls back to English for anything else or nothing", () => {
    expect(phoneLocale("fr-FR,de;q=0.9")).toBe("en");
    expect(phoneLocale("es;q=0")).toBe("en");
    expect(phoneLocale("")).toBe("en");
    expect(phoneLocale(null)).toBe("en");
  });
});
