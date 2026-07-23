# The Bench Outcome-Led Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the The Bench homepage and editorial hub around outcomes, a value-first AI teammate demonstration, and the three approved content categories: Life Hacks, Work Hacks, and Time Hacks.

**Architecture:** Preserve the existing static Cloudflare Pages site. Replace the homepage presentation with an outcome-led experience, add a lightweight client-side chat interface backed by the existing recommendation function, and make the dispatches hub visibly organize content into the three editorial categories. Preserve the existing SEO/GEO files, product routes, and production release boundary.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Cloudflare Pages Functions, existing image assets, existing Anthropic-backed recommendation endpoint.

## Global Constraints

- The AI teammate is demonstrated through a useful first response before any lead capture.
- The homepage outcome language is: carry less, move faster, and build better systems.
- The visible editorial categories are exactly Life Hacks, Work Hacks, and Time Hacks.
- The canonical site source is `/Users/thebenchai/Documents/ZZ_thebench_web/thebench-love`.
- Preserve `robots.txt`, `sitemap.xml`, `llms.txt`, JSON-LD, responsive behavior, and existing product routes.
- Do not publish production changes without an explicit release checkpoint.

---

### Task 1: Replace the homepage with the outcome-led experience

**Files:**
- Modify: `index.html`
- Create: `homepage.css`
- Create: `homepage.js`

**Interfaces:**
- `homepage.js` posts `{ prompt: string }` to `/api/recommend` and renders the returned `{ recommendation: string, source: string }` response.
- The homepage renders three editorial cards with stable article URLs and category labels.

- [ ] Write the homepage markup with a clear hero, outcome cards, chat panel, solution cards, proof section, latest-content cards, and primary CTA.
- [ ] Add accessible labels, keyboard-submit behavior, visible loading state, error fallback, and mobile layout rules.
- [ ] Add the approved category labels and the existing dispatch article URLs to the latest-content cards.
- [ ] Replace the old four-equal-product framing with outcome-led language while preserving links to the existing Bench pages.

### Task 2: Turn the homepage chat into a value demonstration

**Files:**
- Modify: `functions/api/recommend.ts`
- Modify: `homepage.js`

**Interfaces:**
- The API accepts a trimmed prompt of at most 500 characters.
- The API returns a concise recommendation that identifies the desired outcome, describes one concrete action a Bench teammate could take, and names the next relevant path.

- [ ] Update the system prompt to prioritize outcomes over product labels and to avoid promising unsupported capabilities.
- [ ] Add fallback responses for life, work, time, and general business-efficiency prompts.
- [ ] Keep the current curated fallback behavior when the model key is unavailable or the upstream request fails.
- [ ] Verify the endpoint remains safe for empty input, invalid JSON, upstream errors, and long prompts.

### Task 3: Reframe the editorial hub around the three categories

**Files:**
- Modify: `pages/dispatches.html`
- Modify: the six existing `pages/dispatch-*.html` articles only where category metadata or internal links are needed

**Interfaces:**
- The dispatch hub exposes Life Hacks, Work Hacks, and Time Hacks as visible category groups.
- Existing article URLs remain stable.

- [ ] Add category navigation and category sections to the dispatch hub.
- [ ] Assign current articles to the three categories without deleting or renaming existing URLs.
- [ ] Add a founder-led editorial introduction explaining the point of view: practical AI, practical systems, and practical improvements to life and work.
- [ ] Keep every article connected to a product or outcome without turning the editorial hub into a sales page.

### Task 4: Validate the local redesign

**Files:**
- Test: `index.html`, `homepage.css`, `homepage.js`, `functions/api/recommend.ts`, `pages/dispatches.html`

- [ ] Run static HTML checks for required headings, category labels, chat endpoint, article links, canonical metadata, and JSON-LD.
- [ ] Start a local static server and verify the homepage and dispatches hub load without console errors.
- [ ] Exercise the chat with one Life Hacks prompt, one Work Hacks prompt, one Time Hacks prompt, an empty prompt, and a long prompt.
- [ ] Confirm responsive behavior at desktop and mobile widths through the local browser preview.
- [ ] Review the final diff and leave deployment untouched until Christy approves the release checkpoint.
