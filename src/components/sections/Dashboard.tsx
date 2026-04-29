import { useStore } from "../../lib/store";
import type { SectionKey } from "../../lib/types";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  SectionHeader,
} from "../ui/primitives";

export function Dashboard({ onJump }: { onJump: (s: SectionKey) => void }) {
  const { state } = useStore();
  const { book, pages, characters, cover, story } = state;

  const counts = {
    total: pages.length,
    approved: pages.filter((p) => p.status === "approved").length,
    generated: pages.filter((p) => p.versions.length > 0).length,
    needsReview: pages.filter((p) => p.status === "needs-review").length,
    notStarted: pages.filter((p) => p.status === "not-generated").length,
  };

  const recentPages = pages.filter((p) => p.versions.length > 0).slice(-6);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Welcome back"
        title={book.title}
        subtitle={
          <>
            <span className="capitalize">{book.style.replaceAll("-", " ")}</span> ·
            ages {book.ageRange} · {book.numPages} interior pages · {book.trimSize}
          </>
        }
        actions={
          <>
            <Button
              variant="soft"
              size="md"
              icon={<Icon name="eye" size={16} />}
              onClick={() => onJump("preview")}
            >
              Open preview
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Icon name="play" size={16} />}
              onClick={() => onJump("generate")}
            >
              Generate pages
            </Button>
          </>
        }
      />

      {/* Hero cover */}
      <Card pad={false} className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          <div className="aurora relative flex items-center justify-center p-8">
            <div className="absolute left-6 top-6 flex items-center gap-2">
              <Badge tone="lilac">
                <Icon name="sparkles" size={11} /> Sample project
              </Badge>
              <Badge tone="mint">
                {Math.round((counts.approved / Math.max(counts.total, 1)) * 100)}% approved
              </Badge>
            </div>
            <div className="relative w-[260px] -rotate-2 transition-transform hover:-rotate-3">
              <div className="absolute -bottom-2 -right-2 h-full w-full rounded-2xl bg-ink/10" />
              <img
                src={cover.imageUrl}
                alt="Cover preview"
                className="relative w-full rounded-2xl shadow-pop"
              />
            </div>
          </div>
          <div className="space-y-5 p-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-lilac-500">
                Story summary
              </div>
              <p className="mt-1.5 max-w-prose text-sm leading-6 text-zinc-700">
                {story.summary}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Card pad className="bg-cream">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Lesson
                </div>
                <div className="mt-1 text-ink">{story.lesson}</div>
              </Card>
              <Card pad className="bg-cream">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Tone
                </div>
                <div className="mt-1 text-ink">{story.tone}</div>
              </Card>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="soft" onClick={() => onJump("story")} icon={<Icon name="book" size={14} />}>
                Story
              </Button>
              <Button variant="soft" onClick={() => onJump("planner")} icon={<Icon name="grid" size={14} />}>
                Page planner
              </Button>
              <Button variant="soft" onClick={() => onJump("characters")} icon={<Icon name="users" size={14} />}>
                Characters ({characters.length})
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress + characters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card pad className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Progress
              </div>
              <div className="font-display text-lg font-semibold text-ink">
                {counts.approved}/{counts.total} pages approved
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJump("generate")}
              icon={<Icon name="arrow-right" size={14} />}
            >
              Open generation queue
            </Button>
          </div>
          <ProgressBar value={counts.approved} max={counts.total || 1} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Total" value={counts.total} tone="neutral" />
            <Stat label="Generated" value={counts.generated} tone="sky" />
            <Stat label="Needs review" value={counts.needsReview} tone="peach" />
            <Stat label="Approved" value={counts.approved} tone="mint" />
          </div>
        </Card>

        <Card pad>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Character bible
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJump("characters")}
              icon={<Icon name="arrow-right" size={14} />}
            >
              Open
            </Button>
          </div>
          <ul className="space-y-2">
            {characters.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-peach-100 to-lilac-100 font-display text-base font-semibold text-ink">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{c.name}</div>
                  <div className="truncate text-xs text-zinc-500">{c.role}</div>
                </div>
                {c.locked && <Badge tone="lilac"><Icon name="lock" size={11} /> locked</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent thumbnails */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Recently generated
            </div>
            <div className="font-display text-lg font-semibold text-ink">
              Latest interior pages
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onJump("planner")} icon={<Icon name="arrow-right" size={14} />}>
            See all pages
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {recentPages.map((p) => (
            <Card pad={false} key={p.id} className="overflow-hidden">
              <div className="paper aspect-[3/4]">
                <img src={p.versions.at(-1)?.imageUrl} alt={p.title} className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1 p-3">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">Page {p.pageNumber}</div>
                <div className="line-clamp-1 text-sm font-medium text-ink">{p.title}</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{p.status === "approved" ? "Approved" : "Generated"}</span>
                  {p.status === "approved" ? (
                    <Badge tone="mint"><Icon name="check" size={10} /> ok</Badge>
                  ) : (
                    <Badge tone="sky">review</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
  tone: "neutral" | "mint" | "peach" | "sky";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-zinc-50",
    mint: "bg-mint-50",
    peach: "bg-peach-50",
    sky: "bg-sky-50",
  };
  return (
    <div className={`rounded-xl ${tones[tone]} px-3 py-2.5`}>
      <div className="font-display text-lg font-semibold text-ink">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}
