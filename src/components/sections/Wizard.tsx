import { useStore } from "../../lib/store";
import type { AgeRange, ColoringStyle, Orientation, OutputGoal, SectionKey, TrimSize } from "../../lib/types";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionHeader,
  Textarea,
  Toggle,
  cx,
} from "../ui/primitives";

const ageRanges: { value: AgeRange; label: string }[] = [
  { value: "0-2", label: "0–2" },
  { value: "3-5", label: "3–5" },
  { value: "5-7", label: "5–7" },
  { value: "7-9", label: "7–9" },
  { value: "9-12", label: "9–12" },
  { value: "teen", label: "Teen" },
  { value: "adult", label: "Adult" },
];

const trimSizes: { value: TrimSize; label: string; desc: string }[] = [
  { value: "8.5x11", label: "8.5 × 11 in", desc: "US Letter — KDP standard" },
  { value: "8x10", label: "8 × 10 in", desc: "Compact, popular for kids" },
  { value: "square", label: "8.5 × 8.5 in", desc: "Square — great for younger kids" },
  { value: "custom", label: "Custom", desc: "Set your own size" },
];

const styles: { value: ColoringStyle; label: string; desc: string }[] = [
  { value: "preschool-simple", label: "Preschool simple", desc: "Bold lines, big shapes" },
  { value: "kawaii", label: "Kawaii", desc: "Cute, round, expressive" },
  { value: "cozy-storybook", label: "Cozy storybook", desc: "Soft, narrative scenes" },
  { value: "bold-cartoon", label: "Bold cartoon", desc: "Confident outlines" },
  { value: "educational-worksheet", label: "Educational worksheet", desc: "Counting, letters, mazes" },
  { value: "fantasy", label: "Fantasy", desc: "Castles, creatures, magic" },
  { value: "animals", label: "Animals", desc: "Realistic-friendly creatures" },
  { value: "custom", label: "Custom", desc: "Describe your own" },
];

const goals: { value: OutputGoal; label: string; desc: string }[] = [
  { value: "personal", label: "Personal use", desc: "For my family" },
  { value: "etsy", label: "Etsy printable", desc: "Digital download listing" },
  { value: "kdp", label: "KDP paperback", desc: "Amazon print on demand" },
  { value: "classroom", label: "Classroom handout", desc: "Print at school" },
  { value: "therapy", label: "Therapy activity", desc: "Calming, accessible" },
  { value: "custom", label: "Custom", desc: "Describe your own" },
];

const steps = [
  "Basics",
  "Trim & layout",
  "Style",
  "Audience & goal",
  "Review",
];

export function Wizard({ onJump }: { onJump: (s: SectionKey) => void }) {
  const { state, dispatch } = useStore();
  const step = state.wizardStep;
  const setStep = (s: number) =>
    dispatch({ type: "set_wizard_step", step: Math.max(0, Math.min(steps.length - 1, s)) });
  const update = (patch: Partial<typeof state.book>) =>
    dispatch({ type: "set_book", book: patch });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Step-by-step"
        title="New Book Wizard"
        subtitle="Set the bones of your coloring book. You can always come back and edit any of this."
        actions={
          <>
            <Button
              variant="soft"
              size="md"
              onClick={() => setStep(step - 1)}
              icon={<Icon name="chevron-left" size={16} />}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(step + 1)}
                icon={<Icon name="arrow-right" size={16} />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={<Icon name="sparkles" size={16} />}
                onClick={() => onJump("characters")}
              >
                Set up characters
              </Button>
            )}
          </>
        }
      />

      {/* Stepper */}
      <Card pad>
        <ol className="flex flex-wrap items-center gap-2">
          {steps.map((label, idx) => {
            const done = idx < step;
            const active = idx === step;
            return (
              <li key={label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(idx)}
                  className={cx(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition",
                    active && "bg-ink text-white",
                    done && "bg-mint-100 text-mint-500",
                    !done && !active && "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
                  )}
                >
                  <span
                    className={cx(
                      "grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold",
                      active && "bg-white/20",
                      done && "bg-mint-300 text-white",
                      !done && !active && "bg-white",
                    )}
                  >
                    {done ? <Icon name="check" size={12} /> : idx + 1}
                  </span>
                  <span className="font-medium">{label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <Icon name="chevron-right" size={14} className="mx-1 text-zinc-300" />
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card pad>
          {step === 0 && (
            <div className="space-y-5">
              <Field label="Book title" required>
                <Input
                  value={state.book.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="e.g. Alex and Sierra Visit the Vet"
                />
              </Field>
              <Field label="Subtitle (optional)">
                <Input
                  value={state.book.subtitle ?? ""}
                  onChange={(e) => update({ subtitle: e.target.value })}
                  placeholder="A short tagline"
                />
              </Field>
              <Field label="Theme" hint="A 1–2 sentence description of what the book is about.">
                <Textarea
                  value={state.book.theme}
                  onChange={(e) => update({ theme: e.target.value })}
                  placeholder="A friendly visit to the vet for a little kid and her dog…"
                />
              </Field>
              <Field label="Number of coloring pages">
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={state.book.numPages}
                  onChange={(e) =>
                    update({ numPages: parseInt(e.target.value || "0", 10) })
                  }
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Trim size
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {trimSizes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update({ trimSize: t.value })}
                      className={cx(
                        "rounded-xl border p-3 text-left transition",
                        state.book.trimSize === t.value
                          ? "border-ink bg-ink/5"
                          : "border-zinc-200 hover:bg-zinc-50",
                      )}
                    >
                      <div className="font-medium text-ink">{t.label}</div>
                      <div className="text-xs text-zinc-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {state.book.trimSize === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width (in)">
                    <Input
                      type="number"
                      step="0.1"
                      value={state.book.customTrim?.w ?? 8.5}
                      onChange={(e) =>
                        update({
                          customTrim: {
                            w: parseFloat(e.target.value || "0"),
                            h: state.book.customTrim?.h ?? 11,
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Height (in)">
                    <Input
                      type="number"
                      step="0.1"
                      value={state.book.customTrim?.h ?? 11}
                      onChange={(e) =>
                        update({
                          customTrim: {
                            w: state.book.customTrim?.w ?? 8.5,
                            h: parseFloat(e.target.value || "0"),
                          },
                        })
                      }
                    />
                  </Field>
                </div>
              )}

              <Field label="Orientation">
                <div className="flex gap-2">
                  {(["portrait", "landscape"] as Orientation[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => update({ orientation: o })}
                      className={cx(
                        "flex-1 rounded-xl border p-3 capitalize transition",
                        state.book.orientation === o
                          ? "border-ink bg-ink/5"
                          : "border-zinc-200 hover:bg-zinc-50",
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Toggle
                  checked={state.book.bleed}
                  onChange={(v) => update({ bleed: v })}
                  label="Include bleed"
                  hint="Extends artwork past the trim line for KDP."
                />
                <Toggle
                  checked={state.book.pageNumbersEnabled}
                  onChange={(v) => update({ pageNumbersEnabled: v })}
                  label="Page numbers"
                  hint="Add small page numbers at the bottom."
                />
                <Toggle
                  checked={state.book.captionsEnabled}
                  onChange={(v) => update({ captionsEnabled: v })}
                  label="Allow captions on pages"
                  hint="One short caption per page (still kid-friendly)."
                />
                <Toggle
                  checked={state.book.coverIncluded}
                  onChange={(v) => update({ coverIncluded: v })}
                  label="Include cover"
                  hint="Generate a full-color cover."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Coloring style
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {styles.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update({ style: s.value })}
                      className={cx(
                        "rounded-xl border p-3 text-left transition",
                        state.book.style === s.value
                          ? "border-ink bg-ink/5"
                          : "border-zinc-200 hover:bg-zinc-50",
                      )}
                    >
                      <div className="font-medium text-ink">{s.label}</div>
                      <div className="text-xs text-zinc-500">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label="Style notes (optional)"
                hint="Anything to emphasize — line weight, motifs, things to avoid…"
              >
                <Textarea
                  rows={3}
                  defaultValue=""
                  placeholder="Bold outlines, big open spaces, friendly facial expressions…"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Intended age range
                </div>
                <div className="flex flex-wrap gap-2">
                  {ageRanges.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => update({ ageRange: a.value })}
                      className={cx(
                        "rounded-full px-3 py-1.5 text-sm transition",
                        state.book.ageRange === a.value
                          ? "bg-ink text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Output goal
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {goals.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => update({ outputGoal: g.value })}
                      className={cx(
                        "rounded-xl border p-3 text-left transition",
                        state.book.outputGoal === g.value
                          ? "border-ink bg-ink/5"
                          : "border-zinc-200 hover:bg-zinc-50",
                      )}
                    >
                      <div className="font-medium text-ink">{g.label}</div>
                      <div className="text-xs text-zinc-500">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Author name (optional)">
                <Input
                  value={state.book.authorName ?? ""}
                  onChange={(e) => update({ authorName: e.target.value })}
                  placeholder="Leave blank to print without an author"
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="lilac">Title</Badge>
                <span className="text-sm font-medium text-ink">{state.book.title}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="sky">Audience</Badge>
                <span className="text-sm">Ages {state.book.ageRange}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="mint">Pages</Badge>
                <span className="text-sm">{state.book.numPages}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="peach">Trim</Badge>
                <span className="text-sm">
                  {state.book.trimSize}
                  {state.book.trimSize === "custom" && state.book.customTrim
                    ? ` (${state.book.customTrim.w} × ${state.book.customTrim.h} in)`
                    : ""}
                  · {state.book.orientation}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Style</Badge>
                <span className="text-sm capitalize">{state.book.style.replaceAll("-", " ")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Goal</Badge>
                <span className="text-sm capitalize">{state.book.outputGoal}</span>
              </div>
              <p className="rounded-xl bg-mint-50 p-3 text-sm text-mint-500">
                Looks great. Next step: build out the character bible, then generate the story.
              </p>
            </div>
          )}
        </Card>

        {/* Live preview */}
        <Card pad>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Live cover preview
          </div>
          <div className="mt-3 aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-peach-100 via-lilac-100 to-sky-100 p-3">
            <div className="flex h-full flex-col items-center justify-between rounded-xl bg-white p-4 text-center shadow-soft">
              <div>
                <div className="font-display text-xl font-semibold leading-tight text-ink">
                  {state.book.title || "Your title"}
                </div>
                {state.book.subtitle && (
                  <div className="mt-1 text-xs text-zinc-500">{state.book.subtitle}</div>
                )}
              </div>
              <div className="text-[60px]">📒</div>
              <div className="text-[11px] text-zinc-500">
                {state.book.authorName ? `by ${state.book.authorName}` : "Coloring Book Studio"}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Style</span>
              <span className="font-medium capitalize text-ink">
                {state.book.style.replaceAll("-", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Trim</span>
              <span className="font-medium text-ink">{state.book.trimSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Pages</span>
              <span className="font-medium text-ink">{state.book.numPages}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

