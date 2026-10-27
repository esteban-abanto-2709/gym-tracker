import { afterEach, describe, it, expect, vi } from "vitest";
import { api } from "@/lib/api";
import {
  type PendingSet,
  addPendingSets,
  discardPendingSets,
  flushPendingSets,
  readPendingSets,
  setPendingOwner,
} from "@/lib/pendingSets";

vi.mock("@/lib/api", () => ({
  api: { post: vi.fn() },
}));

const pending = (clientId: string): PendingSet => ({
  clientId,
  label: `Press banca · ${clientId}`,
  body: {
    exerciseId: "ex-bench",
    routineId: null,
    sessionId: "s-1",
    performedAt: "2026-10-27T10:00:00.000Z",
    timeZone: "America/Lima",
    reps: 8,
    weight: 60,
    durationSec: null,
    equipmentId: null,
    setType: "WORKING",
    step: null,
  },
});

const deferred = () => {
  let resolve: (v: unknown) => void = () => {};
  let reject: (e: unknown) => void = () => {};
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const queued = () => readPendingSets().map((s) => s.clientId);

const sent = () =>
  vi
    .mocked(api.post)
    .mock.calls.map(([, body]) => (body as { clientId: string }).clientId);

describe("pendingSets", () => {
  it("sends the queue in order with the clientId in the body", async () => {
    vi.mocked(api.post).mockResolvedValue(undefined);
    addPendingSets([pending("a"), pending("b"), pending("c")]);

    expect(await flushPendingSets()).toBe(0);

    expect(sent()).toEqual(["a", "b", "c"]);
    expect(api.post).toHaveBeenCalledWith(
      "/workouts",
      expect.objectContaining({ clientId: "a", exerciseId: "ex-bench" }),
    );
    expect(queued()).toEqual([]);
  });

  it("drops a set only after the API accepts it", async () => {
    const answer = deferred();
    vi.mocked(api.post).mockReturnValueOnce(answer.promise);
    addPendingSets([pending("a")]);

    const flush = flushPendingSets();
    expect(api.post).toHaveBeenCalledOnce();
    expect(queued()).toEqual(["a"]);

    answer.resolve(undefined);
    expect(await flush).toBe(0);
    expect(queued()).toEqual([]);
  });

  it("keeps the failed set and the ones after it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.post)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("offline"));
    addPendingSets([pending("a"), pending("b"), pending("c")]);

    expect(await flushPendingSets()).toBe(2);

    expect(sent()).toEqual(["a", "b"]);
    expect(queued()).toEqual(["b", "c"]);
  });

  it("sends each set once when two flushes run at the same time", async () => {
    vi.mocked(api.post).mockResolvedValue(undefined);
    addPendingSets([pending("a"), pending("b")]);

    const results = await Promise.all([flushPendingSets(), flushPendingSets()]);

    expect(results).toEqual([0, 0]);
    expect(sent()).toEqual(["a", "b"]);
  });

  it("drains again when a flush is requested while one is failing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const answer = deferred();
    vi.mocked(api.post)
      .mockReturnValueOnce(answer.promise)
      .mockResolvedValue(undefined);
    addPendingSets([pending("a")]);

    const first = flushPendingSets();
    addPendingSets([pending("b")]);
    const second = flushPendingSets();
    answer.reject(new Error("offline"));

    expect(await first).toBe(0);
    expect(await second).toBe(0);
    expect(sent()).toEqual(["a", "a", "b"]);
    expect(queued()).toEqual([]);
  });

  it("keeps a set added while another one is in flight", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const answer = deferred();
    vi.mocked(api.post)
      .mockReturnValueOnce(answer.promise)
      .mockRejectedValueOnce(new Error("offline"));
    addPendingSets([pending("a")]);

    const flush = flushPendingSets();
    addPendingSets([pending("b")]);
    answer.resolve(undefined);

    expect(await flush).toBe(1);
    expect(queued()).toEqual(["b"]);
  });

  it("reads an empty queue from corrupt storage", () => {
    localStorage.setItem("gymtrack-pending-sets", "{not json");
    expect(readPendingSets()).toEqual([]);
  });

  it("discards the whole queue", () => {
    addPendingSets([pending("a"), pending("b")]);
    discardPendingSets();
    expect(readPendingSets()).toEqual([]);
    expect(localStorage.getItem("gymtrack-pending-sets")).toBeNull();
  });
});

describe("pendingSets per account", () => {
  afterEach(() => setPendingOwner(null));

  it("keeps one account's sets away from the next account on the device", async () => {
    vi.mocked(api.post).mockResolvedValue(undefined);
    setPendingOwner("u-ana");
    addPendingSets([pending("a")]);

    setPendingOwner(null);
    setPendingOwner("u-ben");
    expect(readPendingSets()).toEqual([]);
    expect(await flushPendingSets()).toBe(0);
    expect(api.post).not.toHaveBeenCalled();

    setPendingOwner("u-ana");
    expect(queued()).toEqual(["a"]);
    expect(await flushPendingSets()).toBe(0);
    expect(sent()).toEqual(["a"]);
  });

  it("gives a queue saved before accounts to the first one that signs in", () => {
    addPendingSets([pending("a")]);

    setPendingOwner("u-ana");
    expect(queued()).toEqual(["a"]);
    expect(localStorage.getItem("gymtrack-pending-sets")).toBeNull();

    setPendingOwner("u-ben");
    expect(readPendingSets()).toEqual([]);
  });

  it("discards only the signed-in account's sets", () => {
    setPendingOwner("u-ana");
    addPendingSets([pending("a")]);
    setPendingOwner("u-ben");
    addPendingSets([pending("b")]);

    discardPendingSets();
    setPendingOwner("u-ana");
    expect(queued()).toEqual(["a"]);
  });
});
