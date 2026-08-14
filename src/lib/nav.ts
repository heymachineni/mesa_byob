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
  /** Small mono prefix — a milestone code, a channel or workshop number. */
  num?: string;
  label: string;
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
  /** Lay the panel out in two columns — only Workshops needs it. */
  split?: boolean;
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
      .map((m) => ({ num: m.code, label: m.headline, target: `panel:${m.id}` })),
  }));

  return [
    {
      id: 'overview',
      label: 'Overview',
      href: '#brief',
      groups: [
        {
          items: [
            { label: 'The brief', target: '#brief' },
            { label: 'What you get', target: '#brief' },
            { label: 'Revenue ladder', target: '#climb' },
            { label: 'Capital and gates', target: '#gates' },
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
          items: channels.map((c) => ({
            num: c.code,
            label: c.name,
            target: `panel:${c.id}`,
          })),
        },
        { items: [{ label: 'Targets by channel', target: '#targets' }] },
      ],
    },
    {
      id: 'workshops',
      label: 'Workshops',
      href: '#sessions',
      split: true,
      groups: [
        {
          items: workshops.map((w) => ({
            num: String(w.n).padStart(2, '0'),
            label: w.title,
            target: `panel:${w.id}`,
          })),
        },
      ],
    },
    {
      id: 'money',
      label: 'Money',
      href: '#money',
      groups: [
        {
          items: [
            { label: 'Margin', target: '#money' },
            { label: 'Money by milestone', target: '#money' },
            { label: 'Inventory', target: '#money' },
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
          items: [
            { label: 'Troubleshooting', target: '#breaks' },
            { label: 'Questions', target: '#asked' },
            { label: 'Still stuck?', target: '#breaks' },
            { label: 'Coming soon', target: '#asked' },
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
  '#workshops': '#sessions',
  '#money': '#money',
  '#stuck': '#breaks',
  '#flea': '#flea',
  '#faq': '#asked',
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
  FAQ: 'Questions',
  'Flea Market': 'Flea',
  'Mesa Flea': 'Flea',
  'Money matters': 'Money',
  "When you're stuck": 'Troubleshooting',
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
