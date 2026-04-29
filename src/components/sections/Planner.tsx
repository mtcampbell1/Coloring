import { useMemo, useState } from "react";
import {
  detectPromptConflicts,
  makeId,
  mockGenerateLineArt,
  newPageVersion,
  rebuildPagePrompt,
  useStore,
} from "../../lib/store";
import type { PagePlan, PageStatus } from "../../lib/types";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  DevNote,
  Field,
  Input,
  SectionHeader,
  Select,
  Textarea,
  cx,
} from "../ui/primitives";

const statusTone: Record<PageStatus, "neutral" | "sky" | "peach" | "mint" | "lilac"> = {
  "not-generated": "neutral",
  generating: "lilac",
  generated: "sky",
  "needs-review": "peach",
  approved: "mint",
};
const statusLabels: Record<PageStatus, string> = {
  "not-generated": "Not generated",
  generating: "Generating…",
  generated: "Generated",
  "needs-review": "Needs review",
  approved: "Approved",
};

export function Planner() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<"all" | PageStatus>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => state.pages.filter((p) => (filter === "all" ? true : p.status === filter)),
    [state.pages, filter],
  );
  const active = state.pages.find((p) => p.id === activeId) ?? null;

  const generate = async (page: PagePlan) => {
    dispatch({ type: "update_page", id: page.id, patch: { status: "generating" } });
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
  };

  const updatePage = (id: string, patch: Partial<PagePlan>) =>
    dispatch({ type: "update_page", id, patch });

  const addPage = () => {
    const next: PagePlan = {
      id: makeId("page"),
      pageNumber: state.pages.length + 1,
      title: "Untitled scene",
      summary: "",
      scene: "",
      characters: [],
      setting: state.story.setting,
      emotionalTone: state.story.tone,
      caption: "",
      props: [],
      complexity: 2,
      prompt: "",
      status: "not-generated",
      versions: [],
      warnings: [],
    };
    next.prompt = rebuildPagePrompt(next, state);
    dispatch({ type: "add_page", page: next });
    setActiveId(next.id);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Storyboarding"
        title="Page Planner"
        subtitle="Tweak each scene, regenerate prompts, and queue pages for image generation."
        actions={
          <>
            <Button variant="soft" onClick={addPage} icon={<Icon name="plus" size={16} />}>
              Add page
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "not-generated", "generating", "needs-review", "generated", "approved"] as const).map(
          (k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === k ? "bg-ink text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50",
              )}
            >
              {k === "all" ? "All pages" : statusLabels[k]}
              <span className="ml-1.5 text-[10px] opacity-70">
                {k === "all"
                  ? state.pages.length
                  : state.pages.filter((p) => p.status === k).length}
              </span>
            </button>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const v = p.versions.find((x) => x.id === p.activeVersionId) ?? p.versions.at(-1);
            const conflicts = detectPromptConflicts(p.prompt, state.characters);
            return (
              <Card pad={false} key={p.id} className={cx(activeId === p.id && "ring-2 ring-lilac-300", "overflow-hidden")}>
                <div
                  className="paper relative aspect-[3/4] cursor-pointer"
                  onClick={() => setActiveId(p.id)}
                >
                  {v?.imageUrl ? (
                    <img src={v.imageUrl} alt={p.title} className="h-full w-full object-contain" />
                  ) : p.status === "generating" ? (
                    <div className="hatch flex h-full w-full items-center justify-center">
                      <div className="rounded-full bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-soft">
                        <span className="mr-2 inline-block h-2 w-2 animate-pulse-soft rounded-full bg-lilac-400" />
                        Generating…
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm text-zinc-400">
                      <div className="text-center">
                        <Icon name="image" size={24} className="mx-auto" />
                        <div className="mt-2">No image yet</div>
                      </div>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <Badge>P. {p.pageNumber}</Badge>
                    <Badge tone={statusTone[p.status]}>{statusLabels[p.status]}</Badge>
                  </div>
                  {conflicts.length > 0 && (
                    <div className="warn-pulse absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-peach-100 text-peach-500">
                      <Icon name="warning" size={14} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display text-base font-semibold leading-tight text-ink">
                      {p.title}
                    </div>
                    <div className="text-xs text-zinc-500">complexity {p.complexity}/5</div>
                  </div>
                  <p className="line-clamp-2 text-xs text-zinc-600">{p.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.characters.map((cid) => {
                      const c = state.characters.find((x) => x.id === cid);
                      return c ? <Badge key={cid} tone="peach">{c.name}</Badge> : null;
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Button size="sm" variant="soft" onClick={() => setActiveId(p.id)} icon={<Icon name="edit" size={12} />}>
                      Edit prompt
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => generate(p)}
                      loading={p.status === "generating"}
                      icon={<Icon name={p.versions.length ? "refresh" : "play"} size={12} />}
                    >
                      {p.versions.length ? "Regenerate" : "Generate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updatePage(p.id, { status: "approved" })}
                      icon={<Icon name="check" size={12} />}
                      disabled={!p.versions.length}
                    >
                      Approve
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 text-zinc-400">
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={() => dispatch({ type: "duplicate_page", id: p.id })}
                      className="rounded p-1 hover:bg-zinc-100 hover:text-ink"
                    >
                      <Icon name="duplicate" size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete page "${p.title}"?`))
                          dispatch({ type: "remove_page", id: p.id });
                      }}
                      className="rounded p-1 hover:bg-zinc-100 hover:text-red-500"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Editor panel */}
        <div className="space-y-4">
          {!active ? (
            <Card pad className="text-sm text-zinc-600">
              Select a page to edit its scene, prompt, and metadata. Or click <em>Edit prompt</em> on any card.
            </Card>
          ) : (
            <PageEditor
              page={active}
              onUpdate={(patch) => updatePage(active.id, patch)}
              onGenerate={() => generate(active)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PageEditor({
  page,
  onUpdate,
  onGenerate,
}: {
  page: PagePlan;
  onUpdate: (patch: Partial<PagePlan>) => void;
  onGenerate: () => void;
}) {
  const { state } = useStore();
  const conflicts = detectPromptConflicts(page.prompt, state.characters);
  return (
    <Card pad>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Page {page.pageNumber}
          </div>
          <div className="font-display text-lg font-semibold text-ink">{page.title}</div>
        </div>
        <Badge tone={statusTone[page.status]}>{statusLabels[page.status]}</Badge>
      </div>

      <div className="space-y-3">
        <Field label="Scene title">
          <Input value={page.title} onChange={(e) => onUpdate({ title: e.target.value })} />
        </Field>
        <Field label="Scene summary">
          <Textarea
            rows={2}
            value={page.summary}
            onChange={(e) => onUpdate({ summary: e.target.value })}
          />
        </Field>
        <Field label="Scene description (used in prompt)">
          <Textarea
            rows={3}
            value={page.scene}
            onChange={(e) => onUpdate({ scene: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Setting">
            <Input value={page.setting} onChange={(e) => onUpdate({ setting: e.target.value })} />
          </Field>
          <Field label="Tone">
            <Input value={page.emotionalTone} onChange={(e) => onUpdate({ emotionalTone: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Complexity">
            <Select
              value={String(page.complexity)}
              onChange={(e) =>
                onUpdate({ complexity: parseInt(e.target.value, 10) as PagePlan["complexity"] })
              }
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}/5
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Caption (if enabled)">
            <Input
              value={page.caption ?? ""}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              disabled={!state.book.captionsEnabled}
            />
          </Field>
        </div>
        <Field label="Characters in scene">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-2 ring-1 ring-zinc-200">
            {state.characters.map((c) => {
              const on = page.characters.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      characters: on
                        ? page.characters.filter((id) => id !== c.id)
                        : [...page.characters, c.id],
                    })
                  }
                  className={cx(
                    "rounded-full px-3 py-1 text-xs",
                    on ? "bg-ink text-white" : "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Image prompt" hint="Edited prompt is what the image API will receive.">
          <Textarea
            rows={6}
            value={page.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
          />
        </Field>

        {conflicts.length > 0 && (
          <div className="rounded-xl border border-peach-200 bg-peach-50 p-3 text-xs text-peach-500">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <Icon name="warning" size={12} /> Possible character conflict
            </div>
            <ul className="ml-4 list-disc space-y-1 text-zinc-700">
              {conflicts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={() => onUpdate({ prompt: rebuildPagePrompt(page, state) })} variant="soft" icon={<Icon name="refresh" size={14} />}>
            Rebuild prompt from scene
          </Button>
          <Button onClick={onGenerate} icon={<Icon name="play" size={14} />}>
            Generate
          </Button>
          {page.versions.length > 0 && (
            <Button onClick={() => onUpdate({ status: "approved" })} variant="primary" icon={<Icon name="check" size={14} />}>
              Approve
            </Button>
          )}
        </div>

        {page.versions.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Version history
            </div>
            <div className="grid grid-cols-3 gap-2">
              {page.versions.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onUpdate({ activeVersionId: v.id })}
                  className={cx(
                    "rounded-xl bg-zinc-50 p-1 ring-1 ring-zinc-200",
                    page.activeVersionId === v.id && "ring-2 ring-ink",
                  )}
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-white">
                    <img src={v.imageUrl} alt={`v${i + 1}`} className="h-full w-full object-contain" />
                  </div>
                  <div className="px-1.5 pt-1.5 text-left text-[10px] text-zinc-500">
                    v{i + 1} · {v.model}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <DevNote title="Image API hookup">
          Replace <code>mockGenerateLineArt()</code> with a real call (default model{" "}
          <code>gpt-image-2</code>). Pass the page prompt plus the locked character bible images for
          consistency.
        </DevNote>
      </div>
    </Card>
  );
}
