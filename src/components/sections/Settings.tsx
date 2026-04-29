import { useState } from "react";
import { useStore } from "../../lib/store";
import type { AgeRange, ColoringStyle, TrimSize } from "../../lib/types";
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
  Toggle,
  cx,
} from "../ui/primitives";

export function Settings() {
  const { state, dispatch } = useStore();
  const { settings } = state;
  const [showKey, setShowKey] = useState(false);

  const update = (patch: Partial<typeof settings>) =>
    dispatch({ type: "set_settings", settings: patch });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Configure the image provider, defaults for new books, and content safety."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card pad>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Image provider
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Default provider">
              <Select
                value={settings.imageProvider}
                onChange={(e) => update({ imageProvider: e.target.value as typeof settings.imageProvider })}
              >
                <option value="openai-gpt-image-2">OpenAI · gpt-image-2</option>
                <option value="stability">Stability · SD3</option>
                <option value="midjourney-mock">Midjourney (mock)</option>
                <option value="custom">Custom endpoint</option>
              </Select>
            </Field>
            <Field label="Default model">
              <Input
                value={settings.model}
                onChange={(e) => update({ model: e.target.value })}
                placeholder="gpt-image-2"
              />
            </Field>
            <Field
              label="API key (placeholder)"
              hint="Stored in memory only for the prototype. In production, store on the server."
            >
              <div className="flex gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  value={settings.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <Button
                  variant="soft"
                  size="md"
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </Field>
            <Field label="Connection test">
              <Button variant="soft" size="md" icon={<Icon name="refresh" size={14} />}>
                Run mock test
              </Button>
            </Field>
          </div>
          <DevNote title="Provider-agnostic">
            The UI stores nothing more than provider id, model name, and key. Swap the body of{" "}
            <code>mockGenerateLineArt()</code> in <code>store.ts</code> for the provider's SDK call.
          </DevNote>
        </Card>

        <Card pad>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            New-book defaults
          </div>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Default trim size">
              <Select
                value={settings.defaultTrimSize}
                onChange={(e) => update({ defaultTrimSize: e.target.value as TrimSize })}
              >
                <option value="8.5x11">8.5 × 11 in</option>
                <option value="8x10">8 × 10 in</option>
                <option value="square">Square</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
            <Field label="Default age range">
              <Select
                value={settings.defaultAgeRange}
                onChange={(e) => update({ defaultAgeRange: e.target.value as AgeRange })}
              >
                <option value="0-2">0–2</option>
                <option value="3-5">3–5</option>
                <option value="5-7">5–7</option>
                <option value="7-9">7–9</option>
                <option value="9-12">9–12</option>
                <option value="teen">Teen</option>
                <option value="adult">Adult</option>
              </Select>
            </Field>
            <Field label="Default coloring style">
              <Select
                value={settings.defaultStyle}
                onChange={(e) => update({ defaultStyle: e.target.value as ColoringStyle })}
              >
                <option value="preschool-simple">Preschool simple</option>
                <option value="kawaii">Kawaii</option>
                <option value="cozy-storybook">Cozy storybook</option>
                <option value="bold-cartoon">Bold cartoon</option>
                <option value="educational-worksheet">Educational worksheet</option>
                <option value="fantasy">Fantasy</option>
                <option value="animals">Animals</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
            <Field label="Content safety">
              <div
                className={cx(
                  "flex items-center justify-between rounded-xl ring-1 px-3 py-2.5 text-sm",
                  settings.contentSafety
                    ? "bg-mint-50 ring-mint-200 text-mint-500"
                    : "bg-peach-50 ring-peach-200 text-peach-500",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon name={settings.contentSafety ? "check" : "warning"} size={14} />
                  {settings.contentSafety ? "Strict (kid-safe)" : "Disabled"}
                </span>
                <Toggle
                  checked={settings.contentSafety}
                  onChange={(v) => update({ contentSafety: v })}
                  label=""
                />
              </div>
            </Field>
          </div>
        </Card>

        <Card pad className="lg:col-span-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Default prompt rules
          </div>
          <div className="mt-2">
            <Textarea
              rows={9}
              value={settings.defaultPromptRules}
              onChange={(e) => update({ defaultPromptRules: e.target.value })}
            />
          </div>
        </Card>

        <Card pad className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Commercial use checklist
            </div>
            <Badge tone={Object.values(settings.commercialUse).every(Boolean) ? "mint" : "peach"}>
              {Object.values(settings.commercialUse).filter(Boolean).length}/4 checked
            </Badge>
          </div>
          <ul className="mt-2 space-y-2">
            {([
              { key: "permittedProvider", label: "My image provider's terms allow commercial use." },
              { key: "noTrademarkedCharacters", label: "No trademarked characters / brands in my pages." },
              { key: "noLikenessRights", label: "No real-person likeness without permission." },
              { key: "keepsRecords", label: "I keep records of prompts and generations for audits." },
            ] as const).map((c) => (
              <li key={c.key} className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-lilac-400"
                  checked={settings.commercialUse[c.key]}
                  onChange={(e) =>
                    update({ commercialUse: { ...settings.commercialUse, [c.key]: e.target.checked } })
                  }
                />
                <span className="text-sm text-ink">{c.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <DevNote title="Backend hookups summary">
          <ul className="ml-4 list-disc space-y-1">
            <li>Story API → <code>regenerateStory()</code> in <code>store.ts</code></li>
            <li>Character image API → <code>mockCharacterSheet()</code></li>
            <li>Image API → <code>mockGenerateLineArt()</code> + <code>mockGenerateCover()</code></li>
            <li>Image edit API → <code>editPage()</code> stub (Planner)</li>
            <li>File storage / accounts / project saving → wire <code>saveProject()</code> stub</li>
            <li>PDF/ZIP build → wire <code>exporters.toPDF/toZIP</code> in Export center</li>
          </ul>
        </DevNote>
      </div>
    </div>
  );
}
