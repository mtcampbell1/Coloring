import { useState } from "react";
import { generateStoryText, useStore } from "../../lib/store";
import { Icon, type IconName } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  DevNote,
  Field,
  Input,
  SectionHeader,
  Textarea,
  Toggle,
  cx,
} from "../ui/primitives";

const nudges: { key: string; label: string; icon: IconName }[] = [
  { key: "rewrite", label: "Rewrite story", icon: "refresh" },
  { key: "simpler", label: "Make it simpler", icon: "sparkles" },
  { key: "funnier", label: "Make it funnier", icon: "sparkles" },
  { key: "educational", label: "More educational", icon: "book" },
  { key: "remove-text", label: "Remove text from pages", icon: "x" },
  { key: "activity-book", label: "No-story activity book", icon: "grid" },
];

export function Story() {
  const { state, dispatch } = useStore();
  const { story, characters, pages } = state;
  const [busy, setBusy] = useState<string | null>(null);

  const setStory = (patch: Partial<typeof story>) => dispatch({ type: "set_story", story: patch });

  const runNudge = async (n: string) => {
    setBusy(n);

    // Local-only nudges (no LLM call)
    if (n === "remove-text") {
      setStory({ hasText: false });
      const next = pages.map((p) => ({ ...p, caption: undefined }));
      dispatch({ type: "set_pages", pages: next });
      dispatch({ type: "set_book", book: { captionsEnabled: false } });
      setBusy(null);
      return;
    }
    if (n === "activity-book") {
      setStory({ isActivityBook: true });
      setBusy(null);
      return;
    }

    const characterList = characters.map((c) => `${c.name} (${c.role})`).join(", ");
    const flavorByNudge: Record<string, string> = {
      rewrite: "Rewrite the story summary from scratch with a fresh angle.",
      simpler: "Make it simpler, shorter sentences, suitable for ages 3-5.",
      funnier: "Make it funnier with light kid-safe humor.",
      educational: "Make it more educational; emphasize what the reader learns.",
      generate: "Write a new short story summary.",
    };
    const flavor = flavorByNudge[n] ?? flavorByNudge.generate;

    const prompt = `You are writing the summary for a children's coloring book story.
Title: "${state.book.title}".
Audience: ages ${state.book.ageRange}.
Setting: ${story.setting}.
Tone target: ${story.tone}.
Lesson: ${story.lesson}.
Main characters: ${characterList}.

${flavor}

Respond with ONLY a 4-6 sentence story summary suitable for a coloring book. Plain prose, no preamble, no headings, no bullets.`;

    try {
      const text = (await generateStoryText(prompt)).trim();
      if (text) {
        const patch: Partial<typeof story> = { summary: text };
        if (n === "simpler") patch.tone = "Warm, very gentle";
        if (n === "funnier") patch.tone = "Playful, light";
        if (n === "educational") {
          patch.tone = "Curious and informative";
        }
        setStory(patch);
      }
    } catch {
      // leave story unchanged on failure
    }
    setBusy(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Story generator"
        title="Story"
        subtitle="Shape the narrative arc and per-page beats. Every page in the planner reads from this."
        actions={
          <>
            <Button
              variant="soft"
              icon={<Icon name="refresh" size={16} />}
              loading={busy === "rewrite"}
              onClick={() => runNudge("rewrite")}
            >
              Rewrite
            </Button>
            <Button
              variant="primary"
              icon={<Icon name="sparkles" size={16} />}
              loading={busy === "generate"}
              onClick={() => runNudge("generate")}
            >
              Generate story
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card pad>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Main idea">
                <Textarea
                  rows={3}
                  value={story.summary}
                  onChange={(e) => setStory({ summary: e.target.value })}
                />
              </Field>
              <Field label="Lesson or theme">
                <Input value={story.lesson} onChange={(e) => setStory({ lesson: e.target.value })} />
              </Field>
              <Field label="Tone">
                <Input value={story.tone} onChange={(e) => setStory({ tone: e.target.value })} />
              </Field>
              <Field label="Setting">
                <Input value={story.setting} onChange={(e) => setStory({ setting: e.target.value })} />
              </Field>
              <Field label="Number of pages">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={state.book.numPages}
                  onChange={(e) =>
                    dispatch({
                      type: "set_book",
                      book: { numPages: parseInt(e.target.value || "0", 10) },
                    })
                  }
                />
              </Field>
              <Field label="Main characters">
                <div className="flex flex-wrap gap-2 rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                  {characters.map((c) => {
                    const on = story.mainCharacters.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setStory({
                            mainCharacters: on
                              ? story.mainCharacters.filter((id) => id !== c.id)
                              : [...story.mainCharacters, c.id],
                          })
                        }
                        className={cx(
                          "rounded-full px-3 py-1.5 text-xs transition",
                          on ? "bg-ink text-white" : "bg-zinc-100 text-zinc-700",
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {nudges.map((n) => (
                <Button
                  key={n.key}
                  variant="soft"
                  size="sm"
                  loading={busy === n.key}
                  onClick={() => runNudge(n.key)}
                  icon={<Icon name={n.icon} size={14} />}
                >
                  {n.label}
                </Button>
              ))}
            </div>

            <DevNote title="LLM hookup">
              Wire a Claude / OpenAI call inside <code>regenerateStory()</code> and replace these nudges with
              templated prompts (e.g. "make it simpler for ages 3–5"). Return JSON shaped like{" "}
              <code>StoryOutline</code>.
            </DevNote>
          </Card>

          <Card pad>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Page-by-page outline
                </div>
                <div className="font-display text-lg font-semibold text-ink">
                  {pages.length} scenes
                </div>
              </div>
              <Toggle
                checked={story.hasText}
                onChange={(v) => {
                  setStory({ hasText: v });
                  dispatch({ type: "set_book", book: { captionsEnabled: v } });
                }}
                label="Allow captions"
                hint="On = each page may have a short caption."
              />
            </div>
            <ol className="space-y-3">
              {pages.map((p) => (
                <li key={p.id} className="flex gap-3 rounded-xl bg-cream p-3 ring-1 ring-zinc-200">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white font-display text-sm font-semibold text-ink ring-1 ring-zinc-200">
                    {p.pageNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{p.title}</span>
                      <Badge tone="lilac">{p.emotionalTone}</Badge>
                      <Badge tone="sky">complexity {p.complexity}/5</Badge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-700">{p.summary}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Setting: {p.setting} · Props: {p.props.join(", ")}
                    </p>
                    {state.book.captionsEnabled && p.caption && (
                      <p className="mt-1 text-xs italic text-zinc-600">"{p.caption}"</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.characters.map((cid) => {
                        const c = characters.find((x) => x.id === cid);
                        if (!c) return null;
                        return (
                          <Badge key={cid} tone="peach">
                            {c.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Story snapshot
            </div>
            <div className="mt-2 font-display text-lg font-semibold text-ink">
              {state.book.title}
            </div>
            <p className="mt-2 text-sm text-zinc-700">{story.summary}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-mint-50 p-2 text-mint-500">
                <div className="font-medium">Lesson</div>
                <div className="mt-0.5 text-zinc-700">{story.lesson}</div>
              </div>
              <div className="rounded-lg bg-peach-50 p-2 text-peach-500">
                <div className="font-medium">Tone</div>
                <div className="mt-0.5 text-zinc-700">{story.tone}</div>
              </div>
              <div className="col-span-2 rounded-lg bg-sky-50 p-2 text-sky-500">
                <div className="font-medium">Setting</div>
                <div className="mt-0.5 text-zinc-700">{story.setting}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {story.mainCharacters.map((cid) => {
                const c = characters.find((x) => x.id === cid);
                return c ? <Badge key={cid} tone="lilac">{c.name}</Badge> : null;
              })}
            </div>
          </Card>

          <Card pad tone="warm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-peach-500">
              Activity book mode
            </div>
            <p className="mt-1 text-xs text-zinc-700">
              Toggle on to switch from a narrative book to a no-story activity book (mazes, counting, scenes).
            </p>
            <Toggle
              checked={story.isActivityBook}
              onChange={(v) => setStory({ isActivityBook: v })}
              label="No-story activity book"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
