import { describe, it, expect } from "vitest";
import {
  ageOn,
  formatMeasurement,
  formatShortDate,
  latestByField,
} from "./measurements";

const m = (date: string, values: object) => ({
  date,
  weightKg: null,
  bodyFatPct: null,
  heightCm: null,
  ...values,
});

describe("measurements", () => {
  it("age goes up on the birthday, not before", () => {
    expect(ageOn("1997-10-09", "2026-10-08")).toBe(28);
    expect(ageOn("1997-10-09", "2026-10-09")).toBe(29);
  });

  it("the latest value of each field comes from the newest measurement that has it", () => {
    const latest = latestByField([
      m("2026-10-08", { weightKg: 77.9 }),
      m("2026-09-29", { weightKg: 78.4, bodyFatPct: 19 }),
      m("2026-09-15", { heightCm: 172 }),
    ]);
    expect(latest).toEqual({
      weightKg: { value: 77.9, date: "2026-10-08" },
      bodyFatPct: { value: 19, date: "2026-09-29" },
      heightCm: { value: 172, date: "2026-09-15" },
    });
  });

  it("shows only the recorded fields and the year only when it is not the current one", () => {
    expect(
      formatMeasurement(m("2026-10-08", { weightKg: 77.9, heightCm: 172 })),
    ).toBe("172 cm · 77.9 kg");
    expect(formatShortDate("2026-10-08", "2026-10-09")).toBe("8 oct");
    expect(formatShortDate("2025-10-08", "2026-10-09")).toBe("8 oct 2025");
  });
});
