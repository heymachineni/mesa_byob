# The BYOB Challenge — Mesa Forge interactive starter

The MSB BYOB Starter Pack, rebuilt as a responsive, interactive field guide for PGP Forge
students. Content comes from `MSB_VBC1_BYOB_Startpack_V1.docx`; the visual identity comes
from `design_system.md.docx`; the tactile interaction language is adapted from
`ginnis-post-newsletter.html`.

Those three source files are **not in this repo** — they are Mesa's internal documents and
a third party's newsletter. Everything they contribute is already extracted into
`src/content/data/*.json`, which is the content the site actually renders.

Read **`AUDIT.md`** for the content audit, the Forge↔Ginni visual mapping and the source
conflicts still open. Read **`REDESIGN.md`** for the UX critique that drove the current
structure and the QA logs for both designs.

## Two designs, one content layer

| URL | Design | Weight |
|---|---|---|
| `/` | **Riso field note** — bone paper, three inks printed out of register, one drawn thread down the left margin with a numbered stop at every section. | 39 KB gzipped |
| `/v2` | **Mesa Forge** — the aubergine/violet brand system, chaptered layout, ⌘K search. Reachable by URL only (`noindex`). | 60 KB gzipped |

Neither shares a stylesheet, a layout or a component with the other. They share only
`src/lib/content.ts` and `src/content/data/*.json`, so **a content edit updates both** and
a design change touches one. Both are verified independently by `npm run verify`.

> Source-tree note: the riso design still lives under `src/components/v2/`,
> `src/layouts/V2.astro` and `src/styles/v2/` from when it was the second variant. The
> folder names lag the URLs; renaming them is a mechanical follow-up.

## The shape of it

The section below describes the Forge design at `/v2`; the riso design at `/` uses the
same drawer and deep-link mechanics without the ⌘K search.

The whole kit is **one page**. Milestones, channel playbooks and workshops open in a
**drawer** — a single native `<dialog>` holding 26 pre-rendered panels — so a student can
inspect M1, step to M2, jump to the Influencer playbook and land back on the page without
ever losing their place.

- **26 panels**, one dialog. `showModal()` supplies focus trapping and Escape for free.
- **Deep links survive**: `?m=m4`, `?c=influencer`, `?w=ws11` open a panel directly, and
  Back closes it.
- **⌘K search** over a 100-entry index built at build time — no API, no search library.
- **13 lazy YouTube embeds.** Panels are `display:none` until opened, so their iframes are
  never fetched at all.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built site
npm run check    # type + template diagnostics
```

Node 20+ required (built and verified on Node 24). `npm run build` produces a fully static
site — no server, no database, no environment variables. It deploys as-is to Netlify,
Vercel, Cloudflare Pages, GitHub Pages, or any static host.

## Stack

- **Astro 7**, static output.
- **Zero client framework.** Every interaction — the milestone disclosure, the sticky
  journey nav, the symptom diagnostic, FAQ search, tabs, accordions, video embeds — is
  built on native semantic elements progressively enhanced with a small amount of
  TypeScript. There is no React, no hydration, and no component runtime to ship.
- **CSS custom properties** for the whole design system. No CSS framework.
- Fonts: **New York** (Apple's system serif, no download on macOS/iOS) with **Newsreader**
  as the documented free fallback elsewhere; **Manrope** for all UI and body text.

---

## How the content architecture works

```
src/content/data/*.json   ← all program content lives here
src/content.config.ts     ← Zod schemas; a bad edit fails the build, not the page
src/lib/content.ts        ← the adapter; the ONLY module components read content through
src/components, src/pages ← presentation and interaction
```

Components never import `astro:content` or a JSON file directly. They call the adapter.
That is what keeps **content**, **presentation**, and **interaction** separable — and it is
what makes a future CMS a swap of one file rather than a rebuild of the UI.

### Editing content today

Everything a non-developer would want to change is a value in `src/content/data/`:

| File | Controls |
|---|---|
| `program.json` | Hero copy, the six structure points, "what you'll gain", capital and date figures |
| `phases.json` | The four phases, their weeks, summaries and dark/light rhythm |
| `milestones.json` | M1–M8: deadlines, dates, revenue targets, deliverables, gates, escalations, mentor questions |
| `workshops.json` | WS1–WS13 |
| `channels.json` | All five playbooks — why/how/when/where, getting started, playbook steps, FAQs, troubleshooting, avoid-this, videos |
| `channel-targets.json` | The Min / Win / Budget targets per channel |
| `money.json` | Inventory and Revenue & Expenses |
| `flea.json` | Flea Market narrative, EverRaw proof, video slots |
| `faqs.json` | All 13 FAQs and their filter tags |
| `wip.json` | The "coming soon" cards for Grading and Incentives |
| `still-stuck.json` | The 1:1 prep block |

**Filling a placeholder.** Where the Starter Pack says `[Add link]`, the JSON has
`"url": null, "placeholder": true`. Put the real URL in and set `placeholder` to `false` —
the designed empty state becomes a real video card automatically.

**Resolving a disputed figure.** Values the sources disagree on carry a `*Confirming` key
(e.g. `capitalConfirming`, `dateConfirming`, `gateConfirming`). They render with a visible
asterisk and an explanation. Once Mesa confirms the value, correct the value and **delete
the `*Confirming` key** — the marker disappears on its own. See `AUDIT.md` §2 and §7.

**Publishing a WIP section.** Grading and Incentives currently render as designed
"coming soon" cards fed by `wip.json`. Replace the body text when the policy is final.

### What needs a developer

New page types or routes, new component patterns, changes to the roadmap interaction,
design tokens, and adding a genuinely new *kind* of field to a schema.

### Adding a CMS later

The recommendation in `AUDIT.md` §6 is to hold off until the content settles, then add
**Keystatic** if Mesa wants a non-developer UI. Keystatic is git-based, runs inside this
repo, needs no external service or database, and reads and writes the same JSON files these
schemas already describe — so adding it is a config addition, not a UI rebuild. Each
collection in `src/content.config.ts` maps to one Keystatic collection.

---

## Design system

Tokens live in `src/styles/tokens.css` and every visual value in the site resolves to one.

The Forge dark/light rhythm is driven by a single attribute. Any element carrying
`data-tone="dark"` (or `"deep"`, used for the Flea finale) re-points the semantic tokens,
and every component inside adapts with no dark-specific rules of its own:

```html
<section class="band" data-tone="dark"> … </section>
```

Palette weighting follows the design system's own ratio: ~60% alternating Deep Aubergine /
Lavender Mist surfaces, ~25% Royal Purple and Amethyst, ~10% Orchid for motifs, and
**Vivid Violet reserved for CTAs and gate-unlock emphasis only**. No green anywhere.

Tactile treatment — washi tape, torn edges, postmarks, the orchid dot — is a garnish layer
applied roughly once per section, sitting on top of a strict token system rather than
replacing it.

### A gotcha worth knowing

Astro does **not** forward a parent's scoped-style attribute to a child component's root
element. Passing `class="hero__comma"` to `<Comma />` silently does nothing. Wrap the
component in an element instead:

```astro
<div class="hero__comma"><Comma tone="orchid" opacity={0.13} /></div>
```

`Comma`, `Icon` and `RevenueLadder` deliberately do not accept a `class` prop so this
cannot be reintroduced by accident. The same trap bites elements *created in JS* — they
never carry the scope attribute at all, which is why the search-result styles in
`Search.astro` are `:global()`.

---

## Assets still needed from Mesa

The design system references files that were not supplied with the brief. Both are
currently drawn to their written specification as stand-ins:

- `logos/mesa_logo_on_dark.png`, `mesa_logo_on_light.png`, `mesa_logomark_tile.png` —
  `src/components/Logo.astro` is a typographic stand-in.
- `assets/brand_element_violet.png`, `brand_element_aubergine.png` — the comma/leaf in
  `src/components/Comma.astro` is an SVG approximation.

Drop the real assets in and swap the markup in those two components; nothing else depends
on them.

---

## Verified

Three scripts in `scripts/` back these — run `npm run verify` after any content edit.

**Content preservation** — all **602** substantive strings across the 11 content files are
present in the rendered page.

**Semantic mapping** — **450** checks that each item sits in its *correct* container: every
milestone deliverable inside that milestone, every channel FAQ inside that channel, every
workshop description with that workshop, plus negative checks proving no cross-panel bleed.
String presence alone is not enough.

**Structure + accessibility** — 26 panels, every `data-open` trigger resolving to a real
panel, every in-page anchor resolving, one `<h1>`, no heading skips across 204 headings,
every iframe titled, every input labelled.

**In-browser QA** (see `REDESIGN.md` for the full log)

- Zero horizontal overflow at 320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1728px —
  fixed at source, never with `overflow-x: hidden`.
- All 10 task tests pass; 26/26 deep links open the correct panel.
- Close button, Escape, backdrop and browser Back all close cleanly; stepping through
  panels adds no history entries, so Back always exits to the page.
- Drawer is a true `:modal` — native focus trap, focus enters on open.
- **0 external JavaScript files**; **60 KB gzipped** for the whole experience.
