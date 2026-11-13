import { describe, it, expect } from "vitest";
import { setInputComplete, validCount, validWeight } from "./setInput";

describe("setInput", () => {
  it("accepts only positive whole numbers as a count", () => {
    expect(validCount("10")).toBe(true);
    for (const v of ["", "0", "-3", "8.5", "abc"])
      expect(validCount(v)).toBe(false);
  });

  it("accepts zero and positive weights but not empty or negative", () => {
    expect(validWeight("0")).toBe(true);
    expect(validWeight("22.5")).toBe(true);
    for (const v of ["", " ", "-1", "abc"]) expect(validWeight(v)).toBe(false);
  });

  it("checks only the fields its measure uses", () => {
    expect(
      setInputComplete("time", { weight: "", reps: "", seconds: "30" }),
    ).toBe(true);
    expect(
      setInputComplete("reps", { weight: "", reps: "10", seconds: "" }),
    ).toBe(true);
    expect(
      setInputComplete("weight_reps", { weight: "60", reps: "0", seconds: "" }),
    ).toBe(false);
  });
});
