"""Semantic content mapping audit.

String presence is not enough. This asserts each piece of Starter Pack content
appears INSIDE its correct container — the right milestone drawer, the right
channel panel, the right section — and that distinctive content does NOT bleed
into a sibling panel.
"""
import json, re, html, pathlib, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html')
raw = PAGE.read_text()
raw = re.sub(r'<script type="application/json" id="cmd-index">.*?</script>', '', raw, flags=re.S)
raw = re.sub(r'<script[^>]*>.*?</script>', '', raw, flags=re.S)
raw = re.sub(r'data-text="[^"]*"', '', raw)

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Scoped(HTMLParser):
    """Collects subtree text for elements carrying data-panel or id."""
    def __init__(self):
        super().__init__()
        self.stack = []          # (tag, key or None, buffer index)
        self.buffers = []        # list of [key, text]
        self.open_bufs = []      # indices currently accumulating

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        a = dict(attrs)
        key = a.get('data-panel') or a.get('id')
        idx = None
        if key:
            self.buffers.append([key, []])
            idx = len(self.buffers) - 1
            self.open_bufs.append(idx)
        self.stack.append((tag, idx))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                _, idx = self.stack[i]
                if idx is not None and idx in self.open_bufs:
                    self.open_bufs.remove(idx)
                del self.stack[i:]
                break

    def handle_data(self, data):
        for idx in self.open_bufs:
            self.buffers[idx][1].append(data)

p = Scoped()
p.feed(raw)

scope = {}
for key, parts in p.buffers:
    txt = re.sub(r'\s+', ' ', html.unescape(''.join(parts)))
    # Keep the largest occurrence for a given key.
    if len(txt) > len(scope.get(key, '')):
        scope[key] = txt

def norm(x):
    return re.sub(r'\s+', ' ', html.unescape(x)).strip()

D = ROOT / 'src/content/data'
load = lambda n: json.loads((D / n).read_text())

rows, fails = [], 0

# The two versions name some sections differently; a container is whichever of
# these ids the page actually uses.
ALIAS = {
    'stuck': ['stuck', 'breaks'],
    'faq': ['faq', 'asked'],
    'money': ['money'],
    'flea': ['flea'],
}

def containers(dest):
    return [d for d in ALIAS.get(dest, [dest]) if d in scope]

def check(source, dest, needle, note=''):
    global fails
    ok = any(norm(needle) in scope[d] for d in containers(dest))
    rows.append((source, dest, 'PASS' if ok else 'FAIL', note or norm(needle)[:60]))
    if not ok:
        fails += 1

def check_absent(source, dest, needle, note=''):
    global fails
    ok = all(norm(needle) not in scope[d] for d in containers(dest))
    rows.append((source, dest, 'PASS' if ok else 'BLEED', note or norm(needle)[:60]))
    if not ok:
        fails += 1

# ---------------------------------------------------------------- milestones
for m in load('milestones.json'):
    mid = m['id']
    for d in m['deliverables']:
        check(f"{m['code']} deliverable", mid, d)
    check(f"{m['code']} mentor question", mid, m['mentorQuestion'])
    check(f"{m['code']} date", mid, m['date'])
    check(f"{m['code']} revenue", mid, m['revenueLabel'])
    check(f"{m['code']} headline", mid, m['headline'])
    if m.get('gate'):
        check(f"{m['code']} gate rule", mid, m['gate']['rule'])
        for sp in m['gate']['spendOn']:
            check(f"{m['code']} tranche use", mid, sp)
    if m.get('escalation'):
        check(f"{m['code']} escalation", mid, m['escalation'])

# A milestone's mentor question must not appear in a different milestone.
ms = load('milestones.json')
check_absent('M1 mentor question', 'm2', ms[0]['mentorQuestion'], 'M1 question absent from M2')
check_absent('M4 deliverable', 'm3', ms[3]['deliverables'][0], 'M4 deliverable absent from M3')

# ------------------------------------------------------------------ channels
chans = load('channels.json')
for c in chans:
    cid = c['id']
    for field in ('why', 'how', 'when', 'where', 'whatYouNeed', 'goodLooksLike'):
        check(f"{c['name']} {field}", cid, c[field])
    for g in c['gettingStarted']:
        check(f"{c['name']} getting started", cid, g)
    for s in c['playbook']:
        check(f"{c['name']} playbook", cid, s['title'])
        check(f"{c['name']} playbook body", cid, s['body'])
    for f in c['faqs']:
        check(f"{c['name']} FAQ", cid, f['q'])
        check(f"{c['name']} FAQ answer", cid, f['a'])
    for s in c['stuck']:
        check(f"{c['name']} stuck", cid, s['symptom'])
        check(f"{c['name']} fix", cid, s['fix'])
    for a in c['avoid']:
        check(f"{c['name']} avoid", cid, a)
    for v in c['videos']:
        check(f"{c['name']} video", cid, v['title'])

# Cross-channel bleed: each channel's "why" must not appear in the next channel.
for i, c in enumerate(chans):
    nxt = chans[(i + 1) % len(chans)]
    check_absent(f"{c['name']} why", nxt['id'], c['why'], f"not in {nxt['name']}")

# ----------------------------------------------------------------- workshops
for w in load('workshops.json'):
    check(f"{w['code']} title", w['id'], w['title'])
    check(f"{w['code']} expect", w['id'], w['expect'])
ws = load('workshops.json')
check_absent('WS1 expect', 'ws2', ws[0]['expect'], 'WS1 text absent from WS2')

# --------------------------------------------------------------------- money
money = load('money.json')[0]
for t in money['inventory']['terms']:
    check(f"Inventory term {t['term']}", 'money', t['body'])
for ph in money['inventory']['phases']:
    check('Inventory phase', 'money', ph['body'])
check('Inventory system', 'money', money['inventory']['system'])
for a in money['inventory']['avoid']:
    check('Inventory avoid', 'money', a)
for n in money['revenue']['numbers']:
    check(f"Revenue number {n['name']}", 'money', n['body'])
for l in money['revenue']['lens']:
    check(f"Lens {l['milestone']}", 'money', l['focus'])
    check(f"Lens watch-for", 'money', l['watchFor'])
check('The weekly question', 'money', money['revenue']['question'])

# ---------------------------------------------------------------------- flea
flea = load('flea.json')[0]
for para in flea['paragraphs']:
    check('Flea narrative', 'flea', para)
for w in flea['whyBest']:
    check('Flea why-best', 'flea', w['body'])
check('EverRaw proof', 'flea', flea['proof']['body'])
check('Flea placeholder note', 'flea', flea['placeholderNote'])
for v in flea['pastReels'] + flea['realContent']:
    check('Flea video slot', 'flea', v['title'])

# ----------------------------------------------------------------- faq / wip
for f in load('faqs.json'):
    check(f"FAQ {f['id']}", 'faq', f['q'])
    check(f"FAQ {f['id']} answer", 'faq', f['a'])
for w in load('wip.json'):
    check(f"WIP {w['id']}", 'faq', w['body'])

# --------------------------------------------------------------------- stuck
for c in chans:
    for s in c['stuck']:
        check(f"Symptom ({c['name']})", 'stuck', s['symptom'])
        check(f"Fix ({c['name']})", 'stuck', s['fix'])
still = load('still-stuck.json')[0]
for b in still['bring']:
    check('1:1 prep', 'stuck', b)

# ------------------------------------------------------------------- report
by = {}
for src, dest, status, note in rows:
    by.setdefault(status, []).append((src, dest, note))

print(f'{len(rows)} mappings checked')
for status in sorted(by):
    print(f'  {status}: {len(by[status])}')

if fails:
    print('\nFAILURES:')
    for src, dest, status, note in rows:
        if status != 'PASS':
            print(f'  {status}  {src}  ->  [{dest}]  {note}')
    sys.exit(1)

print('\nSEMANTIC MAPPING: every item in its correct context, no cross-panel bleed')
