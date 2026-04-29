// Tiny stroke-based icon set — enough for the prototype. Stroke="currentColor".
import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "wand"
  | "users"
  | "book"
  | "grid"
  | "play"
  | "eye"
  | "download"
  | "settings"
  | "plus"
  | "edit"
  | "refresh"
  | "check"
  | "trash"
  | "duplicate"
  | "warning"
  | "lock"
  | "unlock"
  | "image"
  | "sparkles"
  | "pause"
  | "arrow-right"
  | "chevron-right"
  | "chevron-left"
  | "search"
  | "upload"
  | "info"
  | "x";

const paths: Record<IconName, string> = {
  home: "M3 11.5 12 4l9 7.5M5 10v10h14V10",
  wand:
    "M4 20l9-9M14 5l1.5 1.5M18 5l-1 1M19 9l1.5 1.5M16 8l4 4M4 20l3-1 1-3-3 1z",
  users:
    "M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 2-5 6-5s6 2 6 5M14 20c0-3 2-5 6-5s2 2 2 5",
  book: "M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 003 3",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  play: "M7 4l13 8L7 20V4z",
  eye:
    "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z",
  download: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16",
  settings:
    "M12 8a4 4 0 100 8 4 4 0 000-8zM19 13l2 1-2 3-2-1M7 13l-2 1 2 3 2-1M11 5h2l1 2-1 2h-2l-1-2zM11 17h2l1 2-1 2h-2l-1-2z",
  plus: "M12 5v14M5 12h14",
  edit: "M5 19l3-1 11-11-2-2L6 16l-1 3z",
  refresh: "M21 12a9 9 0 11-3-6.7M21 4v5h-5",
  check: "M5 12l4 4L19 6",
  trash: "M5 7h14M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13",
  duplicate: "M8 8h11v11H8zM4 4h11v3M4 4v11h3",
  warning: "M12 3l10 18H2L12 3zM12 10v5M12 18v.01",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 016 0v3",
  unlock: "M6 11h12v9H6zM9 11V8a3 3 0 014.4-2.6",
  image: "M3 5h18v14H3zM3 17l5-5 4 4 3-3 6 6",
  sparkles: "M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5zM5 4v3M3.5 5.5h3M19 16v3M17.5 17.5h3",
  pause: "M7 5v14M17 5v14",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "chevron-left": "M15 6l-6 6 6 6",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5.2-5.2",
  upload: "M12 20V8m0 0l-4 4m4-4l4 4M4 4h16",
  info: "M12 8v.01M11 12h1v5h1",
  x: "M6 6l12 12M18 6L6 18",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
