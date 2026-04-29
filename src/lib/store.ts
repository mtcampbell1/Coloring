import { createContext, useContext } from "react";
import type {
  Character,
  CharacterSheet,
  PagePlan,
  PageStatus,
  PageVersion,
  ProjectState,
  StoryOutline,
} from "./types";
import {
  characterSheetSVG,
  coverSVG,
  lineArtSVG,
  svgToDataUrl,
} from "./placeholder";
import { buildPagePrompt } from "../data/sample";

// ─────────────────────────────────────────────────────────────────────────────
// Backend integration points
//
//   storyApi.generate()        → Story generation API
//                                (e.g. POST /api/story  → claude/openai LLM)
//   characterApi.generate()    → Character description LLM call
//   characterApi.renderSheet() → Image generation API (consistency-aware)
//                                (e.g. POST /api/image with reference images)
//   imageApi.generatePage()    → Image generation API for B&W coloring page
//                                Default model: gpt-image-2
//   imageApi.editPage()        → Image editing API (inpaint / variation)
//   imageApi.generateCover()   → Image generation API for full-color cover
//   storage.saveProject()      → File storage / user accounts / project saving
//   exporters.toPDF()          → PDF generation (server side or client lib)
//   exporters.toZIP()          → ZIP packaging
//
// In this prototype, all of the above are stubbed with deterministic SVG
// placeholders so the UI is fully usable without real API calls.
// ─────────────────────────────────────────────────────────────────────────────

export interface StoreApi {
  state: ProjectState;
  dispatch: (action: Action) => void;
  // Generation helpers (provider-agnostic)
  generatePage: (pageId: string) => Promise<void>;
  generateAll: () => Promise<void>;
  generateCover: () => Promise<void>;
  retryFailed: () => Promise<void>;
  regenerateStory: (
    nudge?: "rewrite" | "simpler" | "funnier" | "educational" | "remove-text" | "activity-book",
  ) => Promise<void>;
  regenerateCharacter: (id: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
}

export type Action =
  | { type: "set_book"; book: Partial<ProjectState["book"]> }
  | { type: "set_settings"; settings: Partial<ProjectState["settings"]> }
  | { type: "set_story"; story: Partial<StoryOutline> }
  | { type: "add_character"; character: Character }
  | { type: "update_character"; id: string; patch: Partial<Character> }
  | { type: "remove_character"; id: string }
  | { type: "set_pages"; pages: PagePlan[] }
  | { type: "update_page"; id: string; patch: Partial<PagePlan> }
  | { type: "duplicate_page"; id: string }
  | { type: "remove_page"; id: string }
  | { type: "add_page"; page: PagePlan }
  | { type: "set_cover"; patch: Partial<ProjectState["cover"]> }
  | { type: "set_wizard_step"; step: number }
  | { type: "reset"; state: ProjectState };

export function reducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case "set_book":
      return { ...state, book: { ...state.book, ...action.book } };
    case "set_settings":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "set_story":
      return { ...state, story: { ...state.story, ...action.story } };
    case "add_character":
      return { ...state, characters: [...state.characters, action.character] };
    case "update_character":
      return {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c,
        ),
      };
    case "remove_character":
      return {
        ...state,
        characters: state.characters.filter((c) => c.id !== action.id),
      };
    case "set_pages":
      return { ...state, pages: action.pages };
    case "update_page":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      };
    case "duplicate_page": {
      const idx = state.pages.findIndex((p) => p.id === action.id);
      if (idx === -1) return state;
      const original = state.pages[idx];
      const copy: PagePlan = {
        ...original,
        id: makeId("page"),
        pageNumber: original.pageNumber + 1,
        title: `${original.title} (copy)`,
        status: "not-generated",
        versions: [],
        activeVersionId: undefined,
      };
      const next = [
        ...state.pages.slice(0, idx + 1),
        copy,
        ...state.pages.slice(idx + 1),
      ];
      // Renumber pages
      next.forEach((p, i) => (p.pageNumber = i + 1));
      return { ...state, pages: next };
    }
    case "remove_page": {
      const next = state.pages.filter((p) => p.id !== action.id);
      next.forEach((p, i) => (p.pageNumber = i + 1));
      return { ...state, pages: next };
    }
    case "add_page": {
      const next = [...state.pages, action.page];
      next.forEach((p, i) => (p.pageNumber = i + 1));
      return { ...state, pages: next };
    }
    case "set_cover":
      return { ...state, cover: { ...state.cover, ...action.patch } };
    case "set_wizard_step":
      return { ...state, wizardStep: action.step };
    case "reset":
      return action.state;
    default:
      return state;
  }
}

export const StoreContext = createContext<StoreApi | null>(null);
export function useStore() {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useStore must be inside StoreProvider");
  return v;
}

let _id = 0;
export function makeId(prefix = "id") {
  _id++;
  return `${prefix}_${Date.now().toString(36)}_${_id}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Image provider ─────────────────────────────────────────────────────────
// Default provider: Pollinations.ai (https://pollinations.ai) — free, no API
// key required, FLUX model under the hood. Returns real PNG URLs.
//
// Swap providers by changing `pollinationsUrl()` to another endpoint and
// returning either a data URL or a hosted URL. Drop-in OpenAI gpt-image-2,
// Stability, etc. all work the same way.
// ────────────────────────────────────────────────────────────────────────────

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/";
const POLLINATIONS_TEXT = "https://text.pollinations.ai/";

function pollinationsUrl(
  prompt: string,
  opts: { width: number; height: number; seed?: number; model?: string },
) {
  const params = new URLSearchParams({
    width: String(opts.width),
    height: String(opts.height),
    nologo: "true",
    enhance: "true",
    model: opts.model ?? "flux",
  });
  if (opts.seed != null) params.set("seed", String(opts.seed));
  return `${POLLINATIONS_BASE}${encodeURIComponent(prompt)}?${params.toString()}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const COLORING_RULES =
  "black and white line art coloring book page, bold clean uniform outlines, pure white background, no shading, no grayscale, no gradients, no fill, only outlines, large open coloring spaces, simple shapes, kid friendly, printable, centered composition";

const NEGATIVES = "no color, no shading, no gradients, no photorealism, no text";

async function fetchAsBlob(url: string): Promise<Blob> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.blob();
  } finally {
    clearTimeout(t);
  }
}

export async function generateLineArt(
  page: PagePlan,
  characters: Character[],
  bookTitle: string,
  withCaption: boolean,
): Promise<string> {
  const charDescriptions = page.characters
    .map((cid) => {
      const c = characters.find((x) => x.id === cid);
      if (!c) return "";
      return `${c.name} (${c.role}, ${c.outfit}, ${c.hairstyle})`;
    })
    .filter(Boolean)
    .join(", ");

  const captionPart =
    withCaption && page.caption
      ? `, with simple caption text "${page.caption}" at bottom`
      : "";

  const prompt = `${COLORING_RULES}. Scene: ${page.scene}. Featuring: ${charDescriptions}. Setting: ${page.setting}. Tone: ${page.emotionalTone}${captionPart}. ${NEGATIVES}.`;
  const seed = hashStr(`${bookTitle}-${page.pageNumber}-${page.versions.length}`);
  const url = pollinationsUrl(prompt, { width: 768, height: 1024, seed });

  try {
    await fetchAsBlob(url);
    return url;
  } catch {
    return svgToDataUrl(
      lineArtSVG({
        seed: `${bookTitle}-${page.pageNumber}`,
        title: `${bookTitle} | Page ${page.pageNumber}: ${page.title}`,
        characters: page.characters
          .map((cid) => characters.find((c) => c.id === cid)?.name || "")
          .filter(Boolean) as string[],
        setting: page.setting,
        complexity: page.complexity,
        caption: withCaption ? page.caption : undefined,
      }),
    );
  }
}

export async function generateCover(
  bookTitle: string,
  subtitle: string | undefined,
  authorName: string | undefined,
  characterNames: string[],
  style: string,
): Promise<string> {
  const prompt = [
    `professional children's book cover illustration, full color, vibrant, friendly, ${style.replaceAll("-", " ")} style`,
    `for the book titled "${bookTitle}"${subtitle ? ` with subtitle "${subtitle}"` : ""}`,
    `featuring ${characterNames.slice(0, 3).join(" and ")}`,
    "title space at top, clear focal point, commercial book cover quality, no text overlay (we will add the title later), front cover only, no back cover",
  ].join(", ");

  const seed = hashStr(`${bookTitle}-cover-${Math.floor(Date.now() / 60000)}`);
  const url = pollinationsUrl(prompt, { width: 768, height: 1024, seed });

  try {
    await fetchAsBlob(url);
    return url;
  } catch {
    return svgToDataUrl(
      coverSVG({
        title: bookTitle,
        subtitle,
        authorName,
        characters: characterNames,
      }),
    );
  }
}

export async function generateCharacterSheet(
  name: string,
  description: string,
): Promise<CharacterSheet> {
  const baseSheetPrompt = (variant: string) =>
    `${COLORING_RULES}. Single character reference, ${variant} of ${name}: ${description}. Centered, full body, plain white background. ${NEGATIVES}.`;
  const expressionPrompt = (mood: string) =>
    `${COLORING_RULES}. Portrait headshot of ${name}: ${description}, ${mood} expression, plain white background. ${NEGATIVES}.`;
  const posePrompt = (action: string) =>
    `${COLORING_RULES}. Full-body action pose of ${name}: ${description}, ${action}, plain white background. ${NEGATIVES}.`;

  const seedBase = hashStr(name);
  const u = (prompt: string, seedOffset: number) =>
    pollinationsUrl(prompt, { width: 512, height: 640, seed: seedBase + seedOffset });

  return {
    frontView: u(baseSheetPrompt("front view"), 1),
    sideView: u(baseSheetPrompt("side profile view"), 2),
    backView: u(baseSheetPrompt("back view"), 3),
    expressions: [
      u(expressionPrompt("happy smiling"), 11),
      u(expressionPrompt("surprised"), 12),
      u(expressionPrompt("worried concerned"), 13),
    ],
    poses: [
      u(posePrompt("waving hello"), 21),
      u(posePrompt("running"), 22),
      u(posePrompt("hugging a friend"), 23),
    ],
    outfitNotes: description,
    consistencyRules: `Always render ${name} with the same outfit and proportions described: ${description}.`,
  };
}

// Free LLM (Pollinations text endpoint)
export async function generateStoryText(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${POLLINATIONS_TEXT}${encodeURIComponent(prompt)}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.text();
  } catch {
    return "";
  }
}

// Backwards-compatible aliases used by App.tsx and existing UI.
export const mockGenerateLineArt = generateLineArt;
export const mockGenerateCover = (
  title: string,
  subtitle: string | undefined,
  authorName: string | undefined,
  characterNames: string[],
) => generateCover(title, subtitle, authorName, characterNames, "preschool-simple");

export function mockCharacterSheet(name: string): CharacterSheet {
  // Synchronous fallback for the seed data in `data/sample.ts`.
  const url = (suffix: string) => svgToDataUrl(characterSheetSVG(`${name}${suffix}`));
  return {
    frontView: url(""),
    sideView: url(" (side)"),
    backView: url(" (back)"),
    expressions: [url(" - smile"), url(" - surprised"), url(" - worried")],
    poses: [url(" - pose A"), url(" - pose B"), url(" - pose C")],
    outfitNotes: "",
    consistencyRules: `Always render ${name} with the saved outfit, hairstyle, and proportions.`,
  };
}

// ─── Helpers used by section components ─────────────────────────────────────

export function detectPromptConflicts(
  prompt: string,
  characters: Character[],
): string[] {
  const lc = prompt.toLowerCase();
  const conflicts: string[] = [];
  characters.forEach((c) => {
    if (!lc.includes(c.name.toLowerCase())) return;
    // outfit color conflict (simple heuristic)
    const outfit = c.outfit.toLowerCase();
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "pink",
      "orange",
      "white",
      "black",
      "brown",
    ];
    const outfitColors = colors.filter((co) => outfit.includes(co));
    const promptColors = colors.filter((co) => lc.includes(co));
    const conflict = promptColors.find(
      (pc) => outfitColors.length > 0 && !outfitColors.includes(pc),
    );
    if (conflict) {
      conflicts.push(
        `Prompt mentions "${conflict}" but ${c.name}'s saved outfit is ${c.outfit}.`,
      );
    }
  });
  return conflicts;
}

export function rebuildPagePrompt(
  page: PagePlan,
  state: ProjectState,
): string {
  return buildPagePrompt(page, state.book, state.characters);
}

export function pageStatusLabel(s: PageStatus): string {
  switch (s) {
    case "not-generated":
      return "Not generated";
    case "generating":
      return "Generating…";
    case "generated":
      return "Generated";
    case "needs-review":
      return "Needs review";
    case "approved":
      return "Approved";
  }
}

export function newPageVersion(
  imageUrl: string,
  prompt: string,
  model: string,
): PageVersion {
  return {
    id: makeId("ver"),
    imageUrl,
    prompt,
    model,
    createdAt: new Date().toISOString(),
    approved: false,
  };
}
