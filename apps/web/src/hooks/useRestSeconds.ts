import { useEffect, useState } from "react";

export const MAX_REST_SEC = 30 * 60;

export function useRestSeconds(since: string | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!since) return;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [since]);

  if (!since) return null;
  const sec = Math.max(0, Math.floor((now - Date.parse(since)) / 1000));
  return sec > MAX_REST_SEC ? null : sec;
}
