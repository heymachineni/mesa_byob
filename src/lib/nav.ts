/**
 * The menu tree.
 *
 * Two kinds of string live here and they follow different rules:
 *
 *   · **Labels** are navigation copy and are mine to write. A menu label is a
 *     destination name read while *deciding*, not a heading read on arrival —
 *     so: nouns, no sentences, no borrowed marketing verbs.
 *   · **Names** are programme terminology — milestone headlines, channel and
 *     workshop titles, phase names — and are reproduced verbatim. Shortening
 *     "Framework for Picking Profitable Products" would be content drift.
 *
 * Where a name is unavoidably long, the fix is truncation in CSS, not a second
 * name invented here.
 */
import {
  getMilestones,
  getPhases,
  getChannels,
  getWorkshops,
  type SearchEntry,
} from './content';

/** `#id` scrolls to an anchor; `panel:<id>` opens a drawer panel. */
export type NavTarget = string;

export type NavLeaf = {
  /** Small mono prefix — a milestone code, a channel or workshop number. It
      takes the slot an icon would occupy on Mesa's own menu. */
  num?: string;
  label: string;
  /** One line saying what's there, so the menu is readable rather than a
      list of names you have to already know. Drawn from the content where the
      content has it; written here where it doesn't. */
  note?: string;
  target: NavTarget;
};

export type NavGroup = {
  /** A non-tappable subhead. Keeps the phone tree two levels deep. */
  head?: string;
  items: NavLeaf[];
};

export type NavTop = {
  id: string;
  label: string;
  /** Where the top-level item itself goes. */
  href: string;
  /** Absent means the item navigates instead of expanding. */
  groups?: NavGroup[];
};

export async function getMenu(): Promise<NavTop[]> {
  const [milestones, phases, channels, workshops] = await Promise.all([
    getMilestones(),
    getPhases(),
    getChannels(),
    getWorkshops(),
  ]);

  /* Milestones hang off their phase, in phase order. The phase name is a
     subhead rather than a row: a student navigates to M4, never to "Build". */
  const milestoneGroups: NavGroup[] = phases.map((p) => ({
    head: `${p.name} · ${p.weeks}`,
    items: milestones
      .filter((m) => m.phase === p.id)
      .map((m) => ({
        num: m.code,
        label: m.headline,
        note: `Week ${m.week} · ${m.revenueLabel} · due ${m.date}`,
        target: `panel:${m.id}`,
      })),
  }));

  return [
    {
      id: 'overview',
      label: 'Overview',
      href: '#brief',
      groups: [
        {
          head: 'Start here',
          items: [
            { label: 'The brief', note: 'Goal, team, milestones, investment, time', target: '#brief' },
            { label: 'What you get', note: 'Six things the challenge leaves you with', target: '#brief' },
            { label: 'The climb', note: '₹0 to ₹7 lakhs, in seven steps', target: '#climb' },
            { label: 'Capital and gates', note: 'How each tranche unlocks', target: '#gates' },
          ],
        },
      ],
    },
    {
      id: 'milestones',
      label: 'Milestones',
      href: '#weeks',
      groups: milestoneGroups,
    },
    {
      id: 'channels',
      label: 'Channels',
      href: '#selling',
      groups: [
        {
          head: 'The five channels',
          items: channels.map((c) => ({
            num: c.code,
            label: c.name,
            note: c.oneLine,
            target: `panel:${c.id}`,
          })),
        },
        {
          head: 'Reference',
          items: [
            {
              label: 'Targets by channel',
              note: 'Minimums, wins and budgets',
              target: '#targets',
            },
          ],
        },
      ],
    },
    {
      id: 'workshops',
      label: 'Workshops',
      href: '#workshops',
      groups: [
        {
          head: 'All thirteen',
          items: workshops.map((w) => ({
            num: String(w.n).padStart(2, '0'),
            label: w.title,
            note: w.expect,
            target: `panel:${w.id}`,
          })),
        },
      ],
    },
    {
      id: 'money',
      label: 'Revenue',
      href: '#money',
      groups: [
        {
          head: 'The numbers',
          items: [
            { label: 'Margin', note: 'Revenue minus COGS, marketing and costs', target: '#money' },
            { label: 'Money by milestone', note: 'What to watch at each stage', target: '#money' },
            { label: 'Inventory', note: 'MOQ, safety stock, reorder point, dead stock', target: '#money' },
          ],
        },
      ],
    },
    /* Three rows didn't earn a dropdown — this one navigates. */
    { id: 'flea', label: 'Flea', href: '#flea' },
    {
      id: 'help',
      label: 'Help',
      href: '#breaks',
      groups: [
        {
          head: 'When you need it',
          items: [
            { label: 'Find your symptom', note: 'Twenty things that go wrong, and the fix', target: '#breaks' },
            { label: 'FAQ', note: 'Thirteen questions, answered', target: '#faq' },
            { label: 'Still stuck?', note: 'What to bring to your 1:1', target: '#still-stuck' },
            { label: 'Coming soon', note: 'Grading and incentives, still being written', target: '#faq' },
          ],
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------- search */

/**
 * The search index is shared with the Forge design, whose section ids differ.
 * Rather than fork the index — one index, one set of content, no chance of the
 * two drifting — its actions are remapped onto this page's anchors here.
 */
const ANCHORS: Record<string, string> = {
  '#journey': '#weeks',
  '#channels': '#selling',
  '#workshops': '#workshops',
  '#money': '#money',
  '#stuck': '#breaks',
  '#flea': '#flea',
  '#faq': '#faq',
};

export function toTarget(action: string): NavTarget {
  if (action.startsWith('open:')) return `panel:${action.slice(5)}`;
  const hash = action.slice(3);
  if (ANCHORS[hash]) return ANCHORS[hash];
  /* Per-question anchors: the Forge design numbers them `faq-…`, this one `q-…`. */
  if (hash.startsWith('#faq-')) return `#q-${hash.slice(5)}`;
  return hash;
}

/**
 * The shared index also carries the Forge design's *vocabulary* — "The
 * journey", "Money matters", "FAQ". A result that says it lives in "The
 * journey" when the menu calls it "Milestones" makes the reader translate
 * between two names for the same place. These are labels, not content, so
 * they follow the menu.
 */
const WORDS: Record<string, string> = {
  Journey: 'Milestones',
  'The journey': 'Milestones',
  'Flea Market': 'Flea',
  'Mesa Flea': 'Flea',
  'Money matters': 'Revenue',
  Money: 'Revenue',
  "When you're stuck": 'Help',
  Troubleshooting: 'Help',
  'Five ways to sell': 'Channels',
};

const reword = (s: string) =>
  s
    .split('→')
    .map((part) => {
      const t = part.trim();
      return WORDS[t] ?? t;
    })
    .join(' → ');

/** The index as this page needs it: same entries, this page's words and destinations. */
export function localise(index: SearchEntry[]) {
  return index.map((e) => ({
    t: e.title,
    s: e.sub,
    w: reword(e.where),
    g: WORDS[e.group] ?? e.group,
    /* The haystack keeps the original wording too, so someone who searches
       "journey" still finds the milestones. */
    x: `${e.text} ${reword(e.where)} ${WORDS[e.group] ?? e.group}`.toLowerCase(),
    a: toTarget(e.action),
  }));
}
