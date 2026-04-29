import { useState } from "react";
import { useStore } from "../../lib/store";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  SectionHeader,
  SegmentedControl,
  Toggle,
  cx,
} from "../ui/primitives";

export function Preview() {
  const { state } = useStore();
  const [view, setView] = useState<"flip" | "grid">("flip");
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showSafe, setShowSafe] = useState(true);
  const [showBleed, setShowBleed] = useState(false);

  const items: { kind: "cover" | "page"; idx: number }[] = state.book.coverIncluded
    ? [{ kind: "cover", idx: -1 }, ...state.pages.map((_, i) => ({ kind: "page" as const, idx: i }))]
    : state.pages.map((_, i) => ({ kind: "page" as const, idx: i }));
  const current = items[Math.min(page, items.length - 1)];
  const currentPage =
    current?.kind === "page" ? state.pages[current.idx] : null;

  const tooDetailed = currentPage && currentPage.complexity >= 4;
  const captionRisky = currentPage?.caption && state.book.captionsEnabled;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Preview"
        title="Coloring book preview"
        subtitle="Flip through the book exactly as it would print, with safe-area and bleed overlays."
        actions={
          <>
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: "flip", label: "Flip" },
                { value: "grid", label: "Grid" },
              ]}
            />
            <Button variant="primary" icon={<Icon name="download" size={16} />}>
              Download preview PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {view === "flip" ? (
          <Card pad={false} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  icon={<Icon name="chevron-left" size={14} />}
                >
                  Prev
                </Button>
                <span className="text-zinc-500">
                  {current?.kind === "cover"
                    ? "Cover"
                    : `Page ${currentPage?.pageNumber} of ${state.pages.length}`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(items.length - 1, p + 1))}
                  icon={<Icon name="chevron-right" size={14} />}
                >
                  Next
                </Button>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="rounded-full px-2 py-1 hover:bg-zinc-100"
                >
                  -
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
                  className="rounded-full px-2 py-1 hover:bg-zinc-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid place-items-center bg-gradient-to-br from-zinc-100 to-zinc-50 p-8">
              <div
                className="relative animate-flip-in shadow-pop"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Page */}
                <div
                  className={cx(
                    "relative paper aspect-[3/4] w-[420px] overflow-hidden rounded-md bg-white ring-1 ring-zinc-200",
                    showBleed && "bleed-area",
                    showSafe && "safe-area",
                  )}
                >
                  {current?.kind === "cover" ? (
                    <img src={state.cover.imageUrl} alt="Cover" className="h-full w-full object-contain" />
                  ) : currentPage?.versions.length ? (
                    <img
                      src={
                        currentPage.versions.find((v) => v.id === currentPage.activeVersionId)?.imageUrl ??
                        currentPage.versions.at(-1)?.imageUrl
                      }
                      alt={currentPage.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-zinc-400">
                      <div className="text-center">
                        <Icon name="image" size={28} className="mx-auto" />
                        <div className="mt-2 text-sm">No image yet</div>
                      </div>
                    </div>
                  )}
                  {state.book.pageNumbersEnabled && current?.kind === "page" && (
                    <div className="absolute bottom-2 right-3 text-[10px] text-zinc-400">
                      {currentPage?.pageNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(tooDetailed || captionRisky) && current?.kind === "page" && (
              <div className="border-t border-zinc-200 bg-peach-50 p-3 text-xs text-peach-500">
                {tooDetailed && (
                  <div className="flex items-center gap-2">
                    <Icon name="warning" size={12} /> Looks too detailed for ages {state.book.ageRange}.
                  </div>
                )}
                {captionRisky && (
                  <div className="mt-1 flex items-center gap-2">
                    <Icon name="warning" size={12} /> Text may not print clearly at small trim sizes.
                  </div>
                )}
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {state.book.coverIncluded && (
              <Card pad={false} className="overflow-hidden">
                <div className="aspect-[3/4]">
                  <img src={state.cover.imageUrl} alt="Cover" className="h-full w-full object-contain" />
                </div>
                <div className="border-t border-zinc-200 p-2 text-center text-xs">
                  <Badge tone="peach">Cover</Badge>
                </div>
              </Card>
            )}
            {state.pages.map((p) => (
              <Card pad={false} key={p.id} className="overflow-hidden">
                <div className={cx("paper aspect-[3/4]", showSafe && "safe-area", showBleed && "bleed-area")}>
                  {p.versions.length ? (
                    <img
                      src={p.versions.at(-1)?.imageUrl}
                      alt={p.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-zinc-400">
                      Page {p.pageNumber} — no image
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Page {p.pageNumber}</span>
                    {p.complexity >= 4 && <Badge tone="peach">busy</Badge>}
                  </div>
                  <div className="line-clamp-1 text-ink">{p.title}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Overlays
            </div>
            <div className="mt-2 space-y-2">
              <Toggle
                checked={showSafe}
                onChange={setShowSafe}
                label="Safe-margin overlay"
                hint="Dashed blue line — keep important content inside this."
              />
              <Toggle
                checked={showBleed}
                onChange={setShowBleed}
                label="Bleed overlay"
                hint="Dashed orange — extends past the trim line."
              />
            </div>
          </Card>

          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Print warnings
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              {state.pages
                .filter((p) => p.complexity >= 4)
                .slice(0, 5)
                .map((p) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-lg bg-peach-50 p-2 text-peach-500">
                    <Icon name="warning" size={12} />
                    <span>
                      Page {p.pageNumber}: <span className="text-zinc-700">{p.title}</span> — too detailed
                    </span>
                  </li>
                ))}
              {state.pages.every((p) => p.complexity < 4) && (
                <li className="rounded-lg bg-mint-50 p-2 text-mint-500">No detail warnings 🎉</li>
              )}
            </ul>
          </Card>

          <Card pad tone="cool">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">
              Print specs
            </div>
            <ul className="mt-2 space-y-1 text-xs text-zinc-700">
              <li>Trim: <span className="text-ink">{state.book.trimSize}</span></li>
              <li>Orientation: <span className="text-ink">{state.book.orientation}</span></li>
              <li>Bleed: <span className="text-ink">{state.book.bleed ? "yes" : "no"}</span></li>
              <li>Page numbers: <span className="text-ink">{state.book.pageNumbersEnabled ? "on" : "off"}</span></li>
              <li>Captions: <span className="text-ink">{state.book.captionsEnabled ? "on" : "off"}</span></li>
              <li>Cover included: <span className="text-ink">{state.book.coverIncluded ? "yes" : "no"}</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
