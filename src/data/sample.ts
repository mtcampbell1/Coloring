import type {
  AppSettings,
  BookSettings,
  Character,
  CoverArt,
  PagePlan,
  ProjectState,
  StoryOutline,
} from "../lib/types";
import { characterSheetSVG, coverSVG, lineArtSVG, svgToDataUrl } from "../lib/placeholder";

const id = (() => {
  let i = 1;
  return (p = "id") => `${p}_${(i++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
})();

const sampleBook: BookSettings = {
  title: "Alex and Sierra Visit the Vet",
  subtitle: "A Cozy Day at the Animal Clinic",
  ageRange: "3-5",
  theme: "A friendly trip to the vet with Alex and her dog Sierra",
  numPages: 12,
  trimSize: "8.5x11",
  orientation: "portrait",
  style: "preschool-simple",
  outputGoal: "kdp",
  authorName: "",
  captionsEnabled: true,
  bleed: false,
  pageNumbersEnabled: true,
  coverIncluded: true,
};

const sampleCharacters: Character[] = [
  {
    id: "char_alex",
    name: "Alex",
    age: "5",
    role: "Main character, brave little kid",
    personality: "Curious, kind, a little nervous around new places",
    outfit: "Yellow t-shirt with a paw print, blue overalls, red sneakers",
    hairstyle: "Short curly hair with a bow",
    bodyShape: "Small child, round friendly proportions",
    expressionNotes: "Big round eyes, soft smile, easy to color",
    recurringProps: "Stuffed bunny tucked under arm",
    locked: true,
  },
  {
    id: "char_sierra",
    name: "Sierra",
    age: "3 (dog years)",
    role: "Beloved family dog",
    personality: "Sweet, a bit shy at the vet, very loyal",
    outfit: "Polka-dot bandana around her neck",
    hairstyle: "Short floppy fur, droopy ears",
    bodyShape: "Medium dog, rounded belly, fluffy tail",
    expressionNotes: "Big puppy eyes, tongue often peeking out",
    recurringProps: "Squeaky bone toy, leash with stars",
    locked: true,
  },
  {
    id: "char_mom",
    name: "Mom",
    age: "30s",
    role: "Calm, supportive parent",
    personality: "Patient and reassuring",
    outfit: "Long cardigan, jeans, simple shoes",
    hairstyle: "Hair in a low bun",
    bodyShape: "Tall adult, simple silhouette",
    expressionNotes: "Soft eyes, gentle smile",
    recurringProps: "Tote bag with treats and a water bottle",
    locked: false,
  },
  {
    id: "char_vet",
    name: "Friendly Vet",
    age: "40s",
    role: "Caring veterinarian",
    personality: "Warm, funny, makes kids feel safe",
    outfit: "White lab coat with a tiny paw pin, blue scrubs",
    hairstyle: "Glasses, neat short hair",
    bodyShape: "Average adult build",
    expressionNotes: "Cheerful smile, kind eyes",
    recurringProps: "Stethoscope, clipboard with stickers",
    locked: false,
  },
];

// Build placeholder character sheets
sampleCharacters.forEach((c) => {
  c.sheet = {
    frontView: svgToDataUrl(characterSheetSVG(c.name)),
    sideView: svgToDataUrl(characterSheetSVG(`${c.name} (side)`)),
    backView: svgToDataUrl(characterSheetSVG(`${c.name} (back)`)),
    expressions: [
      svgToDataUrl(characterSheetSVG(`${c.name} - smile`)),
      svgToDataUrl(characterSheetSVG(`${c.name} - surprised`)),
      svgToDataUrl(characterSheetSVG(`${c.name} - worried`)),
    ],
    poses: [
      svgToDataUrl(characterSheetSVG(`${c.name} - pose A`)),
      svgToDataUrl(characterSheetSVG(`${c.name} - pose B`)),
      svgToDataUrl(characterSheetSVG(`${c.name} - pose C`)),
    ],
    outfitNotes: c.outfit,
    consistencyRules: `Always render ${c.name} with the outfit and hairstyle described. Keep proportions friendly and age-appropriate (${c.age}).`,
  };
});

const sampleStory: StoryOutline = {
  summary:
    "It is checkup day for Sierra! Alex packs Sierra's favorite toy, holds Mom's hand, and walks bravely into the vet clinic. Together they meet a friendly vet who shows them how a checkup works. Sierra wags her tail, Alex earns a sticker, and they walk home feeling proud.",
  lesson: "Visiting the vet is safe, and we take good care of those we love.",
  tone: "Warm, gentle, slightly playful",
  setting: "A small town veterinary clinic and the walk to and from home",
  mainCharacters: ["char_alex", "char_sierra", "char_mom", "char_vet"],
  hasText: true,
  isActivityBook: false,
};

const buildPagePrompt = (
  page: Omit<PagePlan, "prompt" | "id" | "status" | "versions" | "warnings">,
  book: BookSettings,
  characters: Character[],
) => {
  const charNames = page.characters
    .map((cid) => characters.find((c) => c.id === cid)?.name)
    .filter(Boolean)
    .join(", ");
  return [
    `Coloring book interior page ${page.pageNumber} of "${book.title}".`,
    `Scene: ${page.scene}`,
    `Featuring: ${charNames || "no characters"}.`,
    `Setting: ${page.setting}.`,
    `Emotional tone: ${page.emotionalTone}.`,
    `Style: ${book.style.replace("-", " ")} for ages ${book.ageRange}.`,
    "Black-and-white line art ONLY. Clean white background. Bold clear outlines. Large open coloring spaces.",
    "Minimal clutter. No grayscale. No gradients. No shading. No dense crosshatching. No tiny details.",
    "No logos. No watermarks.",
    book.captionsEnabled && page.caption
      ? `Single short caption text allowed: "${page.caption}". Keep text large and simple.`
      : "No text or captions.",
    "One clear dominant action. Consistent line weight. Print-ready interior page.",
    `Trim size ${book.trimSize}, ${book.orientation}. Keep important content inside safe margins.`,
    "Reference saved character bible for character consistency.",
  ].join(" ");
};

const pageSeeds: Array<Omit<PagePlan, "prompt" | "id" | "status" | "versions" | "warnings">> = [
  {
    pageNumber: 1,
    title: "Sierra's Big Day",
    summary: "Alex finds the vet appointment card on the fridge.",
    scene: "Alex stands on tiptoes pointing at a paper on the fridge. Sierra peeks up curiously.",
    characters: ["char_alex", "char_sierra"],
    setting: "Cozy home kitchen",
    emotionalTone: "Curious, gentle",
    caption: "It's checkup day for Sierra!",
    props: ["Fridge", "Magnet", "Calendar card"],
    complexity: 2,
  },
  {
    pageNumber: 2,
    title: "Packing the Bag",
    summary: "Mom helps Alex pack a small bag for Sierra.",
    scene: "Alex placing a squeaky bone in a tote while Mom kneels and smiles.",
    characters: ["char_alex", "char_mom"],
    setting: "Living room near the front door",
    emotionalTone: "Helpful",
    caption: "We pack Sierra's bone, water, and her starry leash.",
    props: ["Tote bag", "Squeaky bone", "Water bottle", "Star leash"],
    complexity: 2,
  },
  {
    pageNumber: 3,
    title: "Walking to the Vet",
    summary: "Alex and Mom walk Sierra down a friendly sidewalk.",
    scene: "Alex holds Sierra's leash, Mom holds Alex's hand. Trees and clouds in background.",
    characters: ["char_alex", "char_sierra", "char_mom"],
    setting: "Sunny neighborhood sidewalk",
    emotionalTone: "Brave, hopeful",
    caption: "Hold tight to Sierra's leash.",
    props: ["Leash", "Trees", "Clouds"],
    complexity: 3,
  },
  {
    pageNumber: 4,
    title: "Arriving at the Clinic",
    summary: "They reach the vet clinic with a big paw-print sign.",
    scene: "Front of vet clinic, Alex looks up at sign, Sierra wags tail.",
    characters: ["char_alex", "char_sierra"],
    setting: "Vet clinic exterior",
    emotionalTone: "Excited, a little nervous",
    caption: "We're here!",
    props: ["Paw-print sign", "Front door", "Welcome mat"],
    complexity: 3,
  },
  {
    pageNumber: 5,
    title: "Welcome Inside",
    summary: "A friendly receptionist greets the family.",
    scene: "Reception desk with paw stickers, kind clerk waves.",
    characters: ["char_alex", "char_sierra", "char_mom"],
    setting: "Vet clinic waiting room",
    emotionalTone: "Welcoming",
    caption: "Hello and welcome!",
    props: ["Front desk", "Paw stickers", "Pen on a string"],
    complexity: 2,
  },
  {
    pageNumber: 6,
    title: "Waiting Room Friends",
    summary: "Alex spots a cat in a carrier and a parrot on a perch.",
    scene: "Waiting room with chairs, cat in a carrier, friendly parrot.",
    characters: ["char_alex", "char_sierra"],
    setting: "Vet clinic waiting room",
    emotionalTone: "Curious",
    props: ["Cat carrier", "Parrot", "Chairs"],
    complexity: 3,
  },
  {
    pageNumber: 7,
    title: "Meeting the Vet",
    summary: "The vet kneels down to say hello.",
    scene: "Friendly vet shaking Sierra's paw while Alex watches.",
    characters: ["char_alex", "char_sierra", "char_vet"],
    setting: "Examination room",
    emotionalTone: "Reassured",
    caption: "Pleased to meet you, Sierra.",
    props: ["Stethoscope", "Treat jar"],
    complexity: 3,
  },
  {
    pageNumber: 8,
    title: "Listening to Sierra's Heart",
    summary: "The vet uses a stethoscope on Sierra's chest.",
    scene: "Vet listening, Sierra sitting calmly, Alex holding her paw.",
    characters: ["char_alex", "char_sierra", "char_vet"],
    setting: "Examination room",
    emotionalTone: "Calm",
    caption: "Sierra's heart goes thump thump.",
    props: ["Stethoscope", "Exam table"],
    complexity: 2,
  },
  {
    pageNumber: 9,
    title: "Checking Ears and Eyes",
    summary: "The vet peeks in Sierra's ears with a tiny flashlight.",
    scene: "Vet uses otoscope, Sierra looks curious, Alex giggles.",
    characters: ["char_alex", "char_sierra", "char_vet"],
    setting: "Examination room",
    emotionalTone: "Playful",
    caption: "Look here, look there!",
    props: ["Otoscope", "Flashlight"],
    complexity: 3,
  },
  {
    pageNumber: 10,
    title: "A Brave Little Shot",
    summary: "Sierra gets a quick shot. Alex is right beside her.",
    scene: "Vet gently giving a shot, Alex hugging Sierra.",
    characters: ["char_alex", "char_sierra", "char_vet"],
    setting: "Examination room",
    emotionalTone: "Brave, supportive",
    caption: "Sierra is so brave.",
    props: ["Tiny syringe (rounded, kid-safe)", "Cotton ball"],
    complexity: 2,
  },
  {
    pageNumber: 11,
    title: "A Sticker for Everyone",
    summary: "The vet gives Alex and Sierra paw-print stickers.",
    scene: "Sticker on Alex's shirt, sticker on Sierra's bandana.",
    characters: ["char_alex", "char_sierra", "char_vet"],
    setting: "Examination room",
    emotionalTone: "Proud",
    caption: "You both did wonderfully!",
    props: ["Sticker sheet", "Bandana"],
    complexity: 2,
  },
  {
    pageNumber: 12,
    title: "Walking Home Proud",
    summary: "They walk home with a happy Sierra.",
    scene: "Alex, Sierra, and Mom walking home as the sun sets.",
    characters: ["char_alex", "char_sierra", "char_mom"],
    setting: "Neighborhood sidewalk at sunset",
    emotionalTone: "Happy, content",
    caption: "Good job today, Sierra.",
    props: ["Sunset", "Sticker on shirt", "Squeaky bone"],
    complexity: 3,
  },
];

const samplePages: PagePlan[] = pageSeeds.map((seed, i) => {
  const prompt = buildPagePrompt(seed, sampleBook, sampleCharacters);
  const status = i < 8 ? "approved" : i < 11 ? "generated" : "not-generated";
  const versions =
    status !== "not-generated"
      ? [
          {
            id: id("ver"),
            imageUrl: svgToDataUrl(
              lineArtSVG({
                seed: `${sampleBook.title}-${seed.pageNumber}`,
                title: `${sampleBook.title} | Page ${seed.pageNumber}: ${seed.title}`,
                characters: seed.characters
                  .map((cid) => sampleCharacters.find((c) => c.id === cid)?.name || "")
                  .filter(Boolean) as string[],
                setting: seed.setting,
                complexity: seed.complexity,
                caption: sampleBook.captionsEnabled ? seed.caption : undefined,
              }),
            ),
            prompt,
            model: "gpt-image-2",
            createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
            approved: status === "approved",
          },
        ]
      : [];
  return {
    ...seed,
    id: id("page"),
    prompt,
    status,
    versions,
    activeVersionId: versions[0]?.id,
    warnings: seed.complexity >= 4 ? ["Looks too detailed for the chosen age range."] : [],
  };
});

const sampleCover: CoverArt = {
  imageUrl: svgToDataUrl(
    coverSVG({
      title: sampleBook.title,
      subtitle: sampleBook.subtitle,
      authorName: sampleBook.authorName,
      characters: sampleCharacters.map((c) => c.name),
    }),
  ),
  versions: [
    {
      id: id("cover"),
      imageUrl: svgToDataUrl(
        coverSVG({
          title: sampleBook.title,
          subtitle: sampleBook.subtitle,
          authorName: sampleBook.authorName,
          characters: sampleCharacters.map((c) => c.name),
        }),
      ),
      prompt: `Full-color professional children's book cover for "${sampleBook.title}". Subtitle: "${sampleBook.subtitle}". Featuring main characters Alex (a 5-year-old) and Sierra (a friendly dog). Bright, friendly, commercial quality. Clear title space at top. Front cover only. No back cover. Export-ready layout. ${sampleBook.authorName ? `Author name: "${sampleBook.authorName}".` : "No author name."}`,
      model: "gpt-image-2",
      createdAt: new Date().toISOString(),
      approved: true,
    },
  ],
  prompt: `Full-color professional children's book cover for "${sampleBook.title}".`,
  status: "approved",
};

const sampleSettings: AppSettings = {
  imageProvider: "openai-gpt-image-2",
  apiKey: "",
  model: "gpt-image-2",
  defaultTrimSize: "8.5x11",
  defaultAgeRange: "3-5",
  defaultStyle: "preschool-simple",
  defaultPromptRules: [
    "Black-and-white line art only.",
    "Clean white background.",
    "Bold clear outlines, consistent line weight.",
    "Large open coloring spaces. Minimal clutter.",
    "No grayscale, gradients, shading, or dense crosshatching.",
    "No tiny details. No logos. No watermarks.",
    "No text unless captions are enabled.",
    "One clear dominant action per page.",
    "Print-ready interior page. Keep content inside safe margins.",
  ].join("\n"),
  contentSafety: true,
  commercialUse: {
    permittedProvider: true,
    noTrademarkedCharacters: true,
    noLikenessRights: true,
    keepsRecords: false,
  },
};

export const defaultProject: ProjectState = {
  book: sampleBook,
  story: sampleStory,
  characters: sampleCharacters,
  pages: samplePages,
  cover: sampleCover,
  settings: sampleSettings,
  wizardStep: 0,
};

export { buildPagePrompt };
