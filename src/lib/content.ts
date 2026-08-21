/**
 * The only module that touches astro:content. Pages import from here, so a
 * collection rename is one change, not fifteen.
 */
import { getCollection } from 'astro:content';

export async function getProgram() {
  const p = await getCollection('program');
  return p[0].data;
}

export async function getPhases() {
  const p = await getCollection('phases');
  return p.map((x) => x.data).sort((a, b) => a.code.localeCompare(b.code));
}

export async function getMilestones() {
  const m = await getCollection('milestones');
  return m.map((x) => x.data).sort((a, b) => a.code.localeCompare(b.code));
}

export async function getWeekly() {
  const w = await getCollection('weekly');
  return w.map((x) => x.data).sort((a, b) => Number(a.id.slice(2)) - Number(b.id.slice(2)));
}

export async function getWorkshops() {
  const w = await getCollection('workshops');
  return w.map((x) => x.data).sort((a, b) => Number(a.n) - Number(b.n));
}

export async function getChannels() {
  const c = await getCollection('channels');
  return c.map((x) => x.data).sort((a, b) => a.code.localeCompare(b.code));
}

export async function getChannel(id: string) {
  return (await getChannels()).find((c) => c.id === id) ?? null;
}

export async function getMoney() {
  const m = await getCollection('money');
  return m[0].data;
}

export async function getGrading() {
  const g = await getCollection('grading');
  return g[0].data;
}

export async function getFaqs() {
  return (await getCollection('faqs')).map((x) => x.data);
}

export async function getFlea() {
  const f = await getCollection('flea');
  return f[0].data;
}

export async function getStillStuck() {
  const s = await getCollection('stillStuck');
  return s[0].data;
}

/**
 * Chart labels only: one compact format for every bar — K under a lakh,
 * L at and above it (₹25K, ₹1.5L, ₹2.75L, ₹7L+). Milestone cards keep the
 * document's full figures.
 */
function compactINR(n: number, plus: boolean) {
  const s = n >= 100000
    ? `${parseFloat((n / 100000).toFixed(2))}L`
    : `${parseFloat((n / 1000).toFixed(1))}K`;
  return `₹${s}${plus ? '+' : ''}`;
}

/** The revenue climb, straight from the milestone goals. */
export async function getRevenueLadder() {
  const ms = await getMilestones();
  const top = Math.max(...ms.map((m) => m.revenueGoal));
  return [
    { label: '₹0', fraction: 0, codes: 'Weeks 1-2', isTarget: false },
    ...ms
      .filter((m) => m.revenueGoal > 0)
      .map((m) => ({
        label: compactINR(m.revenueGoal, m.revenueLabel.trim().endsWith('+')),
        fraction: m.revenueGoal / top,
        codes: `Week ${m.week}`,
        isTarget: m.revenueGoal >= top,
      })),
  ];
}

/* ------------------------------------------------------------------ search */

export type SearchEntry = {
  /** Where activating the result goes — a real page URL, hash included. */
  url: string;
  title: string;
  sub: string;
  where: string;
  group: string;
  /** Lowercased haystack; never rendered. */
  text: string;
};

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [milestones, phases, weekly, workshops, channels, money, grading, faqs, flea] =
    await Promise.all([
      getMilestones(), getPhases(), getWeekly(), getWorkshops(), getChannels(),
      getMoney(), getGrading(), getFaqs(), getFlea(),
    ]);

  const out: SearchEntry[] = [];
  const add = (e: Omit<SearchEntry, 'text'> & { text?: string }) =>
    out.push({ ...e, text: `${e.title} ${e.sub} ${e.where} ${e.group} ${e.text ?? ''}`.toLowerCase() });

  for (const m of milestones) {
    const phase = phases.find((p) => p.id === m.phase);
    add({
      url: `/milestones#${m.id}`,
      title: `${m.code} · ${m.headline}`,
      sub: `Week ${m.week} · ${m.revenueLabel} · due ${m.date}`,
      group: 'Milestones',
      where: `Milestones → ${phase?.name ?? ''}`,
      text: [m.deliverables.join(' '), m.gate?.rule, m.gate?.usedFor, m.note, `week ${m.week}`].filter(Boolean).join(' '),
    });
  }
  for (const w of weekly) {
    add({
      url: `/weeks#${w.id}`,
      title: `${w.week.replace(/^Wk\s*/, 'Week ')} check-in`,
      sub: w.focus.slice(0, 90),
      group: 'Weekly Check-ins',
      where: 'Weekly Check-ins',
      text: `${w.milestone} ${w.focus}`,
    });
  }
  for (const w of workshops) {
    add({
      url: `/workshops#${w.id}`,
      title: `${w.n} · ${w.title}`,
      sub: w.expect.slice(0, 90),
      group: 'Workshops',
      where: `Workshops → ${w.n}`,
      text: w.expect,
    });
  }
  for (const c of channels) {
    add({
      url: `/playbook/${c.id}`,
      title: `${c.code} · ${c.name}`,
      sub: c.oneLine,
      group: 'Channels',
      where: `Playbook → ${c.name}`,
      text: [c.why, c.how, c.when, c.where, c.whatYouNeed, c.gettingStarted.join(' '),
             c.playbook.map((p) => `${p.title} ${p.body}`).join(' '), c.goodLooksLike, c.avoid.join(' ')].join(' '),
    });
    for (const s of c.stuck) {
      add({
        url: `/playbook/${c.id}#troubleshooting`,
        title: s.symptom,
        sub: s.fix.slice(0, 90),
        group: 'Troubleshooting',
        where: `Playbook → ${c.name} → When you're stuck`,
        text: s.fix,
      });
    }
    for (const f of c.faqs) {
      add({
        url: `/playbook/${c.id}#channel-faq`,
        title: f.q,
        sub: f.a.slice(0, 90),
        group: 'Channels',
        where: `Playbook → ${c.name} → FAQ`,
        text: f.a,
      });
    }
  }
  for (const t of money.inventory.terms) {
    add({
      url: '/playbook/inventory#terms',
      title: t.term,
      sub: t.body.slice(0, 90),
      group: 'Money',
      where: 'Playbook → Inventory',
      text: t.body,
    });
  }
  for (const n of money.revenue.numbers) {
    add({
      url: '/playbook/revenue#numbers',
      title: n.name,
      sub: n.body.slice(0, 90),
      group: 'Money',
      where: 'Playbook → Revenue & Expenses',
      text: n.body,
    });
  }
  for (const l of money.revenue.lens) {
    add({
      url: '/playbook/revenue#lens',
      title: l.milestone,
      sub: l.focus.slice(0, 90),
      group: 'Money',
      where: 'Playbook → Revenue & Expenses',
      text: `${l.focus} ${l.watchFor} ${l.revGoal}`,
    });
  }
  for (const g of grading.components) {
    add({
      url: '/grading',
      title: `${g.name} · ${g.weight}`,
      sub: g.body.slice(0, 90),
      group: 'Grading',
      where: 'Grading',
      text: [g.body, g.note, (g.criteria ?? []).map((c) => `${c.term} ${c.body}`).join(' ')].filter(Boolean).join(' '),
    });
  }
  for (const f of faqs) {
    add({
      url: `/faq#q-${f.id.replace(/^faq-/, '')}`,
      title: f.q,
      sub: f.a.slice(0, 90),
      group: 'FAQ',
      where: 'FAQ',
      text: f.a,
    });
  }
  add({
    url: '/flea',
    title: 'Mesa Flea',
    sub: flea.headline.slice(0, 90),
    group: 'Flea Market',
    where: 'Flea Market',
    text: [flea.paragraphs.join(' '), flea.whyBest.map((w) => `${w.title} ${w.body}`).join(' '), flea.proof.body].join(' '),
  });
  return out;
}
