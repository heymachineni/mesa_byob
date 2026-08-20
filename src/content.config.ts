import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro:schema';

/**
 * Every collection is one JSON file under src/content/data — the whole Starter
 * Pack, extracted verbatim from the source document. Schemas fail the build if
 * a hand edit breaks the shape.
 */
const data = (name: string) => file(`src/content/data/${name}.json`);

const video = z.object({ title: z.string(), url: z.string(), note: z.string().optional() });

export const collections = {
  program: defineCollection({
    loader: data('program'),
    schema: z.object({
      id: z.string(),
      title: z.string(),
      programme: z.string(),
      heroKicker: z.string(),
      heroStatement: z.string(),
      heroSupport: z.string(),
      revenueTarget: z.number(),
      revenueTargetLabel: z.string(),
      capitalMaxLabel: z.string(),
      trancheLabel: z.string(),
      startLabel: z.string(),
      endLabel: z.string(),
      repaymentLabel: z.string(),
      weeks: z.number(),
      milestoneCount: z.number(),
      teamSizeLabel: z.string(),
      structure: z.array(z.object({ n: z.string(), title: z.string(), body: z.string() })),
      keyOutcome: z.string(),
      capitalNote: z.string(),
      trancheNote: z.string(),
      milestonesIntro: z.string(),
      gainsIntro: z.string(),
      gains: z.array(z.object({ title: z.string(), body: z.string() })),
      closingNote: z.string(),
      watch: video,
    }),
  }),
  phases: defineCollection({
    loader: data('phases'),
    schema: z.object({
      id: z.string(), code: z.string(), name: z.string(),
      weeks: z.string(), weekFrom: z.number(), weekTo: z.number(), summary: z.string(),
    }),
  }),
  milestones: defineCollection({
    loader: data('milestones'),
    schema: z.object({
      id: z.string(), code: z.string(), week: z.union([z.string(), z.number()]), phase: z.string(),
      deadlineLabel: z.string(), date: z.string(),
      revenueGoal: z.number(), revenueLabel: z.string(),
      headline: z.string(), deliverables: z.array(z.string()),
      gate: z.object({ name: z.string().nullable(), rule: z.string(), usedFor: z.string().optional() }).nullable(),
      note: z.string().nullable(),
    }),
  }),
  weekly: defineCollection({
    loader: data('weekly'),
    schema: z.object({ id: z.string(), week: z.string(), milestone: z.string(), focus: z.string() }),
  }),
  workshops: defineCollection({
    loader: data('workshops'),
    schema: z.object({ id: z.string(), code: z.string(), n: z.union([z.string(), z.number()]), title: z.string(), expect: z.string() }),
  }),
  channels: defineCollection({
    loader: data('channels'),
    schema: z.object({
      id: z.string(), code: z.string(), name: z.string(),
      oneLine: z.string(), tagline: z.string(),
      why: z.string(), how: z.string(), when: z.string(), where: z.string(), whatYouNeed: z.string(),
      gettingStarted: z.array(z.string()),
      playbook: z.array(z.object({ title: z.string(), body: z.string() })),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })),
      stuck: z.array(z.object({ symptom: z.string(), fix: z.string() })),
      goodLooksLike: z.string(),
      avoid: z.array(z.string()),
      videos: z.array(video),
    }),
  }),
  money: defineCollection({
    loader: data('money'),
    schema: z.object({
      id: z.string(),
      playbookLede: z.string(), playbookIntro: z.string(), videoNote: z.string(),
      inventory: z.object({
        oneLine: z.string(),
        intro: z.string(),
        terms: z.array(z.object({ term: z.string(), body: z.string() })),
        phases: z.array(z.object({ label: z.string(), body: z.string() })),
        system: z.string(), avoid: z.array(z.string()), videos: z.array(video),
      }),
      revenue: z.object({
        oneLine: z.string(),
        intro: z.string(),
        numbers: z.array(z.object({ name: z.string(), body: z.string() })),
        lens: z.array(z.object({ milestone: z.string(), revGoal: z.string(), focus: z.string(), watchFor: z.string() })),
        question: z.string(), questionBody: z.string(),
      }),
    }),
  }),
  grading: defineCollection({
    loader: data('grading'),
    schema: z.object({
      id: z.string(), title: z.string(), intro: z.string(),
      components: z.array(z.object({
        name: z.string(), weight: z.string(), body: z.string(),
        criteria: z.array(z.object({ term: z.string(), body: z.string() })).optional(),
        credits: z.array(z.object({ revenue: z.string(), credits: z.string() })).optional(),
        note: z.string().optional(),
      })),
      cgpaNote: z.string(),
    }),
  }),
  flea: defineCollection({
    loader: data('flea'),
    schema: z.object({
      id: z.string(), kicker: z.string(), lede: z.string(), headline: z.string(),
      paragraphs: z.array(z.string()),
      whyBestTitle: z.string(),
      whyBest: z.array(z.object({ title: z.string(), body: z.string() })),
      proof: z.object({ title: z.string(), body: z.string() }),
      watchTitle: z.string(), pastReelsTitle: z.string(), pastReels: z.array(video),
      realTitle: z.string(), realContent: z.array(video),
    }),
  }),
  faqs: defineCollection({
    loader: data('faqs'),
    schema: z.object({ id: z.string(), q: z.string(), a: z.string(), tags: z.array(z.string()).optional() }),
  }),
  stillStuck: defineCollection({
    loader: data('still-stuck'),
    schema: z.object({ id: z.string(), title: z.string(), body: z.string(), bring: z.array(z.string()), closing: z.string() }),
  }),
};
