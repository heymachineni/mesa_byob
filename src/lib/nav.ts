/**
 * The site's spine: one ordered list of pages. The left rail, the phone dock,
 * the prev/next footers and the old-URL redirects all read from it, so they
 * cannot disagree about what exists.
 */
export type Page = { href: string; label: string; group: string };

export const PAGES: Page[] = [
  { href: '/', label: 'Overview', group: 'The Challenge' },
  { href: '/milestones', label: 'Milestones', group: 'The Challenge' },
  { href: '/weeks', label: 'Weekly Check-ins', group: 'The Challenge' },
  { href: '/workshops', label: 'Workshops', group: 'The Challenge' },
  { href: '/playbook', label: 'Playbook', group: 'Channel Playbook' },
  { href: '/playbook/inventory', label: 'Inventory', group: 'Channel Playbook' },
  { href: '/playbook/revenue', label: 'Revenue & Expenses', group: 'Channel Playbook' },
  { href: '/playbook/offline', label: 'Offline', group: 'Channel Playbook' },
  { href: '/playbook/online-organic', label: 'Online Organic', group: 'Channel Playbook' },
  { href: '/playbook/influencer', label: 'Influencer Marketing', group: 'Channel Playbook' },
  { href: '/playbook/performance', label: 'Performance Marketing', group: 'Channel Playbook' },
  { href: '/playbook/b2b', label: 'B2B', group: 'Channel Playbook' },
  { href: '/grading', label: 'Grading', group: 'Wrap-up' },
  { href: '/incentives', label: 'Incentives', group: 'Wrap-up' },
  { href: '/flea', label: 'Flea Market', group: 'Wrap-up' },
  { href: '/faq', label: 'FAQ', group: 'Wrap-up' },
];

export function prevNext(href: string) {
  const i = PAGES.findIndex((p) => p.href === href);
  return {
    prev: i > 0 ? PAGES[i - 1] : null,
    next: i >= 0 && i < PAGES.length - 1 ? PAGES[i + 1] : null,
  };
}

/** Old single-page deep links, mapped to their new homes. */
export function legacyTarget(params: URLSearchParams): string | null {
  const m = params.get('m');
  if (m) return `/milestones#${m}`;
  const w = params.get('w');
  if (w) return `/workshops#${w}`;
  const c = params.get('c');
  if (c) return `/playbook/${c}`;
  return null;
}
