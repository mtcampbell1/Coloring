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

// ─── Mocked image provider ──────────────────────────────────────────────────
// Real implementation: fetch from `/api/image/generate` or call provider SDK.
// Here we just return a deterministic SVG data URL after a small delay.

export async function mockGenerateLineArt(
  page: PagePlan,
  characters: Character[],
  bookTitle: string,
  withCaption: boolean,
): Promise<string> {
  await wait(900 + Math.random() * 800);
  const svg = lineArtSVG({
    seed: `${bookTitle}-${page.pageNumber}-${page.versions.length}`,
    title: `${bookTitle} | Page ${page.pageNumber}: ${page.title}`,
    characters: page.characters
      .map((cid) => characters.find((c) => c.id === cid)?.name || "")
      .filter(Boolean) as string[],
    setting: page.setting,
    complexity: page.complexity,
    caption: withCaption ? page.caption : undefined,
  });
  return svgToDataUrl(svg);
}

export async function mockGenerateCover(
  bookTitle: string,
  subtitle: string | undefined,
  authorName: string | undefined,
  characterNames: string[],
): Promise<string> {
  await wait(1300);
  return svgToDataUrl(
    coverSVG({
      title: bookTitle,
      subtitle,
      authorName,
      characters: characterNames,
    }),
  );
}

export function mockCharacterSheet(name: string): CharacterSheet {
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

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
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
