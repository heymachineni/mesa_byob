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


---

# Pass 8 — the sheet keeps only its content

At **≤64rem** the panel is now a bottom sheet on tablets as well as phones, and everything
that isn't the panel has moved off it:

- **Close sits above the sheet**, on the backdrop, right-aligned. It's the one control
  that dismisses everything, so it doesn't compete for room inside the sheet and it stays
  put while the panel scrolls under it. The sheet's height is capped at
  `100dvh - 4.6rem - env(safe-area-inset-top)` so there is always room for it, clear of a
  notch.
- **Stepping sits below**, pinned to the sheet's foot.
- **The context label** is in the accessibility tree only.

What's left in the top bar is the grab handle. Measured settled (transitions disabled) at
413×700 for all three sheet sizes: `translate: 0`, sheet flush to the bottom edge and full
width, close button 44px and fully on screen above the sheet, stepping row's bottom edge
exactly at the viewport bottom.

## A testing note that cost real time

Chrome **freezes CSS transitions in hidden tabs**, so an opening sheet stays pinned at its
`@starting-style` value forever. That read as a cascade bug — `translate: 0px 32px` on an
open dialog, with `.dw[open] { translate: 0 0 }` sitting right there at higher specificity
— and sent me looking for a specificity or `@starting-style` leak that did not exist. The
tell was `getAnimations()` still listing a running transition 2.5 seconds in.

Measure settled layout with `*{transition:none!important}` injected, rather than waiting
out a duration that may never elapse. Combined with the earlier IntersectionObserver
finding, the rule for this project is: **a hidden tab cannot verify anything time-based.**


---

# Pass 9 — onto the Forge palette

The second ink was a warm coral belonging to no palette. `/` now runs entirely on Mesa
Forge: **Deep Aubergine** `#2A1849` as the key, **Royal Purple** `#452A74` for headings,
**Amethyst** `#5A3A8E` as the deeper ink, **Vivid Violet** `#7C4DCC` as the accent, and
**Orchid** `#E4A7F3` carrying the out-of-register pass. Backgrounds are untouched — the
same bone stock, the same warm card, the same dark sheet.

Five token values changed and nothing else. Every dark-on-accent rule was already scoped
to the flood block, so overriding the accent to Orchid there (Vivid Violet manages only
3.27:1 on the dark sheet) flipped the polarity without touching any of the 75 call sites.
Three dead tokens went with it — `--marigold`, `--rose`, and `--sage`, the last a **green**,
which the brand rules forbid outright.

**It is measurably better, not merely on-brand.** Auditing both builds identically:

| | coral | Forge |
|---|---|---|
| contrast failures | 386 | **270** |
| "Start reading" button | 3.15:1 | **5.19:1** |
| accent on bone | 2.96:1 | **5.19:1** |

Coral never passed AA as text; Vivid Violet does.

**The cost, recorded honestly.** Coral against violet was two genuinely different inks, so
the misregistration read as a second colour pass. A violet accent with an Orchid ghost is
tonal — closer to a soft shadow than a second pull. Forge has no warm ink to replace it,
and Orchid is the only hue-distinct option but far too pale to carry text on bone. The
device is weaker; the palette is correct. That trade was made deliberately.

**Still outstanding:** `--text-faint` sits at **2.42:1** on paper across ~270 small labels
(nav links, kickers, sheet numbers) — 2.54:1 before, so marginally worse but failing either
way. The obvious fix collapses the hierarchy, since `faint` would end up darker than
`soft`. It needs those elements moved onto `--text-soft`, not a token nudge.

## The panel edge

The side panel's left edge was a 6px bar at `opacity: 0.5`, which against the dimmed
backdrop read as a smudge rather than a printed edge. It's now the same hard offset plate
the buttons sit on — solid, no opacity, locked to the edge. Horizontal only: the panel is
full height, so a diagonal offset would hang off the bottom and leave a gap at the top.
A bottom sheet has no left edge, so it takes the plate along its top instead.

Also: `TOF / MIN / WIN / BUDGET` in the channel sheet are fixed labels, and the column got
tight enough to hyphenate the longest into `BUDGE / T`. Verified by counting line boxes at
320 / 390 / 1200 that every label now sets on one line.


---

# Pass 10 — an index for the whole kit

The feedback was that content wasn't reachable. It was measurably true:

| | |
|---|---|
| Text inside **collapsed** `<details>` | 31,796 of 67,043 chars — **47%** |
| Drawer panels hidden until clicked | **26** |
| Search on this page | **none** |
| Addressable locations | 9 anchors + 26 deep links, for ~150 items |

Ctrl+F — the index a student actually reaches for — could see none of the folds
or panels. So half the kit was invisible to the browser's own find.

## A menu that is the index

Seven top-level items, 34 destinations. Three sections had no route into them at
all before this: **The brief**, **The climb** and **Questions** were unreachable
from the navigation.

The tree is rendered **once** and presented twice — a row of drop panels on a wide
screen, a full-height accordion on a narrow one. Two DOM trees would be two things
to keep in step, and they would eventually disagree.

**Labels are navigation copy; names are Mesa's.** A menu label is read while
*deciding*, so it's a noun that predicts the destination — "Revenue ladder", not
"₹7 lakhs, in seven steps". But milestone headlines, channel names and workshop
titles are programme terminology and appear verbatim, however long. Where a title
is long the fix is truncation in CSS, never a second name invented here — that is
exactly the kind of quiet drift that produced the channel-numbering mismatch.

Renames: *Weeks* → **Milestones** (you navigate to M4, not to a week), *Selling* →
**Channels** (the Starter Pack's own word), *Sessions* → **Workshops** (the data
and the panels both say workshop; only the section heading said sessions).

## Search, and the part that actually matters

The index is the one already built for the Forge design — 100 entries over the
same content, remapped onto this page's destinations. Forking it would give two
indexes over one body of content, and they would drift.

The hard part isn't matching, it's **arriving**. With 47% of the text folded away
and 26 panels unrendered, scrolling to a section drops you somewhere that still
looks empty. So a result *opens its container* first: `panel:` targets click the
page's own trigger — keeping history, focus and the scroll lock identical to a
real click — and anchor targets walk up the DOM opening every `<details>` on the
way, then scroll, then flash the destination.

A field on a wide screen; an icon opening a full-screen view on a narrow one,
where a cramped input would give cramped results.

## Now asserted, not hoped for

`scripts/verify_nav.py` runs in `npm run verify` and fails the build if any menu
row or search result points nowhere. It also checks something easy to miss: a
panel is opened by clicking one of the page's own `[data-open]` triggers, so a
panel with no trigger is unreachable however well it is linked.

    top-level items: 7
    menu rows: 39 (34 distinct destinations)
    menu covers 8 milestones, 5 channels, 13 workshops
    search entries: 100
    panels reachable: 26/26

## Costs

The page goes from **39 KB to 56 KB gzipped** — the search index inlines at
61 KB raw. And it is no longer 0 external JS: three bundles totalling **2.4 KB
gzipped**, because the menu and search share the destination-opening module
rather than duplicating it.

## Bugs the interaction pass found

| # | Bug | Root cause |
|---|---|---|
| 15 | **The whole menu was dead — no panel opened, ever.** | `[data-nav-top]` was originally `data-top`, which the revenue ladder already uses on its top bar: `<span class="climb__bar" data-top>`. The menu's own query picked up that span, `panelOf()` returned null, and setting `.hidden` on it threw on the first click — killing every handler in the file, including the burger. An attribute-name collision inside one's own page. |
| 16 | **Search results went nowhere.** | Activation was deferred with `requestAnimationFrame`, and a backgrounded tab never gets a frame. Closing the sheet is synchronous, so there was nothing to wait for — the defer bought nothing and silently broke activation whenever the tab wasn't being painted. |
| 17 | Thirteen workshops laid out in one tall column with the panel half empty. | `columns: 2` on a `display: grid` container is ignored outright. Now a column-flow grid: `grid-auto-flow: column` over seven rows. |
| 18 | The burger's close state drew a chevron, not a cross. | The two bars were in flow, so "back to centre" was a different distance for each. Positioned absolutely they're symmetric about the middle bar. |
| 19 | Search said results lived in "The journey" and "Money matters" while the menu called the same places "Milestones" and "Money". | The index carries the Forge design's vocabulary. Those are labels, not content, so they now follow the menu — and the original wording stays in the haystack, so searching "journey" still finds the milestones. |

`verify_nav.py` caught #15's rename itself on the next run, which is the point of it.

## Verified in browser

- **Menu:** six drop panels, click opens, one at a time, Escape closes, no console
  errors. Workshops in two columns at x=272 and x=856, panel 345px instead of ~500.
  Milestones shows four phase subheads over eight rows.
- **Search:** "MOQ" ranks the definition first and the milestone third; breadcrumbs
  and match highlighting present; "replies" finds "replying" (4 hits); six
  suggestions when empty; a real no-results state.
- **Activation:** a panel result opens the right panel *and* sets the deep link
  (`?c=influencer`), then closes and releases the scroll lock. A result inside a
  **collapsed** fold opens the fold and flashes it.
- **320 / 390 / 768:** no overflow, burger and search icon shown, tree opens,
  accordion expands, 54px tap targets, the dock hides while the tree is up.
- **1024 / 1280 / 1440:** no overflow, no burger, search field shown.

Scrolling could not be exercised — the tab was backgrounded throughout, and Chrome
suspends scrolling there. `scrollIntoView` is the only unverified step.


---

# Pass 11 — a menu item is two controls

Clicking a top-level item only opened its submenu; there was no way to reach the
section itself. The obvious fix — make the click do both — doesn't survive
contact with a touch screen, where one tap can only mean one thing. And if the
tap expanded the panel, the section stayed unreachable.

So each item is now **a link and a disclosure, side by side**: the label
navigates, the chevron opens the submenu. Both are real controls, both are
keyboard reachable, and the chevron carries its own screen-reader name ("What's
in Milestones") rather than being an unlabelled glyph.

On a phone that's a 303×54 label and a 54×54 chevron with no overlap — the two
meanings never share a tap. Hovering either half lights the whole item, so it
still reads as one thing. `Flea` has no chevron because it has no submenu, which
is the whole affordance: the missing chevron says it navigates.

All seven items now carry `data-spy`, so the bar also marks which section you're
in as you scroll.

Verified: clicking a label navigates and flashes the target *without* opening the
panel; clicking the chevron opens the panel and leaves the page where it was;
7 labels, 6 chevrons, no console errors, no overflow at 390.


---

# Pass 12 — stop marking whole sections

Navigating from the menu washed the screen violet. The "you were sent here" mark
was being applied to the destination whatever its size, and every top-level menu
target is a `<section>` between **158% and 352% of the viewport**:

    #brief 158%   #weeks 319%   #selling 166%   #sessions 163%
    #money 159%   #flea 352%    #breaks 248%

The mark exists to point at the line that answered your question. Painting a
section three screens tall says nothing you don't already know from the heading
you just landed on — and on the Flea's dark sheet it fought the background too.

It's now applied only to a target small enough to point at: not a `<section>`,
and under 55% of the viewport. Verified across the boundary — `#targets` (41%)
marks, `#gates` (99%) doesn't, `#climb` (a 65% section) doesn't, and a single FAQ
still opens its fold and marks itself.


---

# Pass 13 — one name per place

The rail said `05 / Sessions`, the menu said Workshops, the footer said Thirteen
sessions, and search said Workshops. Auditing all four naming surfaces — rail
mark, phone dock, menu, footer — **seven of the nine sections carried two or
three different names**.

"Sessions" was never Mesa's word. The content, the codes (WS1–WS13) and the
panels all say *workshop*; "session" appears in the source only as a generic noun
inside sentences ("Kickoff session", "the grading session"). So it was my label,
and mine to correct — not content drift.

One vocabulary now, everywhere:

| # | rail · dock · menu · footer |
|---|---|
| 01 | Overview |
| 02 | The climb |
| 03 | Milestones |
| 04 | Channels |
| 05 | Workshops |
| 06 | Revenue |
| 07 | Help |
| 08 | Flea |
| 09 | FAQ |

Two section ids were renamed to match the words above them — `#sessions` →
`#workshops` and `#asked` → `#faq` — so the URL doesn't contradict the label.
Search's group headings follow too.

And one duplicate inside the menu: `Help` (the top item) and `Troubleshooting`
(a row beneath it) pointed at the same anchor — two names for one place, which is
the thing being fixed everywhere else. The row now names the tool inside it
("Find your symptom"), and "Still stuck?" got its own `#still-stuck` target
instead of landing on the section a third time.

**A note on "Revenue":** section 06 covers COGS, marketing spend, other costs and
inventory as well as revenue — "Money" described it more completely. Renamed as
asked; worth revisiting if students read it as revenue-only.

Verified: 45 menu rows over 38 destinations and all 100 search results resolve
against the renamed ids, 26/26 panels reachable, no page references the old ids,
602 content strings and 450 mappings unchanged.


---

# Pass 14 — Mesa's own logo and typefaces

## The mark

`PG white.png` is the **white** lockup: the "Mesa / School of Business" wordmark
is 100% white — measured, not guessed — so it is invisible on this page's bone
stock. Only the tile carries colour, an `#11403b` "m" on a white rounded plate.

So the masthead uses the **mark alone**, with the white plate dropped: on bone
paper a white tile barely reads, and the plate belongs to the app icon rather
than to a masthead. Extracted, squared, and rendered at 3× for retina — 6948 ×
2424 and 472 KB becomes **95 × 84 and 4 KB**. It replaces the letter "m" that was
standing in for it, in the header and in the footer.

**Two things need a decision:**

1. **The full lockup can't go on a light header.** Showing "Mesa School of
   Business" needs a dark version of the wordmark, or a dark plate behind it.
2. **The mark is dark green.** It now sits beside a Deep Aubergine and Vivid
   Violet palette, and the brand rules for this project say no green. Mesa's own
   logo obviously outranks a palette rule I was working to — but it is a visible
   clash, and worth a look.

## The typefaces

New York for headings, Manrope for everything functional — Mesa's own files,
self-hosted. Subset to Latin plus the marks this kit actually sets (the rupee
sign, en and em dashes, curly quotes, the middot between labels, arrows):

| | source | shipped |
|---|---|---|
| New York Large Regular | 241 KB | **22 KB** |
| New York Large Italic | 249 KB | **25 KB** |
| Manrope variable (200–800) | 161 KB | **28 KB** |
| | 651 KB | **75 KB** |

One variable file covers every Manrope weight the UI uses. Both critical faces
are preloaded, since the first thing painted is set in them. Instrument Serif is
gone; the only request still leaving the page is Caveat, which appears three
times on purpose.

New York has no arrow glyph — it never did, in the source file either — but
every arrow on the page sits in a UI span, so nothing falls back.

**Licensing, worth checking before launch:** Apple licenses New York for
designing and developing apps *for Apple platforms*. Embedding it as a webfont
on a public site is not obviously covered. Newsreader — already the next name in
the stack — is the open substitute the original brief named, so swapping is a
one-line change if Mesa's counsel says so.

The 6.3 MB of source TTFs and the logo artwork stay out of the repo; what ships
is derived and committed.


---

# Pass 15 — the masthead, after Mesa's own

Taken from mesaschool.co: **logo left, everything else right**, and a mega menu
that is a small uppercase group label above **cards with a title and one line
each** — not a list of bare names you have to already know.

Adopted the structure, not the skin. Mesa's site is dark navy with rounded
cards; this one is bone stock and hard-edged, so a card here is the cream
surface with a 1.4px hairline that the rest of the page already uses, square
corners, and **the mono code in the slot where Mesa puts an icon** — M1, 01, 07.
That mapping is why the pattern transfers: the numbering was already doing an
icon's job.

**Every one of the 38 cards now carries a line of description**, and most come
from content that already existed rather than being written:

| | source |
|---|---|
| Milestones | `Week 5 · ₹1,50,000 · due 9 Oct` — week, target and deadline |
| Channels | the channel's own one-liner |
| Workshops | what to expect, clamped to two lines |
| Overview · Revenue · Help | written here — these are navigation copy |

Group labels follow: *Start here*, *The five channels*, *All thirteen*, *The
numbers*, *When you need it*, and the four phase names over the milestones.

**Search is an icon now**, at every width. The field moved into the panel the
icon opens, so the bar carries a logo, seven words and two glyphs and nothing
else. On a phone that panel is still full-screen.

The workshops panel no longer needs its two-column special case — the card grid
is `auto-fill` and flows to whatever the width allows.

**Not yet looked at.** The extension has been disconnected through this pass, so
this is build-verified only: 38 cards each with a note, header order brand → menu
→ tools, all 45 menu rows and 100 search results still resolving. Nobody has
watched the panel open.
