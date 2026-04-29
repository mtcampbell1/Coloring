import { useEffect, useMemo, useRef, useState } from "react";
import {
  mockGenerateCover,
  mockGenerateLineArt,
  newPageVersion,
  useStore,
} from "../../lib/store";
import type { PagePlan } from "../../lib/types";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  DevNote,
  ProgressBar,
  SectionHeader,
  cx,
} from "../ui/primitives";

interface QueueItem {
  pageId: string;
  status: "queued" | "running" | "done" | "failed";
  message?: string;
}

export function Generate() {
  const { state, dispatch } = useStore();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const cancelRef = useRef(false);

  const total = queue.length;
  const done = queue.filter((q) => q.status === "done").length;
  const failed = queue.filter((q) => q.status === "failed").length;
  const running = queue.find((q) => q.status === "running");

  const remaining = total - done - failed;

  const estPerPage = 14; // seconds
  const estCostPerPage = 0.04; // dollars (placeholder)

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const enqueue = (pages: PagePlan[]) => {
    const items = pages.map<QueueItem>((p) => ({ pageId: p.id, status: "queued" }));
    setQueue(items);
    runQueue(items);
  };

  const runQueue = async (items: QueueItem[]) => {
    cancelRef.current = false;
    for (let i = 0; i < items.length; i++) {
      while (paused && !cancelRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelRef.current) return;

      const item = items[i];
      // Update queue UI
      items[i] = { ...item, status: "running" };
      setQueue([...items]);
      const page = state.pages.find((p) => p.id === item.pageId);
      if (!page) {
        items[i] = { ...item, status: "failed", message: "Page not found" };
        setQueue([...items]);
        continue;
      }
      dispatch({ type: "update_page", id: page.id, patch: { status: "generating" } });

      try {
        // Simulated 1-in-12 failure to show retry path
        if (Math.random() < 1 / 12) throw new Error("Mock provider timeout");
        const url = await mockGenerateLineArt(
          page,
          state.characters,
          state.book.title,
          state.book.captionsEnabled,
        );
        const version = newPageVersion(url, page.prompt, state.settings.model);
        dispatch({
          type: "update_page",
          id: page.id,
          patch: {
            status: "needs-review",
            versions: [...page.versions, version],
            activeVersionId: version.id,
          },
        });
        items[i] = { ...item, status: "done" };
      } catch (err) {
        dispatch({ type: "update_page", id: page.id, patch: { status: "not-generated" } });
        const message = err instanceof Error ? err.message : "Unknown error";
        items[i] = { ...item, status: "failed", message };
      }
      setQueue([...items]);
    }
  };

  const generateAll = () => enqueue(state.pages);
  const generateSelected = () =>
    enqueue(state.pages.filter((p) => selected.has(p.id)));
  const generateMissing = () =>
    enqueue(state.pages.filter((p) => p.versions.length === 0));
  const retryFailed = () => {
    const failedItems = queue.filter((q) => q.status === "failed");
    const next = queue.map((q) =>
      q.status === "failed" ? ({ ...q, status: "queued" } as QueueItem) : q,
    );
    setQueue(next);
    if (failedItems.length) runQueue(next);
  };
  const pauseToggle = () => setPaused((p) => !p);

  const generateCover = async () => {
    setCoverBusy(true);
    const url = await mockGenerateCover(
      state.book.title,
      state.book.subtitle,
      state.book.authorName,
      state.characters.map((c) => c.name),
    );
    dispatch({
      type: "set_cover",
      patch: {
        imageUrl: url,
        status: "needs-review",
        versions: [
          ...state.cover.versions,
          newPageVersion(url, state.cover.prompt, state.settings.model),
        ],
      },
    });
    setCoverBusy(false);
  };

  const queueGroupedById = useMemo(() => {
    const map = new Map<string, QueueItem>();
    queue.forEach((q) => map.set(q.pageId, q));
    return map;
  }, [queue]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Generation queue"
        title="Generate"
        subtitle="Queue interior pages and the cover for the configured image provider."
        actions={
          <>
            <Button variant="soft" onClick={pauseToggle} icon={<Icon name={paused ? "play" : "pause"} size={16} />}>
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="soft" onClick={retryFailed} icon={<Icon name="refresh" size={16} />} disabled={!failed}>
              Retry failed ({failed})
            </Button>
            <Button variant="primary" onClick={generateAll} icon={<Icon name="play" size={16} />}>
              Generate all
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Status */}
          <Card pad>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Queue progress
                </div>
                <div className="font-display text-lg font-semibold text-ink">
                  {done}/{total || 0} pages complete
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Badge tone="lilac">Model: {state.settings.model}</Badge>
                <Badge tone="sky">Provider: {state.settings.imageProvider}</Badge>
              </div>
            </div>
            <ProgressBar value={done} max={total || 1} />
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Remaining" value={remaining} tone="neutral" />
              <Stat label="Running" value={running ? 1 : 0} tone="lilac" />
              <Stat label="Failed" value={failed} tone="peach" />
              <Stat label="Done" value={done} tone="mint" />
            </div>
            {running && (
              <p className="mt-3 text-xs text-zinc-600">
                Working on page{" "}
                <span className="font-medium text-ink">
                  {state.pages.find((p) => p.id === running.pageId)?.pageNumber}
                </span>
                ...
              </p>
            )}
          </Card>

          {/* Page selector */}
          <Card pad>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Pages
                </div>
                <div className="font-display text-lg font-semibold text-ink">
                  Select pages to queue
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="soft" size="sm" onClick={generateMissing} icon={<Icon name="play" size={14} />}>
                  Generate missing
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={generateSelected}
                  icon={<Icon name="play" size={14} />}
                  disabled={!selected.size}
                >
                  Generate selected ({selected.size})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {state.pages.map((p) => {
                const v = p.versions.find((x) => x.id === p.activeVersionId) ?? p.versions.at(-1);
                const q = queueGroupedById.get(p.id);
                const sel = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const next = new Set(selected);
                      if (next.has(p.id)) next.delete(p.id);
                      else next.add(p.id);
                      setSelected(next);
                    }}
                    className={cx(
                      "group overflow-hidden rounded-xl bg-white p-1.5 text-left ring-1 ring-zinc-200 transition",
                      sel ? "ring-2 ring-ink" : "hover:ring-zinc-300",
                    )}
                  >
                    <div className="paper relative aspect-[3/4] overflow-hidden rounded-lg bg-white">
                      {v?.imageUrl ? (
                        <img src={v.imageUrl} alt={p.title} className="h-full w-full object-contain" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-zinc-400">
                          No image
                        </div>
                      )}
                      {q?.status === "running" && (
                        <div className="hatch absolute inset-0 grid place-items-center">
                          <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] text-zinc-700">
                            Generating…
                          </span>
                        </div>
                      )}
                      {q?.status === "failed" && (
                        <div className="absolute inset-0 grid place-items-center bg-red-50/80">
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] text-red-600 ring-1 ring-red-200">
                            Failed · retry
                          </span>
                        </div>
                      )}
                      <div className="absolute left-2 top-2">
                        <Badge tone={sel ? "lilac" : "neutral"}>{sel ? "Selected" : `P. ${p.pageNumber}`}</Badge>
                      </div>
                    </div>
                    <div className="px-1 pb-1 pt-2">
                      <div className="line-clamp-1 text-xs font-medium text-ink">{p.title}</div>
                      <div className="text-[10px] text-zinc-500">
                        {q?.status ?? p.status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Cover */}
          <Card pad>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Cover
                </div>
                <div className="font-display text-lg font-semibold text-ink">
                  Generate the front cover
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  Full-color, professional children's book cover with a clear title space and the
                  book's main characters.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={generateCover} loading={coverBusy} icon={<Icon name="sparkles" size={14} />}>
                    Generate cover
                  </Button>
                  <Badge tone="lilac">{state.cover.versions.length} version(s)</Badge>
                </div>
              </div>
              <div className="w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-200">
                <img src={state.cover.imageUrl} alt="Cover" className="h-full w-full object-contain" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Estimates (placeholder)
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-cream p-3">
                <div className="text-xs text-zinc-500">Est. cost</div>
                <div className="font-display text-base font-semibold text-ink">
                  ${(state.pages.length * estCostPerPage).toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-400">~ ${estCostPerPage}/page</div>
              </div>
              <div className="rounded-xl bg-cream p-3">
                <div className="text-xs text-zinc-500">Est. time</div>
                <div className="font-display text-base font-semibold text-ink">
                  ~ {Math.round((state.pages.length * estPerPage) / 60)} min
                </div>
                <div className="text-[10px] text-zinc-400">~ {estPerPage}s/page</div>
              </div>
            </div>
            <DevNote>
              These numbers are placeholders. Wire to your provider's pricing and queue throughput in{" "}
              <code>store.ts</code>.
            </DevNote>
          </Card>

          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Activity log
            </div>
            <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto text-xs">
              {[...queue].reverse().slice(0, 20).map((q) => {
                const page = state.pages.find((p) => p.id === q.pageId);
                return (
                  <li
                    key={`${q.pageId}-${q.status}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 p-2"
                  >
                    <span className="truncate">
                      <span className="text-zinc-500">P{page?.pageNumber}</span>{" "}
                      <span className="text-ink">{page?.title}</span>
                    </span>
                    <Badge
                      tone={
                        q.status === "done"
                          ? "mint"
                          : q.status === "failed"
                            ? "red"
                            : q.status === "running"
                              ? "lilac"
                              : "neutral"
                      }
                    >
                      {q.status}
                    </Badge>
                  </li>
                );
              })}
              {!queue.length && (
                <li className="rounded-lg bg-zinc-50 p-2 text-zinc-500">No activity yet.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "mint" | "peach" | "sky" | "lilac";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-zinc-50",
    mint: "bg-mint-50",
    peach: "bg-peach-50",
    sky: "bg-sky-50",
    lilac: "bg-lilac-50",
  };
  return (
    <div className={`rounded-xl ${tones[tone]} px-3 py-2.5`}>
      <div className="font-display text-lg font-semibold text-ink">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}
