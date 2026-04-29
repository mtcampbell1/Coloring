import { useReducer, useState } from "react";
import "./App.css";
import { RightPanel } from "./components/RightPanel";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Characters } from "./components/sections/Characters";
import { Dashboard } from "./components/sections/Dashboard";
import { Export } from "./components/sections/Export";
import { Generate } from "./components/sections/Generate";
import { Planner } from "./components/sections/Planner";
import { Preview } from "./components/sections/Preview";
import { Settings } from "./components/sections/Settings";
import { Story } from "./components/sections/Story";
import { Wizard } from "./components/sections/Wizard";
import { defaultProject } from "./data/sample";
import {
  StoreContext,
  mockGenerateCover,
  mockGenerateLineArt,
  mockCharacterSheet,
  newPageVersion,
  reducer,
  type StoreApi,
} from "./lib/store";
import type { SectionKey } from "./lib/types";

function App() {
  const [state, dispatch] = useReducer(reducer, defaultProject);
  const [section, setSection] = useState<SectionKey>("dashboard");
  const [paused, setPaused] = useState(false);

  // ─── Provider-agnostic generation API exposed to all sections ────────────
  // Real backend wires here:
  //   - generatePage   → image generation API (default: gpt-image-2)
  //   - generateAll    → batch endpoint or queued worker
  //   - generateCover  → image generation (color)
  //   - regenerateStory → LLM endpoint
  //   - regenerateCharacter → image generation API (consistency-aware)
  const api: StoreApi = {
    state,
    dispatch,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    async generatePage(pageId) {
      const page = state.pages.find((p) => p.id === pageId);
      if (!page) return;
      dispatch({ type: "update_page", id: pageId, patch: { status: "generating" } });
      const url = await mockGenerateLineArt(
        page,
        state.characters,
        state.book.title,
        state.book.captionsEnabled,
      );
      const v = newPageVersion(url, page.prompt, state.settings.model);
      dispatch({
        type: "update_page",
        id: pageId,
        patch: {
          status: "needs-review",
          versions: [...page.versions, v],
          activeVersionId: v.id,
        },
      });
    },
    async generateAll() {
      for (const p of state.pages) {
        if (paused) break;
        await this.generatePage(p.id);
      }
    },
    async generateCover() {
      const url = await mockGenerateCover(
        state.book.title,
        state.book.subtitle,
        state.book.authorName,
        state.characters.map((c) => c.name),
      );
      dispatch({
        type: "set_cover",
        patch: {
          imageUrl: url,
          status: "needs-review",
          versions: [
            ...state.cover.versions,
            newPageVersion(url, state.cover.prompt, state.settings.model),
          ],
        },
      });
    },
    async retryFailed() {
      const failed = state.pages.filter((p) => p.status === "not-generated");
      for (const p of failed) await this.generatePage(p.id);
    },
    async regenerateStory() {
      // Placeholder. In production, call the LLM with structured output.
      dispatch({ type: "set_story", story: { ...state.story } });
    },
    async regenerateCharacter(id) {
      const c = state.characters.find((x) => x.id === id);
      if (!c) return;
      const sheet = mockCharacterSheet(c.name);
      dispatch({ type: "update_character", id, patch: { sheet } });
    },
  };

  return (
    <StoreContext.Provider value={api}>
      <div className="flex min-h-screen w-full bg-cream">
        <Sidebar active={section} onChange={setSection} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar section={section} onJump={setSection} />
          <div className="flex min-w-0 flex-1">
            <main className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-8">
              {section === "dashboard" && <Dashboard onJump={setSection} />}
              {section === "wizard" && <Wizard onJump={setSection} />}
              {section === "characters" && <Characters />}
              {section === "story" && <Story />}
              {section === "planner" && <Planner />}
              {section === "generate" && <Generate />}
              {section === "preview" && <Preview />}
              {section === "export" && <Export />}
              {section === "settings" && <Settings />}
            </main>
            <RightPanel section={section} onJump={setSection} />
          </div>
        </div>
      </div>
    </StoreContext.Provider>
  );
}

export default App;
