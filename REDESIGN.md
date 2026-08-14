# Redesign critique — reading v1 as a 21-year-old on day one

Written before touching code. Blunt on purpose.

## What already works

- The content extraction is right, and the milestone graphic mining (gates, dates, channel
  targets) is the most valuable thing in the build. None of that changes.
- The ₹7L revenue ladder is the single best moment. It makes a scary number legible.
- The symptom-first diagnostic is genuinely useful — it just doesn't feel like a *tool*.
- Typography is good. New York carries real weight.
- Content is centralised and schema-validated. Keep entirely.

## What feels like documentation

- **22 pages.** Answering "what happens in week 4?" costs a page load, a scroll, a back
  button. That's a maze, and it's the core problem.
- **Every section is introduced the same way**: kicker → serif heading → lede → grid. It's
  rhythmically flat. After three sections you stop reading headings.
- **The channel playbook is five near-identical long documents.** Correct information,
  zero sense of "pick your weapon."
- **Workshops are a wall of 13 cards** with no sense of *when* you'd need each.
- **Money Matters is two long articles.** The margin equation — the most useful idea in it —
  is a bulleted list, not a diagram.
- **Video cards are generic**: thumbnail + play button + title. Nothing invites a watch.

## What feels like noise

- **The comma motif appears on 12 of 22 pages**, always bottom-left or top-right, always
  cropped, never related to the composition. It reads as wallpaper, not brand.
- Shadows on every card. Rounded corners on everything. Everything is a card.
- Purple surfaces stacked back-to-back-to-back; the dark/light rhythm has become a drumbeat.

## What becomes what

| v1 | v2 |
|---|---|
| `/journey` + 8 milestone pages | One journey section; milestones open a **drawer** with prev/next |
| `/channels` + 5 channel pages | Five channel objects; each opens a **focused drawer** with internal accordions and channel-to-channel navigation |
| `/workshops` | A **timeline** in the journey's rhythm; each opens a compact drawer |
| `/money` | Inline section with two interactive explainers and a real margin diagram |
| `/stuck` | Inline **diagnostic tool** — symptom chips, instant answer |
| `/flea-market` | Inline **finale chapter** |
| `/faq` | Inline accordion |
| `/watch` | Dissolved — videos embed where they're relevant, plus a rail |
| Top navbar with 7 destinations | Slim auto-hiding bar + **⌘K search** |

Result: **1 page, 26 drawer panels, 0 mental transitions.** Every URL still deep-links via
query params (`?m=m4`, `?c=influencer`, `?w=ws11`) so sharing and the back button work.

## The five interactions that matter

1. **Milestone drawer with prev/next** — inspect M1…M8 without ever losing your place.
2. **⌘K search** — "MOQ", "week 4", "creators aren't replying" → straight to the answer.
3. **The diagnostic** — pick a symptom, get the fix, no scrolling.
4. **Channel drawer** — five objects, switch between them in one click.
5. **The revenue ladder** — kept, but tied to the journey rail so the climb and the
   milestones are one object.

## Where the emotional beats go

- **Open**: "Build something people will actually buy." Then the scale of it.
- **Mid**: the ₹7L climb — the "oh, this is real" moment.
- **The weekly question**: "If I stopped today, could I repay what I owe?" — full-bleed, quiet.
- **Close**: the Flea. Eight weeks of building → one day to prove it.

---

# Pass 3 — QA log

Every item below was executed in Chrome, not inferred.

## Bugs found and fixed

| # | Bug | Root cause | Impact |
|---|---|---|---|
| 1 | **Wrong panel displayed.** Chrome read "Influencer Marketing 3/5" while the body showed M1. | Each panel's scoped CSS set `display: grid`, overriding the `hidden` attribute. All 26 panels were always rendered, stacked; you saw whichever came first. | Critical — the drawer showed the wrong content. Fixed with a global `[hidden] { display: none !important }`. |
| 2 | **24px horizontal overflow at every desktop width.** | `.drawer { display: grid }` overrode the UA's `dialog:not([open]) { display: none }`, so a closed 44rem panel sat off-canvas. This was the reported "fixed width / content wider than viewport" bug. | Fixed by moving `display` onto `.drawer[open]`. |
| 3 | **Page could not be scrolled after closing a drawer.** | Close depended on `popstate` firing to actually call `dialog.close()`. When it didn't, `body.is-locked` was stranded. | Fixed: close is now deterministic, history unwinds after. |
| 4 | **Search results rendered as one run-on blob.** | Result rows are built in JS and never receive Astro's scoped-style attribute, so `.cmd__hit`'s grid never applied. | Fixed by making those selectors `:global()`. |
| 5 | **2px overflow at 320px.** | `.chapter__label` was `flex: 0 0 auto` and could not shrink. | Fixed with `flex: 0 1 auto` + wrap. |
| 6 | **Best match buried.** Searching "MOQ" put M1 above the actual MOQ definition. | Groups were ordered by a fixed array rather than by relevance. | Groups now order by their best-scoring member. |
| 7 | **"replies" returned 0 of 20** despite two symptoms saying "replying". | Literal substring matching. | Added light suffix stemming to search and both filters. |
| 8 | Two troubleshooting answers could be open at once. | Independent `<details>`. | Added `name="diagnostic"` for a native exclusive accordion. |

## Task tests

| Task | Result |
|---|---|
| 1 · Understand BYOB fast | PASS — statement, 8 weeks / 8 milestones / ₹7L / 2–3 co-founders above the fold |
| 2 · Open M1 | PASS — correct panel, one close control, Escape works, prev correctly disabled |
| 3 · M1 → M2 → M3 → M4 | PASS — context label tracks each phase; stepping adds **zero** history entries |
| 4 · Influencer playbook | PASS — all 13 required sections present, no cross-channel bleed |
| 5 · Search "MOQ" | PASS — *MOQ · Money matters → Inventory* ranks first, match highlighted |
| 6 · Search "week 4" | PASS — *M4 · First 10 customers* first |
| 7 · Search "influencer" | PASS — grouped Channels → Workshops → Journey |
| 8 · Diagnostic | PASS — correct fix each time; previous answer closes |
| 9 · YouTube | PASS — real embeds, 16:9, `loading="lazy"`, only 3 of 13 iframes laid out at rest |
| 10 · Resize | PASS — zero overflow at 320/360/390/430/768/1024/1280/1440/1728 |

Deep links: **26/26** open exactly one correct panel.
Dismissal: close button, Escape, backdrop and browser Back all close cleanly and release the scroll lock.
Accessibility: drawer is a true `:modal` (native focus trap), focus enters on open, search auto-focuses, one `<h1>`, no heading skips, every iframe titled, every input labelled.

## Non-negotiable

Nothing from the Starter Pack is removed. Every section, table, bullet, FAQ, playbook step,
troubleshooting row, video and placeholder survives — reorganised, progressively disclosed,
never deleted.


---

# v2 — a second design, at `/v2`

`/` and `/v2` are two designs over the **same content layer**. Neither shares a stylesheet,
a layout or a component with the other; only `src/lib/content.ts` and the JSON are common,
so a content edit updates both and a design change touches one.

## The idea

**A risograph-printed field note.** Three inks on bone paper — Forge violet, a warm coral,
near-black plum — printed slightly out of register, so every block has a coloured ghost
sitting a few millimetres behind it. That misregistration replaces borders, shadows and
cards entirely: it is the only graphic device on the page.

**The layout is a single drawn thread** running the full length of the page in the left
margin, with a section number pinned to it at every stop. Content hangs off it
asymmetrically. In *Weeks*, the eight milestones attach to the thread directly — the spine
of the layout and the spine of the programme are the same line.

Type is **Instrument Serif** (high-contrast, a little theatrical), **Manrope** for anything
functional, and **Caveat** exactly three times on the whole page.

## Why it isn't v1 reskinned

| | v1 | v2 |
|---|---|---|
| Structure | Centred container, stacked full-width bands | Asymmetric margin grid hung off one continuous thread |
| Surface | Cards with borders and radii | Misregistered ink blocks; no card, no border, no shadow |
| Rhythm | Section header → grid, repeated | One dominant device per section |
| Ground | Lavender/aubergine, digital | Bone paper, halftone tooth, three inks |
| Wayfinding | ⌘K search + 7-item nav | Numbered margin marks on the thread + 5-item nav |

## Verified in browser

Zero horizontal overflow at 320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1728px.
Deep links (`?m=`, `?c=`, `?w=`) open the right sheet. Close button, Escape and backdrop all
dismiss and release the scroll lock. 602 content strings and 450 semantic mappings pass on
both pages independently. 38 KB gzipped, 0 external JS files.

**Bugs found and fixed during the v2 pass**

1. The `.weeks` list auto-placed into the 104px margin column, crushing the whole section —
   it needed `grid-column: 1 / -1`.
2. `.run` sections never got the page container, so rows bled to the viewport edge.
3. `position: sticky` on the margin mark makes it its own containing block, so section
   nodes sat a full gutter off the thread; the rail is now two variables, one measured from
   the section edge and one from a grid cell's edge.
4. The drawer's `close` event is not reliably delivered in this browser, which left the page
   permanently scroll-locked. Teardown is now called inline by every dismissal path, with
   the event kept only as a backstop.
5. A `GATE 1` tag overflowed at 320px; the row meta now wraps.

---

# v2 — Pass 5 (production QA)

## Content correctness

**The Channel Targets table and the Channel Playbook disagree in the source.** The
Playbook numbers the channels 01–05 (Offline, Online Organic, Influencer, Performance,
B2B); the Channel Targets graphic lists the same channels in a different order
(Social Media, Influencer, B2B, Performance, Direct/Offline, Flea). Reading the table
top-to-bottom and opening a row therefore jumped around the numbering — tapping *B2B
Sales* opened 05, tapping *Direct/Offline Sales* opened 01.

Both orders are faithful to the document; only one can be shown. v2 now orders every
target view by the programme's own channel numbering and prints the code in each row,
so the table and the sheet it opens always agree. **No label, figure or row was
changed** — Flea Market, which has no playbook channel, sorts last.

## Bugs found and fixed

| # | Bug | Root cause |
|---|---|---|
| 1 | The travelling dot hopped down the page at every section boundary. | It picked the mark *nearest* a fixed reading line, so it handed over mid-section. It now hands over at the exact moment the incoming mark pins, and is clamped to the pin line so it never rides an outgoing mark upward. Result: one constant position, **zero movement measured across a full-page scroll**. |
| 2 | The dot sat ~9px below the line's node. | `rest` added the mark's top margin; a sticky box comes to rest with its **border** box at `inset-block-start`. |
| 3 | The dot was ~0.5px left of the 2px rail. | `Math.round()` on the translate. |
| 4 | The dot stayed on the dark Flea sheet. | The Flea has no margin mark, so the last matching section was one already scrolled past. |
| 5 | **The phone section header rendered right-aligned in the header bar.** | Chrome honours `justify-self` on block-level boxes, so the desktop `end` alignment survived into the single-column layout. |
| 6 | **The phone layout rules never applied at all.** | The `@media (max-width: 54rem)` block sat *before* the base `.run__mark` rule, which overrode it at equal specificity. |
| 7 | **The ladder bars and the split bar never animated.** | `.js .climb__s:not(.is-in)` — Astro scopes a bare `.js` to `.js[data-astro-cid-…]`, but `.js` is on `<html>`, which carries no scope attribute. The rule was silently dead. Now `:global(html.js)`. Same bug class as the earlier `:global()` search-results fix. |
| 8 | Anchors landed behind the sticky bar. | No `scroll-padding-block-start` anywhere. |
| 9 | The phone control claimed "01 The brief" while you were still on the cover. | The spy read IO entries, which only arrive on *change*, so it could not tell it had scrolled above the first section. It now tracks a live set and says "Contents" when you are nowhere in particular. |
| 10 | Cards were invisible. | `.reg` filled with `var(--paper)` — the page colour. Cards now sit on `--card` (one press darker) with a hairline edge. |

## Changed by request

Italic emphasis in the cover headline with no ghost behind it; the cover kicker is no
longer a chip; section marks moved to the **left** of the line with a tick bridging to
it; the Flea runs **edge to edge**; `₹1L on the day` reads solid coral on the dark
sheet; the dotted "being confirmed" rule is dropped inside tags; the margin equation is
a **ledger** (top line, three indented deductions, the result in ink) instead of five
ruled rows; the phone bottom bar is now **where-you-are + a chevron** opening a
nine-stop sheet.

## Verified in browser

- **Zero page overflow at 320 / 360 / 390 / 430 / 768 / 834 / 1024 / 1280 / 1440.**
  The only boxes wider than the viewport are the target table's rows, inside their own
  `overflow-x: auto` scroller.
- **26/26 panels** open exactly one correct panel from 122 triggers; scroll lock
  releases; deep links `?m=m1 ?m=m8 ?c=influencer ?c=b2b ?w=ws11` all correct.
- Phone picker: opens, closes on Escape / outside click / selection, one `aria-current`,
  label tracks the section, **48px minimum tap target**, sheet stays in the viewport.
- Ladder bars measured growing 0 → 18.7px with a 60ms per-bar stagger; split segments
  measured wiping `scale: 0 1 → 1`.
- `text-wrap: balance` on headings and `pretty` on running text, set once globally;
  no single-word last lines remain.
- 602 content strings and 450 semantic mappings pass **on both pages**. 39 KB gzipped,
  **0 external JS files**.

**Note on test harness:** IntersectionObserver does not deliver callbacks to documents
in offscreen iframes, and it does not deliver them to the extension's execution context
at all. Both produced false "the scroll spy is broken" readings before the harness was
moved on-screen and switched to observing the page's own side effects.


---

# Pass 6 — the swap, contrast, and the phone bar

## `/` and `/v2` swapped

The riso field note now serves `/`; the Mesa Forge design moved to `/v2`. Two page files
swapped with their relative import depths rewritten (13 imports down a level, 9 up), and
the `noindex` moved with the *role*, not the file — the alternate design is the one kept
out of search results, and that is now Forge. `npm run verify` passes on both pages after
the swap.

## Bugs found and fixed

| # | Bug | Root cause |
|---|---|---|
| 11 | **The Flea's proof card printed near-white text on a cream card — 1.1:1.** | `--card: var(--paper-2)` was declared on `:root`, and a custom property's `var()` is substituted **where it is declared**, not where it is used. The dark sheet inherited the already-resolved light cream while its text stayed light. `--card` and `--card-line` are now re-stated inside the `[data-ink='flood']` scope. **This is the second time this trap has bitten this build** — the first was `color: var(--text)` on `body`. |
| 12 | Small caption labels on the dark card sat at 4.05:1, under AA. | `--text-faint` was tuned against the sheet (`#1b1226`), not the card (`#251838`), which prints lighter. Raised 46% → 58%. |

Every text node in the Flea section now passes WCAG AA against its own computed
background (4.5:1 normal, 3:1 large): **0 failures**, measured element by element.

## The phone bar

The home page keeps **one** control: where you are, and a chevron opening the nine-stop
sheet. Stepping arrows belong to the panels, not the page — a page has no "next", and two
extra controls competing with the sheet made the bar busier without making it faster.

## Note on browser testing

Chrome **suspends IntersectionObserver and scrolling in hidden tabs**. When the browser
window is behind another application, every IO-driven behaviour — the reveal animations,
the travelling dot, the section spy — reads as broken. This produced several false
"the scroll spy is dead" findings across this session before `document.visibilityState`
was checked. Any future QA run should assert `visibilityState === 'visible'` first.


---

# Pass 7 — panel stepping moves to the foot

On a handheld the top corners are the furthest thing from your thumb, and prev/next is
the control you reach for most: reading M1 through M8 is eight taps. At **≤64rem** (phones
and both tablet orientations) the stepping row lifts out of the drawer's top bar and pins
to the bottom edge of the sheet — back on the left, `4/8` centred, forward on the right.

Done in CSS alone. The dialog is already a containing block (its coral register edge is
positioned against it), so the row is simply absolutely positioned; **nothing in the
markup or the script moves**, which means the disabled states, the arrow keys and the
history handling all keep working untouched. Above 64rem the row stays in the bar —
verified by stripping every `@media` block from the built CSS and confirming no
unconditional `position: absolute` rule survives.

**The duplicated heading is gone.** Every panel already printed its own identity twice:
the bar said `Discover · week 1` above a header reading `M1 · Week 1`, `channel 03 ·
Influencer Marketing` above the channel's own name, and — worst — `workshop 11 of 13`
directly beside a counter reading `11/13`. The bar label is now `sr-only`: it still names
the dialog through `aria-labelledby`, so the accessible name is unchanged, but it is no
longer a second heading on screen.

## Bugs found and fixed

| # | Bug | Root cause |
|---|---|---|
| 13 | The row pinned to the bottom of the *top bar* instead of the sheet. | `.dw__bar` is `position: relative` on phones to hang the grab handle, so it captured the absolute positioning. The bar is the first row, flush with the dialog's top edge, so the handle lands identically measured against the dialog — the bar no longer needs to be positioned. |
| 14 | The scroll area reserved no room for the row, so the last line of a panel sat under it. | `--seq-h` was declared on `.dw__seq` and read by its **sibling** `.dw__scroll`; a custom property only inherits downward, so the `calc()` was invalid and the padding computed to nothing. Declared on `.dw` instead. **Third instance of this trap in this build.** |

Verified at the touch breakpoint: row at the sheet foot for milestone, channel and
workshop panels; 44px tap targets; 68px of scroll padding reserved; counter centred
between the arrows; bar label measured at 1×1px yet still the dialog's accessible name.

## A caution about the test browser

The connected browser reported `screen.width: 413` and would not resize, so every width
passed to an iframe harness was silently clamped to 413 — an early run "at 1180px and
1440px" was really six measurements of the same phone viewport. Widths must be read back
from `contentWindow.innerWidth`, never assumed from what was requested.
