import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { file } from 'astro/loaders';

/**
 * CONTENT SCHEMAS — the contract between Mesa's content and the UI.
 *
 * Every piece of program content lives in src/content/data/*.json and is validated
 * here at build time. A missing revenue target or a malformed milestone is a build
 * error, not a broken page in front of a student.
 *
 * These schemas are also the map for a future Keystatic admin UI: each collection
 * below becomes a Keystatic collection pointed at the same JSON file, so a
 * non-developer can edit content without any change to the components.
 */

/* ---------------------------------------------------------------- primitives */

/**
 * A fact the sources disagree on. Rendered with a visible "being confirmed"
 * marker rather than silently asserted. See AUDIT.md §2.
 */
const confirming = z
  .object({
    /** Shown to the reader alongside the value. */
    note: z.string(),
  })
  .optional();

const video = z.object({
  title: z.string(),
  /** null = the source says [Add link]. Never invent a URL. */
  url: z.string().url().nullable(),
  source: z.string(),
  kind: z.enum(['youtube', 'instagram', 'link']).default('link'),
  /** A designed empty slot rather than a broken link. */
  placeholder: z.boolean().default(false),
  note: z.string().optional(),
});

const qa = z.object({
  q: z.string(),
  a: z.string(),
});

const stuckItem = z.object({
  symptom: z.string(),
  fix: z.string(),
});

/* -------------------------------------------------------------- collections */

const program = defineCollection({
  loader: file('src/content/data/program.json'),
  schema: z.object({
    title: z.string(),
    programme: z.string(),
    heroKicker: z.string(),
    heroStatement: z.string(),
    heroSupport: z.string(),
    revenueTarget: z.number(),
    revenueTargetLabel: z.string(),
    capitalMaxLabel: z.string(),
    capitalConfirming: confirming,
    trancheLabel: z.string(),
    startLabel: z.string(),
    endLabel: z.string(),
    endConfirming: confirming,
    /** Capital repayment deadline. Confirmed by the program team: 15 Nov 2026. */
    repaymentLabel: z.string(),
    weeks: z.number(),
    milestoneCount: z.number(),
    teamSizeLabel: z.string(),
    structure: z.array(
      z.object({ n: z.string(), title: z.string(), body: z.string() })
    ),
    keyOutcome: z.string(),
    capitalNote: z.string(),
    gainsIntro: z.string(),
    gains: z.array(z.object({ title: z.string(), body: z.string() })),
    closingNote: z.string(),
    watch: z.array(video),
  }),
});

const phases = defineCollection({
  loader: file('src/content/data/phases.json'),
  schema: z.object({
    code: z.string(),
    name: z.string(),
    /** The longer name used in the Money Matters + Inventory sections. */
    altName: z.string(),
    weeks: z.string(),
    weekFrom: z.number(),
    weekTo: z.number(),
    summary: z.string(),
    /** Short imperative lines — the "chapter" framing. */
    beats: z.array(z.string()),
    /** Drives the dark/light Forge rhythm. */
    tone: z.enum(['dark', 'light']),
  }),
});

const milestones = defineCollection({
  loader: file('src/content/data/milestones.json'),
  schema: z.object({
    code: z.string(),
    week: z.number(),
    phase: z.string(),
    deadlineLabel: z.string(),
    date: z.string(),
    dateConfirming: confirming,
    revenueGoal: z.number(),
    revenueLabel: z.string(),
    /** Short label for the roadmap chip, e.g. "Go live". */
    headline: z.string(),
    deliverables: z.array(z.string()),
    gate: z
      .object({
        name: z.string(),
        rule: z.string(),
        /** What this tranche may be spent on, per the milestone graphic. */
        spendOn: z.array(z.string()).default([]),
      })
      .nullable()
      .default(null),
    gateConfirming: confirming,
    /** e.g. mandatory review with the BYOB Lead. */
    escalation: z.string().nullable().default(null),
    /** Verbatim from the weekly 1:1 check-in table. */
    mentorQuestion: z.string(),
    /** Editorial mapping — surfaced as "most useful around", not as official. */
    workshops: z.array(z.string()).default([]),
    channels: z.array(z.string()).default([]),
  }),
});

const workshops = defineCollection({
  loader: file('src/content/data/workshops.json'),
  schema: z.object({
    code: z.string(),
    n: z.number(),
    title: z.string(),
    expect: z.string(),
    /** Editorial mapping, see AUDIT.md §3. */
    milestone: z.string(),
    phase: z.string(),
  }),
});

const channels = defineCollection({
  loader: file('src/content/data/channels.json'),
  schema: z.object({
    code: z.string(),
    name: z.string(),
    oneLine: z.string(),
    tagline: z.string(),
    why: z.string(),
    how: z.string(),
    when: z.string(),
    where: z.string(),
    whatYouNeed: z.string(),
    gettingStarted: z.array(z.string()),
    playbook: z.array(z.object({ title: z.string(), body: z.string() })),
    faqs: z.array(qa).default([]),
    stuck: z.array(stuckItem),
    goodLooksLike: z.string(),
    avoid: z.array(z.string()),
    videos: z.array(video).default([]),
    /** id in channel-targets.json, if one maps. */
    target: z.string().nullable().default(null),
  }),
});

const channelTargets = defineCollection({
  loader: file('src/content/data/channel-targets.json'),
  schema: z.object({
    name: z.string(),
    /** Top of funnel volume, where the source states one. */
    tof: z.string().nullable().default(null),
    min: z.array(z.string()).default([]),
    win: z.array(z.string()).default([]),
    /** Verbatim from the source — unit and period are unstated. See AUDIT.md §2I. */
    budget: z.string().nullable().default(null),
    /** Revenue component of the win target, where it is a rupee figure. */
    winRevenue: z.number().nullable().default(null),
    /** Which playbook channel this row maps to, if any. */
    channel: z.string().nullable().default(null),
    /** Any additional verbatim line from the source table. */
    note: z.string().nullable().default(null),
  }),
});

const money = defineCollection({
  loader: file('src/content/data/money.json'),
  schema: z.object({
    inventory: z.object({
      intro: z.string(),
      terms: z.array(z.object({ term: z.string(), body: z.string() })),
      phases: z.array(z.object({ label: z.string(), body: z.string() })),
      system: z.string(),
      avoid: z.array(z.string()),
      videos: z.array(video),
    }),
    revenue: z.object({
      intro: z.string(),
      numbers: z.array(z.object({ name: z.string(), body: z.string() })),
      lens: z.array(
        z.object({
          milestone: z.string(),
          revGoal: z.string(),
          focus: z.string(),
          watchFor: z.string(),
        })
      ),
      question: z.string(),
      questionBody: z.string(),
    }),
  }),
});

const flea = defineCollection({
  loader: file('src/content/data/flea.json'),
  schema: z.object({
    kicker: z.string(),
    lede: z.string(),
    paragraphs: z.array(z.string()),
    whyBestTitle: z.string(),
    whyBest: z.array(z.object({ title: z.string(), body: z.string() })),
    proof: z.object({
      title: z.string(),
      body: z.string(),
      link: video,
    }),
    watchIntro: z.string(),
    pastReels: z.array(video),
    realContent: z.array(video),
    placeholderNote: z.string(),
  }),
});

const faqs = defineCollection({
  loader: file('src/content/data/faqs.json'),
  schema: z.object({
    q: z.string(),
    a: z.string(),
    /** Powers the filter chips on /faq. */
    tags: z.array(z.string()).default([]),
  }),
});

const wip = defineCollection({
  loader: file('src/content/data/wip.json'),
  schema: z.object({
    title: z.string(),
    body: z.string(),
    /** Where students can find out more in the meantime, if anywhere. */
    pointer: z.string().nullable().default(null),
  }),
});

const stillStuck = defineCollection({
  loader: file('src/content/data/still-stuck.json'),
  schema: z.object({
    title: z.string(),
    body: z.string(),
    bring: z.array(z.string()),
    closing: z.string(),
    videoNote: z.string(),
  }),
});

export const collections = {
  program,
  phases,
  milestones,
  workshops,
  channels,
  channelTargets,
  money,
  flea,
  faqs,
  wip,
  stillStuck,
};
