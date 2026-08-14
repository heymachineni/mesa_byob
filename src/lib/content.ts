import { getCollection } from 'astro:content';
import { rupeesCompact } from './format';

/**
 * CONTENT ADAPTER — the only module that knows where content comes from.
 *
 * Components import from here and never touch `astro:content` or the JSON files
 * directly. When Mesa moves content into Keystatic, a headless CMS, or a live
 * team-progress API, only this file changes; every component keeps working.
 */

/** Turns `{ id, data }` collection entries into plain `{ id, ...fields }` objects. */
function flatten<T extends { id: string; data: Record<string, unknown> }>(
  entries: T[]
): Array<T['data'] & { id: string }> {
  return entries.map((e) => ({ id: e.id, ...e.data })) as Array<
    T['data'] & { id: string }
  >;
}

/* ------------------------------------------------------------------ program */

export async function getProgram() {
  const [entry] = await getCollection('program');
  if (!entry) throw new Error('content: program.json is empty');
  return { id: entry.id, ...entry.data };
}
export type Program = Awaited<ReturnType<typeof getProgram>>;

/* ------------------------------------------------------------------- phases */

export async function getPhases() {
  const phases = flatten(await getCollection('phases'));
  return phases.sort((a, b) => a.weekFrom - b.weekFrom);
}
export type Phase = Awaited<ReturnType<typeof getPhases>>[number];

export async function getPhase(id: string) {
  return (await getPhases()).find((p) => p.id === id);
}

/* --------------------------------------------------------------- milestones */

export async function getMilestones() {
  const ms = flatten(await getCollection('milestones'));
  return ms.sort((a, b) => a.week - b.week);
}
export type Milestone = Awaited<ReturnType<typeof getMilestones>>[number];

export async function getMilestone(id: string) {
  return (await getMilestones()).find((m) => m.id === id);
}

/** Milestones grouped under their phase, in journey order. */
export async function getJourney() {
  const [phases, milestones] = await Promise.all([getPhases(), getMilestones()]);
  return phases.map((phase) => ({
    phase,
    milestones: milestones.filter((m) => m.phase === phase.id),
  }));
}

/** Previous/next for milestone detail navigation. */
export async function getMilestoneNeighbours(id: string) {
  const ms = await getMilestones();
  const i = ms.findIndex((m) => m.id === id);
  return {
    prev: i > 0 ? ms[i - 1]! : null,
    next: i >= 0 && i < ms.length - 1 ? ms[i + 1]! : null,
  };
}

/* ---------------------------------------------------------------- workshops */

export async function getWorkshops() {
  const ws = flatten(await getCollection('workshops'));
  return ws.sort((a, b) => a.n - b.n);
}
export type Workshop = Awaited<ReturnType<typeof getWorkshops>>[number];

/** Workshops a milestone points at. Editorial mapping — see AUDIT.md §3. */
export async function getWorkshopsFor(milestone: Milestone) {
  const ws = await getWorkshops();
  return milestone.workshops
    .map((id) => ws.find((w) => w.id === id))
    .filter((w): w is Workshop => Boolean(w));
}

/* ----------------------------------------------------------------- channels */

export async function getChannels() {
  const cs = flatten(await getCollection('channels'));
  return cs.sort((a, b) => a.code.localeCompare(b.code));
}
export type Channel = Awaited<ReturnType<typeof getChannels>>[number];

export async function getChannel(id: string) {
  return (await getChannels()).find((c) => c.id === id);
}

export async function getChannelsFor(milestone: Milestone) {
  const cs = await getChannels();
  return milestone.channels
    .map((id) => cs.find((c) => c.id === id))
    .filter((c): c is Channel => Boolean(c));
}

export async function getChannelTargets() {
  return flatten(await getCollection('channelTargets'));
}
export type ChannelTarget = Awaited<ReturnType<typeof getChannelTargets>>[number];

export async function getTargetFor(channel: Channel) {
  if (!channel.target) return null;
  return (await getChannelTargets()).find((t) => t.id === channel.target) ?? null;
}

/**
 * The channel "Win" revenue targets sum to exactly ₹7,00,000 — the same figure
 * as the program's minimum. Computed rather than asserted, so it stays true if
 * Mesa edits a target. See AUDIT.md §1.1.
 */
export async function getTargetBreakdown() {
  const targets = await getChannelTargets();
  const withRevenue = targets.filter(
    (t): t is ChannelTarget & { winRevenue: number } => t.winRevenue !== null
  );
  const total = withRevenue.reduce((sum, t) => sum + t.winRevenue, 0);
  return {
    rows: withRevenue.map((t) => ({
      ...t,
      share: total > 0 ? t.winRevenue / total : 0,
    })),
    total,
    /** Channels carrying a non-revenue target (impressions, etc.). */
    nonRevenue: targets.filter((t) => t.winRevenue === null),
  };
}

/* ------------------------------------------------- revenue ladder (derived) */

export type Rung = {
  value: number;
  label: string;
  milestone: Milestone;
  /** Fraction of the ₹7L target — drives the visual progression. */
  fraction: number;
  isTarget: boolean;
};

/**
 * ₹0 → ₹25K → ₹75K → ₹1.5L → ₹2.75L → ₹5.5L → ₹7L+
 *
 * Derived from the milestones themselves, deduplicated (M1 and M2 are both ₹0).
 * This is a roadmap of the targets ahead — never a claim about revenue earned.
 */
export async function getRevenueLadder(): Promise<Rung[]> {
  const [milestones, program] = await Promise.all([getMilestones(), getProgram()]);
  const seen = new Set<number>();
  const rungs: Rung[] = [];

  for (const m of milestones) {
    if (seen.has(m.revenueGoal)) continue;
    seen.add(m.revenueGoal);
    rungs.push({
      value: m.revenueGoal,
      label: rupeesCompact(m.revenueGoal) + (m.revenueLabel.includes('+') ? '+' : ''),
      milestone: m,
      fraction: program.revenueTarget > 0 ? m.revenueGoal / program.revenueTarget : 0,
      isTarget: m.revenueGoal >= program.revenueTarget,
    });
  }
  return rungs;
}

/* ------------------------------------------------ troubleshooting (derived) */

export type Symptom = {
  id: string;
  symptom: string;
  fix: string;
  channelId: string;
  channelName: string;
  channelCode: string;
};

/**
 * Every "When you're stuck" row from all five channels, flattened into one
 * symptom-first list. In the source these are buried inside each channel; a
 * stuck student arrives by symptom ("nobody is stopping at my stall"), not by
 * channel. See AUDIT.md §3.
 */
export async function getAllSymptoms(): Promise<Symptom[]> {
  const channels = await getChannels();
  return channels.flatMap((c) =>
    c.stuck.map((s, i) => ({
      id: `${c.id}-${i}`,
      symptom: s.symptom,
      fix: s.fix,
      channelId: c.id,
      channelName: c.name,
      channelCode: c.code,
    }))
  );
}

export async function getStillStuck() {
  const [entry] = await getCollection('stillStuck');
  if (!entry) throw new Error('content: still-stuck.json is empty');
  return { id: entry.id, ...entry.data };
}

/* -------------------------------------------------------- money / flea / faq */

export async function getMoney() {
  const [entry] = await getCollection('money');
  if (!entry) throw new Error('content: money.json is empty');
  return { id: entry.id, ...entry.data };
}

export async function getFlea() {
  const [entry] = await getCollection('flea');
  if (!entry) throw new Error('content: flea.json is empty');
  return { id: entry.id, ...entry.data };
}

export async function getFaqs() {
  return flatten(await getCollection('faqs'));
}
export type Faq = Awaited<ReturnType<typeof getFaqs>>[number];

/** Distinct tags across the FAQ set, for the filter chips. */
export async function getFaqTags() {
  const faqs = await getFaqs();
  return [...new Set(faqs.flatMap((f) => f.tags))].sort();
}

export async function getWip() {
  return flatten(await getCollection('wip'));
}

export async function getWipItem(id: string) {
  return (await getWip()).find((w) => w.id === id);
}

/* ------------------------------------------------------- videos (aggregated) */

export type VideoRef = {
  title: string;
  url: string | null;
  source: string;
  kind: 'youtube' | 'instagram' | 'link';
  placeholder: boolean;
  note?: string | undefined;
  /** Where in the site this video belongs. */
  context: string;
  href: string;
};

/** Every video reference on the site, for the watch library. */
export async function getAllVideos(): Promise<VideoRef[]> {
  const [program, channels, money, flea] = await Promise.all([
    getProgram(),
    getChannels(),
    getMoney(),
    getFlea(),
  ]);

  const out: VideoRef[] = [];
  const push = (v: Omit<VideoRef, 'context' | 'href'>, context: string, href: string) =>
    out.push({ ...v, context, href });

  for (const v of program.watch) push(v, 'The Challenge', '/');
  for (const c of channels)
    for (const v of c.videos) push(v, c.name, `/channels/${c.id}`);
  for (const v of money.inventory.videos) push(v, 'Inventory', '/money#inventory');
  push(flea.proof.link, 'Flea Market', '/flea-market');
  for (const v of flea.pastReels) push(v, 'Flea Market', '/flea-market');
  for (const v of flea.realContent) push(v, 'Flea Market', '/flea-market');

  return out;
}

/* ------------------------------------------------------------- navigation */

/**
 * The whole experience is one page. Nav entries are section anchors, not
 * destinations — the student never leaves the kit.
 */
export const NAV = [
  { href: '#journey', label: 'Journey' },
  { href: '#channels', label: 'Channels' },
  { href: '#workshops', label: 'Workshops' },
  { href: '#money', label: 'Money' },
  { href: '#flea', label: 'Flea Market' },
] as const;

/* ------------------------------------------------------------ search index */

export type SearchEntry = {
  /** `open:<panelId>` opens a drawer; `go:<hash>` scrolls to a section. */
  action: string;
  /** WHAT matched. */
  title: string;
  /** WHY it matters — a one-line description. */
  sub: string;
  /** WHERE it lives, e.g. "Money matters → Inventory". */
  where: string;
  /** Coarse bucket, used as the result group heading. */
  group: string;
  /** Lowercased haystack; never rendered. */
  text: string;
};

/** Shown when the search field is empty — the useful starting points. */
export const SEARCH_SUGGESTIONS = [
  'MOQ',
  'week 4',
  'influencer',
  'ROAS',
  'repayment',
  'flea market',
] as const;

/**
 * Built at build time and inlined into the page. Covers every substantive
 * piece of Starter Pack content so ⌘K can answer "MOQ", "week 4" or
 * "creators aren't replying" without the student hunting through sections.
 */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [milestones, phases, workshops, channels, targets, money, faqs, flea, wip, stuck] =
    await Promise.all([
      getMilestones(),
      getPhases(),
      getWorkshops(),
      getChannels(),
      getChannelTargets(),
      getMoney(),
      getFaqs(),
      getFlea(),
      getWip(),
      getStillStuck(),
    ]);

  const out: SearchEntry[] = [];
  const add = (e: Omit<SearchEntry, 'text'> & { text?: string }) =>
    out.push({
      ...e,
      text: `${e.title} ${e.sub} ${e.where} ${e.group} ${e.text ?? ''}`.toLowerCase(),
    });

  for (const m of milestones) {
    const phase = phases.find((p) => p.id === m.phase);
    add({
      action: `open:${m.id}`,
      title: `${m.code} · ${m.headline}`,
      sub: `Week ${m.week} · ${m.revenueLabel} · due ${m.date}`,
      group: 'Journey',
      where: `The journey → ${phase?.name ?? ''} · Week ${m.week}`,
      text: [
        m.deliverables.join(' '),
        m.mentorQuestion,
        m.gate?.name,
        m.gate?.rule,
        m.gate?.spendOn.join(' '),
        m.escalation,
        phase?.name,
        phase?.altName,
        `week ${m.week}`,
      ]
        .filter(Boolean)
        .join(' '),
    });
  }

  for (const p of phases) {
    add({
      action: 'go:#journey',
      title: `${p.code} — ${p.name}`,
      sub: `${p.weeks} · ${p.summary}`,
      group: 'Journey',
      where: 'The journey',
      text: `${p.altName} ${p.beats.join(' ')}`,
    });
  }

  for (const w of workshops) {
    add({
      action: `open:${w.id}`,
      title: `${w.code} · ${w.title}`,
      sub: w.expect.slice(0, 90),
      group: 'Workshops',
      where: `Workshops → ${w.code}`,
      text: w.expect,
    });
  }

  for (const c of channels) {
    const t = targets.find((x) => x.id === c.target);
    add({
      action: `open:${c.id}`,
      title: c.name,
      sub: c.oneLine,
      group: 'Channels',
      where: `Five ways to sell → ${c.name}`,
      text: [
        c.why,
        c.how,
        c.when,
        c.where,
        c.whatYouNeed,
        c.gettingStarted.join(' '),
        c.playbook.map((s) => `${s.title} ${s.body}`).join(' '),
        c.avoid.join(' '),
        c.goodLooksLike,
        t ? [t.tof, t.min.join(' '), t.win.join(' ')].filter(Boolean).join(' ') : '',
      ].join(' '),
    });

    for (const f of c.faqs) {
      add({
        action: `open:${c.id}`,
        title: f.q,
        sub: `${c.name} · frequently asked`,
        group: 'Channels',
        where: `${c.name} → Frequently asked`,
        text: f.a,
      });
    }

    for (const s of c.stuck) {
      add({
        action: 'go:#stuck',
        title: s.symptom,
        sub: `${c.name} · what to try`,
        group: 'Troubleshooting',
        where: `When you're stuck → ${c.name}`,
        text: s.fix,
      });
    }
  }

  for (const term of money.inventory.terms) {
    add({
      action: 'go:#money',
      title: term.term,
      sub: term.body.slice(0, 90),
      group: 'Money',
      where: 'Money matters → Inventory',
      text: term.body,
    });
  }
  for (const n of money.revenue.numbers) {
    add({
      action: 'go:#money',
      title: n.name,
      sub: n.body,
      group: 'Money',
      where: 'Money matters → Revenue & expenses',
      text: n.body,
    });
  }
  for (const l of money.revenue.lens) {
    add({
      action: 'go:#money',
      title: l.milestone,
      sub: `Financial focus · ${l.revGoal}`,
      group: 'Money',
      where: 'Money matters',
      text: `${l.focus} ${l.watchFor}`,
    });
  }
  add({
    action: 'go:#money',
    title: money.revenue.question,
    sub: 'The question to ask every week',
    group: 'Money',
    where: 'Money matters',
    text: money.revenue.questionBody,
  });

  for (const f of faqs) {
    add({
      action: `go:#faq-${f.id}`,
      title: f.q,
      sub: f.a.slice(0, 100),
      group: 'FAQ',
      where: 'FAQ',
      text: `${f.a} ${f.tags.join(' ')}`,
    });
  }

  for (const w of wip) {
    add({
      action: 'go:#faq',
      title: w.title,
      sub: 'Still being finalised by the program team',
      group: 'FAQ',
      where: 'FAQ → Coming soon',
      text: `${w.body} ${w.pointer ?? ''}`,
    });
  }

  add({
    action: 'go:#flea',
    title: 'Mesa Flea',
    sub: flea.lede,
    group: 'Flea Market',
    where: 'Mesa Flea',
    text: `${flea.paragraphs.join(' ')} ${flea.whyBest.map((w) => `${w.title} ${w.body}`).join(' ')} ${flea.proof.body}`,
  });

  add({
    action: 'go:#stuck',
    title: stuck.title,
    sub: 'What to bring to your Wednesday 1:1',
    group: 'Troubleshooting',
    where: "When you're stuck",
    text: `${stuck.body} ${stuck.bring.join(' ')} ${stuck.closing}`,
  });

  return out;
}
