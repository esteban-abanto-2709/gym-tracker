import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRestSeconds } from "./useRestSeconds";

const T0 = new Date("2026-10-09T10:00:00Z");

describe("useRestSeconds", () => {
  afterEach(() => vi.useRealTimers());

  it("cuenta desde la ultima serie y sigue subiendo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(T0.getTime() + 102_000));

    const { result } = renderHook(() => useRestSeconds(T0.toISOString()));
    expect(result.current).toBe(102);

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current).toBe(105);
  });

  it("sin serie previa o pasada la media hora no muestra nada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(T0.getTime() + 31 * 60_000));

    expect(renderHook(() => useRestSeconds(undefined)).result.current).toBeNull();
    expect(renderHook(() => useRestSeconds(T0.toISOString())).result.current).toBeNull();
  });
});
