import type { SectionKey } from "../lib/types";
import { Icon } from "./ui/icon";
import { Button } from "./ui/primitives";
import { useStore } from "../lib/store";

const titles: Record<SectionKey, string> = {
  dashboard: "Dashboard",
  wizard: "New Book Wizard",
  characters: "Characters",
  story: "Story",
  planner: "Page Planner",
  generate: "Generate",
  preview: "Preview",
  export: "Export",
  settings: "Settings",
};

export function Topbar({
  section,
  onJump,
}: {
  section: SectionKey;
  onJump: (s: SectionKey) => void;
}) {
  const { state } = useStore();
  const allApproved = state.pages.every((p) => p.status === "approved");
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-zinc-200 bg-cream/85 px-5 backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Studio</span>
        <Icon name="chevron-right" size={14} />
        <span className="font-medium text-ink">{titles[section]}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-zinc-600 ring-1 ring-zinc-200">
          <Icon name="search" size={14} />
          <span>Search pages, characters…</span>
          <span className="ml-3 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">⌘K</span>
        </div>
        <Button
          variant="soft"
          size="sm"
          icon={<Icon name="eye" size={14} />}
          onClick={() => onJump("preview")}
        >
          Preview
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Icon name={allApproved ? "download" : "play"} size={14} />}
          onClick={() => onJump(allApproved ? "export" : "generate")}
        >
          {allApproved ? "Export" : "Generate"}
        </Button>
      </div>
    </header>
  );
}
