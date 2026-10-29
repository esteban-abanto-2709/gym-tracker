import { describe, it, expect } from "vitest";
import en from "./messages/en.json";
import es from "./messages/es.json";

const keys = (messages: object, prefix = ""): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "object"
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("messages", () => {
  it("has the same keys in Spanish and English", () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
});
