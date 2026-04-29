# Coloring Book Studio

A polished front-end prototype for an end-to-end coloring book authoring tool.
Plan a story, build a character bible, generate page prompts, render line-art
interior pages and a full-color cover, preview at trim size, and export.

This prototype is **provider-agnostic by design**. The intended image provider
is OpenAI `gpt-image-2`, but the UI never makes real API calls — every
generation is mocked with deterministic SVG placeholders so the workflow is
fully usable offline. Swap in a real provider by replacing the mock functions
in `src/lib/store.ts`.

## Run it

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```

Open http://localhost:5173 (dev) or http://localhost:4173 (preview).

## Sample project

The app boots with a fully populated sample project so the workflow is
immediately tangible:

- Title: **Alex and Sierra Visit the Vet**
- Ages 3–5 · 12 interior pages · 8.5 × 11 portrait
- Style: preschool simple
- Output: KDP paperback / printable PDF / individual PNG pages
- Cast: Alex, Sierra (the dog), Mom, Friendly Vet — each with a reusable
  character sheet (front / side / back / 3 expressions / 3 poses)

## Sections

- **Dashboard** — at-a-glance status, hero cover, character bible, recent thumbnails.
- **New Book Wizard** — title, theme, age, trim, orientation, style, output goal.
- **Characters** — character library with sheets, lock toggle, regenerate, duplicate.
- **Story** — story generator with rewrite / simpler / funnier / educational nudges,
  per-page scene outline, captions toggle, "no-story activity book" mode.
- **Page Planner** — grid of every page with prompt editor, prompt-conflict warnings,
  approve / regenerate / duplicate / delete, version history.
- **Generate** — queue dashboard, generate all / selected / missing, retry failed,
  pause/resume, simulated cost & time estimates, cover generation.
- **Preview** — flip-book and grid views, safe-area & bleed overlays, zoom,
  "looks too detailed" and caption print warnings, download preview PDF.
- **Export** — PDF / PNG / ZIP / JSON / TXT exports (JSON & TXT are real;
  PDF/PNG/ZIP are stubbed with placeholders), KDP / Etsy package placeholders,
  print settings (DPI, trim, bleed, page numbers, captions, cover).
- **Settings** — image provider, API key field, default model (`gpt-image-2`),
  defaults for new books, content safety, commercial-use checklist.

## Backend integration points

Every API hookup is centralized in `src/lib/store.ts` and marked with
**Backend integration note** cards in the UI. Replace the mock functions
with real provider calls:

| Mock                           | Replaces                        |
|--------------------------------|---------------------------------|
| `mockGenerateLineArt()`        | Image generation API (B&W page) |
| `mockGenerateCover()`          | Image generation API (color)    |
| `mockCharacterSheet()`         | Image generation API (sheet)    |
| `regenerateStory()`            | LLM endpoint                    |
| `Export.tsx → startBuild()`    | PDF / PNG / ZIP build pipeline  |

Each generation result is stored as a `PageVersion` (prompt, image URL, model,
date, approval), so version history and audit trails are first-class.

## Design

- Tailwind 3 with a custom palette of soft pastels (peach / mint / sky / lilac)
- Inter for UI, Fraunces for display
- Rounded cards, soft shadows, and subtle motion (page-flip, pulse, shimmer)
- Left workflow nav · main canvas · right context panel · top quick actions
- Inline SVG placeholder renderer for both line-art pages and the color cover —
  outputs are deterministic given the same inputs, which makes screenshots stable

## Project structure

```
src/
  App.tsx                        # Top-level shell + provider-agnostic generation API
  lib/
    types.ts                     # Domain types (BookSettings, PagePlan, …)
    store.ts                     # Reducer, mock generators, integration points
    placeholder.ts               # SVG renderers for line-art pages and color covers
    cx.ts
  data/
    sample.ts                    # Seeded "Alex and Sierra Visit the Vet" project
  components/
    Sidebar.tsx, Topbar.tsx, RightPanel.tsx
    sections/
      Dashboard.tsx, Wizard.tsx, Characters.tsx, Story.tsx,
      Planner.tsx, Generate.tsx, Preview.tsx, Export.tsx, Settings.tsx
    ui/
      primitives.tsx             # Button, Card, Field, Input, Toggle, Badge, …
      icon.tsx                   # Tiny stroke-based icon set
```
