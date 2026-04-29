import { useStore } from "../lib/store";
import type { SectionKey } from "../lib/types";
import { Icon } from "./ui/icon";
import { Badge, Card, DevNote, ProgressBar, SegmentedControl } from "./ui/primitives";

export function RightPanel({
  section,
  onJump,
}: {
  section: SectionKey;
  onJump: (s: SectionKey) => void;
}) {
  const { state, dispatch } = useStore();
  const total = state.pages.length;
  const generated = state.pages.filter((p) => p.versions.length > 0).length;
  const approved = state.pages.filter((p) => p.status === "approved").length;

  return (
    <aside className="hidden xl:block w-80 shrink-0 border-l border-zinc-200 bg-white/70 backdrop-blur">
      <div className="space-y-4 p-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Project status
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Card pad={false} className="px-2 py-3">
              <div className="font-display text-lg font-semibold text-ink">{total}</div>
              <div className="text-[11px] text-zinc-500">Pages</div>
            </Card>
            <Card pad={false} className="px-2 py-3">
              <div className="font-display text-lg font-semibold text-ink">{generated}</div>
              <div className="text-[11px] text-zinc-500">Generated</div>
            </Card>
            <Card pad={false} className="px-2 py-3">
              <div className="font-display text-lg font-semibold text-mint-500">{approved}</div>
              <div className="text-[11px] text-zinc-500">Approved</div>
            </Card>
          </div>
          <div className="mt-3">
            <ProgressBar value={approved} max={total || 1} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Workspace
            </div>
            <SegmentedControl
              value={section}
              onChange={onJump as (v: SectionKey) => void}
              options={[
                { value: "story", label: "Story" },
                { value: "planner", label: "Pages" },
                { value: "preview", label: "Preview" },
              ]}
            />
          </div>

          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Style
            </div>
            <div className="mt-1.5 font-display text-base font-semibold text-ink capitalize">
              {state.book.style.replaceAll("-", " ")}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="peach">Ages {state.book.ageRange}</Badge>
              <Badge tone="sky">{state.book.trimSize}</Badge>
              <Badge tone="mint">{state.book.orientation}</Badge>
              {state.book.captionsEnabled && <Badge tone="lilac">captions</Badge>}
              {state.book.bleed && <Badge tone="peach">bleed</Badge>}
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Active characters
          </div>
          <div className="space-y-2">
            {state.characters.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onJump("characters")}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-2.5 text-left ring-1 ring-zinc-200 hover:bg-zinc-50"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-peach-100 to-lilac-100 text-sm font-semibold text-ink">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">{c.name}</div>
                  <div className="truncate text-[11px] text-zinc-500">{c.role}</div>
                </div>
                {c.locked ? (
                  <Icon name="lock" size={14} />
                ) : (
                  <Icon name="unlock" size={14} className="text-zinc-400" />
                )}
              </button>
            ))}
            {state.characters.length === 0 && (
              <div className="rounded-xl bg-zinc-50 p-3 text-center text-xs text-zinc-500">
                No characters yet.
              </div>
            )}
          </div>
        </div>

        <DevNote title="Where backend wires up">
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <code className="rounded bg-white px-1 py-0.5 ring-1 ring-zinc-200">store.ts → mockGenerateLineArt</code>
              {" "}→ swap to your image generation API
            </li>
            <li>
              <code className="rounded bg-white px-1 py-0.5 ring-1 ring-zinc-200">store.ts → regenerateStory</code>
              {" "}→ LLM endpoint
            </li>
            <li>
              <code className="rounded bg-white px-1 py-0.5 ring-1 ring-zinc-200">exporters.ts → toPDF / toZIP</code>
              {" "}→ server PDF/ZIP build
            </li>
          </ul>
        </DevNote>

        <button
          type="button"
          onClick={() => dispatch({ type: "set_wizard_step", step: 0 })}
          className="hidden"
        />
      </div>
    </aside>
  );
}
