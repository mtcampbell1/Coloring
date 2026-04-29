import { useMemo, useState } from "react";
import { generateCharacterSheet, makeId, mockCharacterSheet, useStore } from "../../lib/store";
import type { Character } from "../../lib/types";
import { Icon } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  DevNote,
  EmptyState,
  Field,
  Input,
  SectionHeader,
  Textarea,
  Toggle,
  cx,
} from "../ui/primitives";

const blank = (): Character => ({
  id: makeId("char"),
  name: "New Character",
  age: "",
  role: "",
  personality: "",
  outfit: "",
  hairstyle: "",
  bodyShape: "",
  expressionNotes: "",
  recurringProps: "",
  locked: false,
  sheet: mockCharacterSheet("New Character"),
});

export function Characters() {
  const { state, dispatch } = useStore();
  const [activeId, setActiveId] = useState<string | null>(state.characters[0]?.id ?? null);
  const [generatingSheet, setGeneratingSheet] = useState<string | null>(null);
  const active = useMemo(
    () => state.characters.find((c) => c.id === activeId) ?? state.characters[0],
    [state.characters, activeId],
  );

  const update = (patch: Partial<Character>) => {
    if (!active) return;
    dispatch({ type: "update_character", id: active.id, patch });
  };

  const addNew = () => {
    const c = blank();
    dispatch({ type: "add_character", character: c });
    setActiveId(c.id);
  };

  const regenSheet = async () => {
    if (!active) return;
    setGeneratingSheet(active.id);
    const description = [
      active.role,
      active.outfit,
      active.hairstyle,
      active.bodyShape,
      active.expressionNotes,
    ]
      .filter(Boolean)
      .join(", ");
    try {
      const sheet = await generateCharacterSheet(active.name, description);
      dispatch({ type: "update_character", id: active.id, patch: { sheet } });
    } catch {
      dispatch({
        type: "update_character",
        id: active.id,
        patch: { sheet: mockCharacterSheet(active.name) },
      });
    }
    setGeneratingSheet(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Character bible"
        title="Characters"
        subtitle="Save the characters that appear in your book. Locked characters keep a consistent look across every page."
        actions={
          <>
            <Button variant="soft" icon={<Icon name="upload" size={16} />}>
              Upload character sheet
            </Button>
            <Button variant="primary" onClick={addNew} icon={<Icon name="plus" size={16} />}>
              New character
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Roster */}
        <Card pad={false}>
          <div className="border-b border-zinc-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Roster ({state.characters.length})
          </div>
          <ul className="max-h-[640px] overflow-y-auto p-2">
            {state.characters.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    activeId === c.id
                      ? "bg-ink/5 ring-1 ring-ink/10"
                      : "hover:bg-zinc-50",
                  )}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-peach-100 to-lilac-100 font-display text-base font-semibold text-ink">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{c.name}</div>
                    <div className="truncate text-[11px] text-zinc-500">{c.role || "—"}</div>
                  </div>
                  {c.locked ? (
                    <Icon name="lock" size={14} className="text-lilac-500" />
                  ) : (
                    <Icon name="unlock" size={14} className="text-zinc-300" />
                  )}
                </button>
              </li>
            ))}
            {state.characters.length === 0 && (
              <li className="p-3">
                <EmptyState title="No characters yet" hint="Add one to get started." />
              </li>
            )}
          </ul>
        </Card>

        {/* Editor */}
        {!active ? (
          <EmptyState title="Pick a character" />
        ) : (
          <div className="space-y-6">
            <Card pad>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" required>
                    <Input
                      value={active.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </Field>
                  <Field label="Age">
                    <Input
                      value={active.age}
                      onChange={(e) => update({ age: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </Field>
                  <Field label="Role" hint="Their part in the book.">
                    <Input
                      value={active.role}
                      onChange={(e) => update({ role: e.target.value })}
                      placeholder="Main character, friendly dog, helpful adult…"
                    />
                  </Field>
                  <Field label="Personality">
                    <Input
                      value={active.personality}
                      onChange={(e) => update({ personality: e.target.value })}
                    />
                  </Field>
                  <Field label="Hairstyle">
                    <Input
                      value={active.hairstyle}
                      onChange={(e) => update({ hairstyle: e.target.value })}
                    />
                  </Field>
                  <Field label="Body shape">
                    <Input
                      value={active.bodyShape}
                      onChange={(e) => update({ bodyShape: e.target.value })}
                    />
                  </Field>
                  <Field label="Outfit">
                    <Textarea
                      rows={2}
                      value={active.outfit}
                      onChange={(e) => update({ outfit: e.target.value })}
                    />
                  </Field>
                  <Field label="Expression notes">
                    <Textarea
                      rows={2}
                      value={active.expressionNotes}
                      onChange={(e) => update({ expressionNotes: e.target.value })}
                    />
                  </Field>
                  <Field label="Recurring props" hint="Items that follow this character.">
                    <Input
                      value={active.recurringProps}
                      onChange={(e) => update({ recurringProps: e.target.value })}
                    />
                  </Field>
                  <Field label="Notes (optional)">
                    <Textarea
                      rows={2}
                      value={active.notes ?? ""}
                      onChange={(e) => update({ notes: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="w-full max-w-xs space-y-3 lg:w-72">
                  <Toggle
                    checked={active.locked}
                    onChange={(v) => update({ locked: v })}
                    label="Lock character appearance"
                    hint="Every page generation will reference this saved sheet."
                  />
                  <Card pad className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Quick actions
                    </div>
                    <Button
                      variant="soft"
                      size="sm"
                      icon={<Icon name="refresh" size={14} />}
                      onClick={regenSheet}
                      loading={generatingSheet === active.id}
                      className="w-full justify-start"
                    >
                      Regenerate this character
                    </Button>
                    <Button
                      variant="soft"
                      size="sm"
                      icon={<Icon name="duplicate" size={14} />}
                      className="w-full justify-start"
                      onClick={() => {
                        const copy: Character = { ...active, id: makeId("char"), name: `${active.name} (copy)` };
                        dispatch({ type: "add_character", character: copy });
                        setActiveId(copy.id);
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Icon name="trash" size={14} />}
                      className="w-full justify-start"
                      onClick={() => {
                        dispatch({ type: "remove_character", id: active.id });
                        setActiveId(state.characters.find((c) => c.id !== active.id)?.id ?? null);
                      }}
                    >
                      Delete character
                    </Button>
                  </Card>
                </div>
              </div>
            </Card>

            {/* Character sheet preview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card pad className="lg:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Character sheet
                    </div>
                    <div className="font-display text-lg font-semibold text-ink">
                      Front · Side · Back
                    </div>
                  </div>
                  <Badge tone={active.locked ? "lilac" : "neutral"}>
                    {active.locked ? "Locked" : "Unlocked"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Front", url: active.sheet?.frontView },
                    { label: "Side", url: active.sheet?.sideView },
                    { label: "Back", url: active.sheet?.backView },
                  ].map((v) => (
                    <div key={v.label} className="rounded-xl bg-zinc-50 p-3 text-center">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                        {v.label}
                      </div>
                      <div className="mt-2 aspect-square overflow-hidden rounded-lg bg-white">
                        {v.url ? (
                          <img src={v.url} alt={v.label} className="h-full w-full object-contain" />
                        ) : (
                          <div className="hatch h-full w-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card pad>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Expressions
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(active.sheet?.expressions ?? []).map((u, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg bg-zinc-50">
                      <img src={u} alt={`Expression ${i}`} className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card pad>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Action poses
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(active.sheet?.poses ?? []).map((u, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg bg-zinc-50">
                      <img src={u} alt={`Pose ${i}`} className="h-full w-full object-contain" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card pad>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Consistency rules
                </div>
                <Textarea
                  rows={6}
                  className="mt-2"
                  value={active.sheet?.consistencyRules ?? ""}
                  onChange={(e) =>
                    update({
                      sheet: active.sheet
                        ? { ...active.sheet, consistencyRules: e.target.value }
                        : mockCharacterSheet(active.name),
                    })
                  }
                />
                <DevNote title="Image API hookup">
                  Replace <code>mockCharacterSheet()</code> in <code>store.ts</code> with a call to your image API,
                  passing the saved character description and reference images for consistency.
                </DevNote>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
