import { useState } from "react";
import { useStore } from "../../lib/store";
import type { TrimSize } from "../../lib/types";
import { Icon, type IconName } from "../ui/icon";
import {
  Badge,
  Button,
  Card,
  DevNote,
  Field,
  ProgressBar,
  SectionHeader,
  Select,
  Toggle,
  cx,
} from "../ui/primitives";

const formats: { key: string; label: string; icon: IconName; desc: string }[] = [
  { key: "pdf", label: "Printable PDF", icon: "download", desc: "Single PDF, ready to print at home or upload to KDP." },
  { key: "png", label: "Individual PNG pages", icon: "image", desc: "Per-page PNGs, transparent or white background." },
  { key: "cover-png", label: "Cover PNG", icon: "image", desc: "Just the full-color front cover." },
  { key: "zip", label: "ZIP package", icon: "duplicate", desc: "Everything bundled, ready for delivery." },
  { key: "json-prompts", label: "Prompts JSON", icon: "edit", desc: "All page prompts as JSON for archiving." },
  { key: "json-bible", label: "Character bible JSON", icon: "users", desc: "Save the cast list with consistency rules." },
  { key: "txt-story", label: "Story outline (txt)", icon: "book", desc: "Plain-text story summary and beats." },
];

export function Export() {
  const { state, dispatch } = useStore();
  const [building, setBuilding] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startBuild = async (kind: string) => {
    setBuilding(kind);
    setProgress(0);
    for (let i = 0; i <= 100; i += 8) {
      setProgress(i);
      await new Promise((r) => setTimeout(r, 50));
    }
    setProgress(100);
    await new Promise((r) => setTimeout(r, 200));

    if (kind === "json-prompts") downloadJSON("page-prompts.json", state.pages);
    else if (kind === "json-bible") downloadJSON("character-bible.json", state.characters);
    else if (kind === "txt-story")
      downloadText(
        "story-outline.txt",
        [
          state.book.title,
          state.book.subtitle ?? "",
          "",
          state.story.summary,
          "",
          `Tone: ${state.story.tone}`,
          `Lesson: ${state.story.lesson}`,
          "",
          ...state.pages.map(
            (p) =>
              `Page ${p.pageNumber} — ${p.title}\n${p.summary}\nCaption: ${p.caption ?? "(none)"}\n`,
          ),
        ].join("\n"),
      );

    setBuilding(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Export center"
        title="Export"
        subtitle="Bundle the project for personal printing, Etsy, KDP, or as raw assets."
        actions={
          <Button
            variant="primary"
            icon={<Icon name="download" size={16} />}
            loading={building === "all"}
            onClick={() => startBuild("all")}
          >
            Build full package
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card pad>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {formats.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => startBuild(f.key)}
                  className={cx(
                    "group flex items-start gap-3 rounded-xl2 p-4 text-left ring-1 transition",
                    building === f.key
                      ? "bg-lilac-50 ring-lilac-300"
                      : "bg-white ring-zinc-200 hover:bg-zinc-50",
                  )}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-peach-100 to-lilac-100 text-ink">
                    <Icon name={f.icon} size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-base font-semibold text-ink">{f.label}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{f.desc}</div>
                    {building === f.key && (
                      <div className="mt-3">
                        <ProgressBar value={progress} max={100} tone="lilac" />
                        <div className="mt-1 text-[10px] text-zinc-500">{progress}%</div>
                      </div>
                    )}
                  </div>
                  <Icon name="chevron-right" size={16} className="mt-1 text-zinc-300" />
                </button>
              ))}
            </div>
            <DevNote title="Where to wire exports">
              <ul className="ml-4 list-disc space-y-0.5">
                <li>
                  PDF/PNG/ZIP build → server endpoint or client lib (jsPDF, pdf-lib, JSZip).
                </li>
                <li>File storage → S3 / R2 / blob storage.</li>
                <li>JSON exports already work in the prototype — see <code>downloadJSON()</code>.</li>
              </ul>
            </DevNote>
          </Card>

          <Card pad>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Marketplace placeholders
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card pad tone="warm">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base font-semibold text-ink">KDP-ready interior</div>
                  <Badge tone="peach">placeholder</Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-700">
                  Bundles trim-correct PDF with bleed and KDP cover template.
                </p>
                <Button size="sm" variant="soft" className="mt-3" icon={<Icon name="download" size={14} />}>
                  Build KDP package
                </Button>
              </Card>
              <Card pad tone="cool">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base font-semibold text-ink">Etsy printable</div>
                  <Badge tone="sky">placeholder</Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-700">
                  Bundles individual PNGs + a 1-page printable PDF + listing copy.
                </p>
                <Button size="sm" variant="soft" className="mt-3" icon={<Icon name="download" size={14} />}>
                  Build Etsy package
                </Button>
              </Card>
            </div>
          </Card>
        </div>

        {/* Print settings */}
        <div className="space-y-4">
          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Print settings
            </div>
            <div className="mt-2 space-y-3">
              <Field label="Target DPI">
                <Select
                  value="300"
                  onChange={() => {
                    /* placeholder; real export hook would change DPI */
                  }}
                >
                  <option value="150">150 DPI</option>
                  <option value="300">300 DPI</option>
                  <option value="600">600 DPI</option>
                </Select>
              </Field>
              <Field label="Trim size">
                <Select
                  value={state.book.trimSize}
                  onChange={(e) =>
                    dispatch({ type: "set_book", book: { trimSize: e.target.value as TrimSize } })
                  }
                >
                  <option value="8.5x11">8.5 × 11 in</option>
                  <option value="8x10">8 × 10 in</option>
                  <option value="square">8.5 × 8.5 in</option>
                  <option value="custom">Custom</option>
                </Select>
              </Field>
              <Toggle
                checked={state.book.bleed}
                onChange={(v) => dispatch({ type: "set_book", book: { bleed: v } })}
                label="Include bleed"
              />
              <Toggle
                checked={state.book.pageNumbersEnabled}
                onChange={(v) => dispatch({ type: "set_book", book: { pageNumbersEnabled: v } })}
                label="Page numbers"
              />
              <Toggle
                checked={state.book.captionsEnabled}
                onChange={(v) => dispatch({ type: "set_book", book: { captionsEnabled: v } })}
                label="Include captions"
              />
              <Toggle
                checked={state.book.coverIncluded}
                onChange={(v) => dispatch({ type: "set_book", book: { coverIncluded: v } })}
                label="Cover included"
              />
            </div>
          </Card>

          <Card pad>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Manifest preview
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                {state.book.title}.pdf
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                cover.png
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                pages/page_{"<n>"}.png × {state.pages.length}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                page-prompts.json
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                character-bible.json
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={12} className="text-mint-500" />
                story-outline.txt
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename);
}
function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  triggerDownload(blob, filename);
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
