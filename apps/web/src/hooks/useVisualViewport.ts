import { useCallback, useMemo, useSyncExternalStore } from "react";

interface VisualViewportState {
  height: number;
  offsetTop: number;
}

const readViewport = () => {
  const vv = window.visualViewport;
  return vv ? `${vv.height}|${vv.offsetTop}` : null;
};

const noViewport = () => null;

export function useVisualViewport(active: boolean): VisualViewportState | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const vv = window.visualViewport;
      if (!active || !vv) return () => {};
      vv.addEventListener("resize", onChange);
      vv.addEventListener("scroll", onChange);
      return () => {
        vv.removeEventListener("resize", onChange);
        vv.removeEventListener("scroll", onChange);
      };
    },
    [active],
  );

  const raw = useSyncExternalStore(
    subscribe,
    active ? readViewport : noViewport,
    noViewport,
  );

  return useMemo(() => {
    if (!raw) return null;
    const [height, offsetTop] = raw.split("|").map(Number);
    return { height, offsetTop };
  }, [raw]);
}
