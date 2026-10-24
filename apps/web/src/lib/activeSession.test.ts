import { describe, it, expect } from "vitest";
import {
  SESSION_GAP_MS,
  freeSessionId,
  readActiveSession,
  startSession,
} from "./activeSession";
import type { Routine } from "./types";

const MIN = 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const routine: Routine = {
  id: "r-upper",
  name: "Upper A",
  programId: null,
  createdAt: "2026-10-01T00:00:00Z",
  items: [],
};

const saveSession = (fields: Record<string, unknown>) =>
  localStorage.setItem(
    "gymtrack-active-routine",
    JSON.stringify({
      sessionId: "s-guided",
      routineId: "r-upper",
      routineName: "Upper A",
      currentIndex: 0,
      progress: {},
      extras: [],
      skipped: {},
      replacedBy: {},
      ...fields,
    }),
  );

describe("readActiveSession", () => {
  it("keeps a session alive while sets keep coming, even hours after it started", () => {
    saveSession({ startedAt: ago(5 * 60 * MIN), lastSetAt: ago(30 * MIN) });
    expect(readActiveSession()?.sessionId).toBe("s-guided");
  });

  it("closes a session after 3 hours without sets", () => {
    saveSession({
      startedAt: ago(5 * 60 * MIN),
      lastSetAt: ago(SESSION_GAP_MS + MIN),
    });
    expect(readActiveSession()).toBeNull();
  });

  it("a session saved before sessions existed gets an id", () => {
    saveSession({ sessionId: undefined, startedAt: ago(10 * MIN) });
    expect(readActiveSession()?.sessionId).toMatch(/[0-9a-f-]{36}/);
  });

  it("starting a routine opens a new session", () => {
    const a = startSession(routine);
    const b = startSession(routine);
    expect(a.sessionId).not.toBe(b.sessionId);
  });
});

describe("freeSessionId", () => {
  it("free sets in a row share the session", () => {
    expect(freeSessionId()).toBe(freeSessionId());
  });

  it("after 3 hours without sets a free set opens a new session", () => {
    localStorage.setItem(
      "gymtrack-free-session",
      JSON.stringify({ id: "s-old", lastSetAt: ago(SESSION_GAP_MS + MIN) }),
    );
    expect(freeSessionId()).not.toBe("s-old");
  });

  it("joins the routine being trained", () => {
    saveSession({ startedAt: ago(10 * MIN) });
    expect(freeSessionId()).toBe("s-guided");
  });
});
