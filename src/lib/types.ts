// Core domain types for Coloring Book Studio.
// Backend integration notes (see also `src/lib/store.ts`):
//   - Story generation API connects in `regenerateStory()`
//   - Character sheet generation API connects in `regenerateCharacterSheet()`
//   - Image generation API connects in `generatePage()` and `generateCover()`
//   - Image editing API connects in `editPage()`
//   - File storage / PDF / ZIP: see `lib/exporters.ts`

export type TrimSize = "8.5x11" | "8x10" | "square" | "custom";
export type Orientation = "portrait" | "landscape";
export type AgeRange =
  | "0-2"
  | "3-5"
  | "5-7"
  | "7-9"
  | "9-12"
  | "teen"
  | "adult";
export type OutputGoal =
  | "personal"
  | "etsy"
  | "kdp"
  | "classroom"
  | "therapy"
  | "custom";
export type ColoringStyle =
  | "preschool-simple"
  | "kawaii"
  | "cozy-storybook"
  | "bold-cartoon"
  | "educational-worksheet"
  | "fantasy"
  | "animals"
  | "custom";

export type PageStatus =
  | "not-generated"
  | "generating"
  | "generated"
  | "needs-review"
  | "approved";

export interface BookSettings {
  title: string;
  subtitle?: string;
  ageRange: AgeRange;
  theme: string;
  numPages: number;
  trimSize: TrimSize;
  customTrim?: { w: number; h: number };
  orientation: Orientation;
  style: ColoringStyle;
  outputGoal: OutputGoal;
  authorName?: string;
  captionsEnabled: boolean;
  bleed: boolean;
  pageNumbersEnabled: boolean;
  coverIncluded: boolean;
}

export interface CharacterSheet {
  frontView: string; // image url / placeholder
  sideView: string;
  backView: string;
  expressions: string[]; // 3
  poses: string[]; // 3
  outfitNotes: string;
  consistencyRules: string;
}

export interface Character {
  id: string;
  name: string;
  age: string;
  role: string;
  personality: string;
  outfit: string;
  hairstyle: string;
  bodyShape: string;
  expressionNotes: string;
  recurringProps: string;
  locked: boolean;
  sheet?: CharacterSheet;
  notes?: string;
}

export interface PageVersion {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
  approved: boolean;
}

export interface PagePlan {
  id: string;
  pageNumber: number;
  title: string;
  summary: string;
  scene: string;
  characters: string[]; // character ids
  setting: string;
  emotionalTone: string;
  caption?: string;
  props: string[];
  complexity: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  status: PageStatus;
  versions: PageVersion[];
  activeVersionId?: string;
  warnings: string[];
}

export interface StoryOutline {
  summary: string;
  lesson: string;
  tone: string;
  setting: string;
  mainCharacters: string[]; // character ids
  hasText: boolean;
  isActivityBook: boolean;
}

export interface CoverArt {
  imageUrl: string;
  versions: PageVersion[];
  prompt: string;
  status: PageStatus;
}

export interface AppSettings {
  imageProvider: "openai-gpt-image-2" | "stability" | "midjourney-mock" | "custom";
  apiKey: string;
  model: string;
  defaultTrimSize: TrimSize;
  defaultAgeRange: AgeRange;
  defaultStyle: ColoringStyle;
  defaultPromptRules: string;
  contentSafety: boolean;
  commercialUse: {
    permittedProvider: boolean;
    noTrademarkedCharacters: boolean;
    noLikenessRights: boolean;
    keepsRecords: boolean;
  };
}

export interface ProjectState {
  book: BookSettings;
  story: StoryOutline;
  characters: Character[];
  pages: PagePlan[];
  cover: CoverArt;
  settings: AppSettings;
  // simple wizard step pointer
  wizardStep: number;
}

export type SectionKey =
  | "dashboard"
  | "wizard"
  | "characters"
  | "story"
  | "planner"
  | "generate"
  | "preview"
  | "export"
  | "settings";
