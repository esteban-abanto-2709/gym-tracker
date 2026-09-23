import { ImageResponse } from "next/og";

const RED = "#FF3B2F";
const INK = "#0E0E11";

export function renderAppIcon(size: number) {
  const s = size / 180;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
        }}
      >
        <svg
          width={110 * s}
          height={110 * s}
          viewBox="0 0 24 24"
          fill="none"
          stroke={RED}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: 35 * s, top: 22 * s }}
        >
          <path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" />
          <path d="m2.5 21.5 1.4-1.4" />
          <path d="m20.1 3.9 1.4-1.4" />
          <path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" />
          <path d="m9.6 14.4 4.8-4.8" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 30 * s,
            backgroundImage: `repeating-linear-gradient(-45deg, ${RED} 0px, ${RED} ${11 * s}px, transparent ${11 * s}px, transparent ${22 * s}px)`,
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
