# BYOB Starter Pack → Mesa Forge Interactive — Content & Design Audit

Phases 1–4 of the build brief. Written before any application code.
Sources: `MSB_VBC1_BYOB_Startpack_V1.docx`, `design_system.md.docx`, `ginnis-post-newsletter.html`.

---

## 0. Repository state (Phase 1)

**There is no existing repository.** The working folder contains three loose files — the two source
DOCX files and the Ginni newsletter HTML. No framework, routing, styling system, component library,
design tokens, build config, or deployment target exists yet.

Local toolchain available: Node v24.12.0, npm 11.6.2, git 2.50.1. Apple's **New York** serif is
present at `/System/Library/Fonts/NewYork.ttf`, so it will render natively on macOS/iOS; every other
platform needs the documented fallback (Newsreader).

Consequence: the stack is a greenfield decision, not a constraint to discover. See §6.

---

## 1. What the source actually contains

### 1.1 The embedded graphic is a primary source, not decoration

`word/media/image1.png` ("BYOB MILESTONES, DELIVERABLES & INVESTMENT GATES" + "Channel Targets") is
the single most information-dense object in the pack, and **most of it does not exist in the
document's text at all.** Text extraction alone would have silently dropped:

| Only in the image | Detail |
|---|---|
| **Calendar dates per milestone** | M1 5 Sept · M2 13/15 Sept · M3 20 Sept · M4 30 Sept · M5 9 Oct · M6 17 Oct · M7 24 Oct · M8 31 Oct |
| **Investment gate mechanics** | Gate 1 (M2), Gate 2 (M3), Gate 3 (M5), Gate 4 (M7, if required) |
| **Gate pass/fail rules** | M2: pass → ₹30K released; fail → 1 re-attempt in 48 hrs |
| **What each tranche may be spent on** | e.g. Gate 1 → raw materials, packaging, samples, logistics, first inventory batch |
| **Escalation rules** | M4: lagging teams get a mandatory review with the BYOB Lead; M5: teams below ₹50K get an emergency pivot session |
| **Default penalty** | Capital default → grade penalty |
| **The entire Channel Targets table** | 6 rows of Min / Win / Budget targets — see below |

**Channel Targets (image only, appears nowhere in the text):**

| Channel | Min | Win | Budget |
|---|---|---|---|
| Social Media | Conceptualise, shoot and cross-post 15 reels across 2 channels each | 100k+ total impressions | 1k |
| Influencer & Affiliate | TOF 50+ influencers; close 3 partnerships | ₹1,00,000+ revenue through channel | 5k |
| B2B Sales | TOF 100+ companies; close 3 deals, B2B page on site, post 3x/day on LinkedIn | ₹2,00,000+ revenue through channel | 1k |
| Performance Marketing | Make 5 ads (≥3 types) | ROAS 3+; ₹50,000+ revenue through channel | 10k |
| Direct/Offline Sales | Execute 5+ offline sales/pop-ups/activities | ₹2,50,000 revenue through channel | — |
| Flea Market | — | ₹1,00,000 at the Mesa flea | — |

> **Design insight worth using:** the five revenue "Win" targets sum to exactly ₹7,00,000
> (₹1L influencer + ₹2L B2B + ₹50K performance + ₹2.5L offline + ₹1L flea). Social Media carries an
> impressions target instead of a revenue one. This makes the ₹7L number *explainable* rather than
> arbitrary, and gives the revenue visualisation a second, channel-shaped view. This relationship is
> real and derived from the source — not invented.

### 1.2 Internal working notes that must NOT ship

The image's right-hand column and several document lines are authoring scaffolding, not student
content. These must be excluded from the product:

- Image annotations: `deliverables from influencers`, `asked sanchit (ambitious)`
- Document section markers: `- workshops`, `- Channel wise support (tab for each channel?)`,
  `- What is expected every week of 1:1 mentor checking - can we add any weekly overview?`,
  `- Flea Market + old videos`, `- FAQs`
- Typos to silently correct in presentation: `Inestment Gate` → Investment Gate; `Mesa flea` → Mesa Flea

### 1.3 Genuinely WIP / placeholder content

Not to be fabricated. Each gets a designed empty state, not a hidden section:

| Item | Source marking | Treatment |
|---|---|---|
| Incentives | `Incentives - STILL WIP` | "Coming soon" card; the six *What you will gain* items already cover the spirit |
| Grading | `Grading - STILL WIP` | "Details at the credit & grading session during orientation" — this *is* stated in FAQ 2, so the placeholder can point there |
| 3 × Flea Day reels | `[Add link]` ×3 | Designed placeholder slots labelled "pull from @mesa.school" |
| EverRaw story link | No URL given, text says "straight from Mesa's site" | Placeholder card with the ₹2.5L / 500 customers / Shark Tank S5 proof text intact |

---

## 2. Content conflicts — flagged, not silently resolved

Per the brief, these were surfaced rather than decided unilaterally. **B, C and E have since been
answered by the program team** and are recorded below for provenance.

### A. Total capital: ₹1.5L or ₹1L? — **open, and genuinely unfinalised**
- Body text: "interest-free debt of **up to ₹1.5 lakh** … tranches of **up to ₹35–40,000** each"
- Image, Gate 1: "Pass pitch → **₹30K** released"
- Money Matters, M1–M2: "Your **₹30K** tranche should mostly stay unspent"
- Image, M8: "**₹1L** repaid" and body M8: "Capital repayment (**₹1L**)"

**Program team, confirmed:** the total capital amount has not been finalised — which is precisely
why the sources disagree. The site shows ₹1.5 lakh (the Starter Pack figure) with a visible marker
stating it is not yet final. Update `capitalMaxLabel` and delete `capitalConfirming` in
`program.json` once it is decided.

Note that the ₹1L *repayment* figure is stated consistently in both sources; only the *cap* is open.

### B. Capital repayment deadline — **RESOLVED: 15 November 2026**
Neither source had it right. The Starter Pack said Oct 31, the milestones graphic said Nov 10;
the program team confirms **15 November 2026**. Now held once in `program.repaymentLabel` and
referenced from M8 and Money Matters.

### C. Program end date — **RESOLVED: 30 October 2026**
The Starter Pack prose was correct; the graphic's 31 Oct is stale.

### D. Milestone count: 7 or 8?  — non-blocking
Image header banner reads "All **7** milestones are mandatory", but the same image tabulates M1–M8 and
the body text says "your venture must hit **eight** milestones". Treating as a stale header; **8** is
correct.

### E. M2 deadline — **RESOLVED: 15 September**
The graphic read "13/15th Sept" for a single milestone; the program team confirms **15 September**.

### E2. M8 / Flea Market date — **newly open**
The graphic dates M8 to **31 Oct**, but the Challenge is now confirmed to end **30 Oct**. M8 is
"Flea Market Day (Week 8)", so it cannot fall after the end date. M8 currently shows 31 Oct with a
marker noting the inconsistency; the Flea Market date needs one confirmed value.

### F. M7 revenue typo — non-blocking
Image M7 deliverable reads "₹550 cumulative revenue"; its own Revenue Goal cell says ₹5,50,000.
Treating as a typo for ₹5,50,000.

### G. Two naming systems for the same four phases — non-blocking
- Milestones section: Discover · Build · Sell · Optimize & Close
- Money Matters + Inventory: Discover & Validate · Build & Brand · Sell & Scale · Optimize & Close

Recommendation: use the short names as canonical labels and the long ones as the phase subtitle, so
both appear and neither is contradicted.

### H. Channel names don't match between the two systems — non-blocking
The Playbook defines 5 channels (Offline, Online Organic, Influencer Marketing, Performance
Marketing, B2B). The Channel Targets image lists 6 rows using different names (Social Media,
Influencer & Affiliate, B2B Sales, Performance Marketing, Direct/Offline Sales, Flea Market).
Mapping used: Social Media → Online Organic, Direct/Offline Sales → Offline, Influencer & Affiliate →
Influencer Marketing, B2B Sales → B2B. Flea Market is not a playbook channel and is attached to the
Flea Market section instead.

### I. "Budget: 1k / 5k / 10k" is unlabelled — non-blocking
No currency, and no period (per week? per team? total?). Total across channels = 17k. Presented
verbatim with the source's own wording rather than an invented interpretation.

---

## 3. Information architecture (Phase 3)

Ten source regions become nine surfaces. Nothing is a 1:1 transcription of the document order.

| # | Route | Source material | Primary component pattern |
|---|---|---|---|
| 1 | `/` | Goal, Team, Investment, Time, What's Next, What you will gain (×6), student video | Editorial onboarding — hero statement, challenge-at-a-glance stat row, gain cards, revenue ladder teaser, journey teaser |
| 2 | `/journey` | 4 phases, M1–M8, deadlines, revenue goals, deliverables, gates, weekly check-ins | **The hero interaction.** Horizontal phase-chaptered roadmap (desktop) / vertical scroll (mobile), progressive disclosure |
| 3 | `/journey/m1`…`/m8` | Per-milestone: week, phase, date, revenue target, deliverables, gate, spend permissions, escalation, mentor question, linked workshops + channels | Deep-linkable milestone detail — a collected "artifact card" |
| 4 | `/channels` + 5 children | The whole Channel Playbook: why/how/when/where/what, getting started, playbook steps, FAQ, when-stuck, what good looks like, avoid this, watch & learn, plus Channel Targets | Sticky in-page nav + tabs + accordions + checklists + diagnostic blocks |
| 5 | `/money` | Money Matters: Inventory (4 terms, phase-by-phase, avoid, videos) + Revenue & Expenses (5 weekly numbers, milestone financial lens, the weekly question) | Explanatory diagrams + the "If I stopped today, could I repay what I owe?" callout as a memorable full-bleed moment |
| 6 | `/workshops` | WS1–WS13 | Editorial index — "13 things you'll learn before you sell", each mapped to milestone + phase |
| 7 | `/stuck` | All 5 "When you're stuck" tables (20 symptom→fix pairs) + "Still stuck?" 1:1 prep | **Symptom-first diagnostic.** Pick what's going wrong → get the source's fix. Cross-channel, so it works without knowing which channel is failing |
| 8 | `/flea-market` | Flea narrative, why it's the best day, EverRaw proof, video slots, WS13, M8 | The finale — visually distinct, darkest Forge surface, anticipation-building |
| 9 | `/faq` | 12 FAQs (+ grading/incentives WIP pointers) | Searchable accordion — "What students ask before they start" |
| — | `/watch` (or folded into sections) | 13 real YouTube/IG links + 3 placeholder reel slots | Video cards with thumbnail, title, source, lazy-loaded player |

**Cross-cutting components:** sticky journey nav, "your next unlock" contextual chip, revenue ladder
(₹0 → ₹25K → ₹75K → ₹1.5L → ₹2.75L → ₹5.5L → ₹7L+), WIP/coming-soon state, video card, callout,
mentor-question block.

**Why `/stuck` is its own surface:** the troubleshooting tables are the highest-utility content in the
pack during the actual challenge, and in the DOCX they are buried five levels deep inside each
channel. Symptom-first is how a stuck student actually arrives ("nobody is stopping at my stall"),
not channel-first.

---

## 4. Visual system mapping (Phase 4)

Forge is the identity. Ginni supplies interaction grammar only. Concretely:

| Ginni mechanic | Forge translation | Where it's used |
|---|---|---|
| Torn paper edge (`clip-path` polygon) | Same technique, far subtler — 1–2 milestone artifact cards and the Flea section only | Milestone cards, Flea hero |
| Pink washi tape | Orchid `#E4A7F3` at reduced opacity, or Vivid Violet for gate-unlock moments | Milestone cards, workshop cards |
| Sage tape | Amethyst `#5A3A8E` | Secondary cards |
| Circular postmark with `textPath` | Forge postmark — concentric ring motif + "PGP FORGE · BYOB 2026" ring text | Home hero, Flea, milestone stamps |
| Push pin | Orchid dot (the design system's documented bullet/spark accent) | Card anchors, list markers |
| Caveat handwriting | **New York / Newsreader** serif italic for expressive editorial moments — never a script face | Pull quotes, phase openers, the repayment question |
| Quicksand body | **Manrope** | All UI, labels, metadata, body |
| Space Mono kicker | Manrope with wide letter-spacing + uppercase, or a mono only for numbers/dates | Kickers, milestone codes, ₹ figures |
| Hamster mascot | **No mascot.** Forge comma/leaf motif + program-specific artifacts (stall, box, QR, ledger, stamp) as flat geometric illustrations | Phase openers, empty states |
| Dashed card borders | Retained, in `--line` tuned to Lavender Mist surfaces | Collected/artifact cards |
| Squiggle divider | Concentric-ring arc fragment or a fine Orchid rule | Section dividers |

**Palette discipline:** the design system's own ratio governs — ~60% alternating Deep Aubergine
`#2A1849` / Lavender Mist `#F5EDFB` surfaces, ~25% Royal Purple `#452A74` + Amethyst `#5A3A8E`,
~10% Orchid `#E4A7F3`, and **~5% Vivid Violet `#7C4DCC` reserved strictly for CTAs and gate-unlock
emphasis.** The dark/light chapter alternation carries the four phases. No green anywhere. No
gradient-on-every-section.

**The 80/20 rule in practice:** tactile treatment is applied to roughly one element per section —
the milestone card, the Flea hero, the repayment callout — and everything else is clean editorial
typography on flat Forge surfaces. Tape, torn edges and stamps are a garnish layer over a strict
token system, not the system itself.

---

## 5. Gamification stance

The program is already a game; the site should *name* the mechanics rather than add new ones. No XP,
no coins, no invented badges. What is used, all of it drawn from real program structure:

- **Gate 1–4** as literal unlock moments, with the source's own pass/fail rules
- "Your next unlock" / "Week 3 → Go Live" contextual framing
- The ₹ ladder as a progression track (roadmap, never implied achievement)
- "Final boss: Flea Market" — used once, at the Flea section, not as a running motif
- Escalation states named honestly (mandatory review at M4, emergency pivot below ₹50K at M5)

---

## 6. Recommended stack & content architecture

**Recommendation: Astro + TypeScript content collections, styled with CSS custom properties, React
islands only where interaction demands them.**

Why Astro over Next.js or a single HTML file:

- Content collections with Zod schemas give exactly the CONTENT / PRESENTATION / INTERACTION
  separation the brief asks for — content lives in typed data files, and a schema violation is a
  build error rather than a broken page.
- Ships zero JavaScript by default. Only the roadmap, diagnostic, FAQ search and video embeds become
  islands. This is a content site with a handful of interactive moments — the correct shape for
  Astro, and it directly serves the performance requirement.
- Static output deploys anywhere (Netlify/Vercel/Pages) with no server, no database, no auth.
- It does not preclude personalisation later: the content adapter can be swapped for a fetch without
  touching components.

**CMS: not yet — structured local content with a clean adapter, and Keystatic as the drop-in later.**

The brief warns against infrastructure for its own sake, and right now the content has unresolved
WIP areas and open questions that a CMS would not fix. The proposal:

1. **Now:** all content in `src/content/` as typed collections (`phases`, `milestones`, `workshops`,
   `channels`, `channelTargets`, `troubleshooting`, `faqs`, `videos`, `fleaMarket`, `moneyGuides`,
   `announcements`). Components read through a thin adapter, never from raw files.
2. **Later, if Mesa wants a non-developer UI:** add Keystatic. It is git-based, runs inside the same
   repo, needs no external service or database, and **reads and writes the very same content files** —
   so adding it is a config addition, not a UI rebuild.

| Who | Can change without a developer |
|---|---|
| Mesa staff (files today, Keystatic UI later) | Milestone dates, revenue targets, deliverables, gate rules, workshop titles & descriptions, all channel copy, FAQ Q&A, troubleshooting pairs, video links, filling the `[Add link]` slots, publishing the Incentives/Grading sections when ready, announcements |
| Requires a developer | New page types or routes, new component patterns, roadmap interaction changes, design tokens, schema changes (adding a *new kind of field*) |

That split is the point: everything currently marked WIP or `[Add link]` is a content edit, not a
code change.

---

## 7. Open questions

Only the ones that materially change what gets built or shown.

### Answered by the program team

| Question | Answer | Where it now lives |
|---|---|---|
| Repayment deadline | **15 November 2026** | `program.repaymentLabel`, used by M8 and Money Matters |
| Program end date | **30 October 2026** | `program.endLabel` |
| M2 deadline | **15 September** | `milestones.json` → `m2.date` |
| Total capital | **Not finalised yet** — that is the source of the conflict | Marker retained on the ₹1.5 lakh figure |

### Still open

1. **M8 / Flea Market date.** (Conflict E2.) The graphic says 31 Oct but the Challenge now ends
   30 Oct, so M8 cannot fall after it. One confirmed date resolves the last inconsistency on the
   site. Currently shown as 31 Oct with a visible marker.
2. **Total capital amount.** Not a source conflict to resolve but a decision still to be made.
   When it lands: set `capitalMaxLabel` and delete `capitalConfirming` in `program.json`.
3. **Are the Channel Targets student-facing?** They sit beside internal notes in the same graphic and
   read like an internal planning table. They are excellent content if intended for students — and
   they make ₹7L explainable — but should be confirmed before publishing. Default assumption if no
   answer: include them, minus the internal annotations.
4. **"Budget: 1k/5k/10k" — what unit and period?** (Conflict I.) Shown verbatim otherwise.

Not asked, per the brief: anything marked WIP gets a designed placeholder instead of a question.
