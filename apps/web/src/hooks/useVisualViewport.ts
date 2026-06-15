import { useState, useEffect } from "react";

interface VisualViewportState {
  height: number;
  offsetTop: number;
}

export function useVisualViewport(active: boolean): VisualViewportState | null {
  const [state, setState] = useState<VisualViewportState | null>(null);

  useEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      setState(null);
      return;
    }

    const vv = window.visualViewport;

    const update = () => {
      setState({ height: vv.height, offsetTop: vv.offsetTop });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return state;
}
