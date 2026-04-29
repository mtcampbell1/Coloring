import { useStore } from "../lib/store";
import type { SectionKey } from "../lib/types";
import { Icon } from "./ui/icon";
import { cx } from "./ui/primitives";

interface NavItem {
  key: SectionKey;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  subtle?: string;
}

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "wizard", label: "New Book Wizard", icon: "wand" },
  { key: "characters", label: "Characters", icon: "users" },
  { key: "story", label: "Story", icon: "book" },
  { key: "planner", label: "Page Planner", icon: "grid" },
  { key: "generate", label: "Generate", icon: "play" },
  { key: "preview", label: "Preview", icon: "eye" },
  { key: "export", label: "Export", icon: "download" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export function Sidebar({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (k: SectionKey) => void;
}) {
  const { state } = useStore();
  const approvedPages = state.pages.filter((p) => p.status === "approved").length;
  const totalPages = state.pages.length;

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-peach-200 via-lilac-200 to-sky-200 shadow-soft">
          <span className="font-display text-lg font-semibold text-ink">C</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold text-ink">
            Coloring Book Studio
          </div>
          <div className="text-[11px] text-zinc-500">Prototype · gpt-image-2</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cx(
                "group mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                isActive
                  ? "bg-ink text-white shadow-soft"
                  : "text-zinc-700 hover:bg-zinc-100",
              )}
            >
              <span
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  isActive ? "bg-white/15" : "bg-white",
                )}
              >
                <Icon name={item.icon} size={16} />
              </span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.key === "planner" && (
                <span
                  className={cx(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isActive ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {totalPages}
                </span>
              )}
              {item.key === "generate" && (
                <span
                  className={cx(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isActive ? "bg-white/15 text-white" : "bg-mint-100 text-mint-500",
                  )}
                >
                  {approvedPages}/{totalPages}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl2 border border-zinc-200 bg-gradient-to-br from-peach-50 to-lilac-50 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-lilac-500">
          Project
        </div>
        <div className="mt-1 font-display text-[15px] font-semibold leading-snug text-ink">
          {state.book.title}
        </div>
        <div className="mt-1 text-[11px] text-zinc-600">
          Ages {state.book.ageRange} · {state.book.numPages} pages · {state.book.trimSize}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Approved</span>
          <span className="font-medium text-ink">{approvedPages}/{totalPages}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-mint-400"
            style={{ width: `${totalPages ? (approvedPages / totalPages) * 100 : 0}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
