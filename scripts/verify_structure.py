"""Structural + accessibility checks on the built page."""
import re, pathlib, sys
from html.parser import HTMLParser
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html')
src = PAGE.read_text()

# Strip the inlined search index so its JSON can't be parsed as markup.
body = re.sub(r'<script type="application/json" id="cmd-index">.*?</script>', '', src, flags=re.S)
# Strip the module scripts too — their string literals contain tag-like text.
body = re.sub(r'<script[^>]*>.*?</script>', '', body, flags=re.S)

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []           # (tag, attrs dict, text-so-far index)
        self.ids = set()
        self.headings = []
        self.stack = []
        self.text_by_open = {}   # index -> collected text
        self.order = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        idx = len(self.tags)
        self.tags.append((tag, a))
        if 'id' in a:
            self.ids.add(a['id'])
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.headings.append((int(tag[1]), idx))
        self.stack.append(idx)
        self.text_by_open.setdefault(idx, '')

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        for idx in self.stack:
            self.text_by_open[idx] = self.text_by_open.get(idx, '') + data

p = P()
p.feed(body)

problems = []
notes = []

# ---------------------------------------------------------------- panels
panels = [(a.get('data-panel'), a.get('data-group'), a.get('data-seq'))
          for t, a in p.tags if 'data-panel' in a]
groups = Counter(g for _, g, _ in panels)
notes.append(f'panels: {len(panels)} total — ' +
             ', '.join(f'{g}={n}' for g, n in sorted(groups.items())))

expected = {'milestone': 8, 'channel': 5, 'workshop': 13}
for g, n in expected.items():
    if groups.get(g) != n:
        problems.append(f'expected {n} {g} panels, found {groups.get(g)}')

for g in expected:
    seqs = sorted(int(s) for _, gg, s in panels if gg == g)
    if seqs != list(range(len(seqs))):
        problems.append(f'{g} seq not contiguous from 0: {seqs}')

# ------------------------------------------------------- triggers resolve
panel_ids = {pid for pid, _, _ in panels}
opens = {a['data-open'] for t, a in p.tags if 'data-open' in a}
notes.append(f'drawer triggers: {len(opens)} distinct targets')
for o in sorted(opens - panel_ids):
    problems.append(f'data-open="{o}" has no matching panel')

# ------------------------------------------------------- anchors resolve
hrefs = [a['href'] for t, a in p.tags if t == 'a' and a.get('href', '').startswith('#')]
for h in sorted(set(hrefs)):
    if h != '#' and h[1:] not in p.ids:
        problems.append(f'anchor {h} does not resolve to an id')
notes.append(f'in-page anchors: {len(set(hrefs))} distinct, all resolving')

# ------------------------------------------------- no links to dead routes
dead = re.findall(r'href="(/(?:journey|channels|money|workshops|stuck|flea-market|faq|watch)[^"]*)"', body)
if dead:
    problems.append(f'links to removed routes: {sorted(set(dead))}')

# ------------------------------------------------------------- headings
h1s = [lv for lv, _ in p.headings if lv == 1]
if len(h1s) != 1:
    problems.append(f'expected exactly one h1, found {len(h1s)}')
prev = 0
for lv, idx in p.headings:
    if prev and lv > prev + 1:
        problems.append(f'heading skip h{prev} -> h{lv}')
    prev = lv
notes.append(f'headings: {len(p.headings)}, one h1, no level skips')

# --------------------------------------------------------- accessibility
for t, a in p.tags:
    if t == 'img' and 'alt' not in a:
        problems.append('img without alt')
    if t == 'iframe' and not a.get('title'):
        problems.append('iframe without title')

labels = {a['for'] for t, a in p.tags if t == 'label' and 'for' in a}
for t, a in p.tags:
    if t == 'input':
        iid = a.get('id')
        if not (iid and iid in labels) and not a.get('aria-label'):
            problems.append(f'input without label: {a}')

# Controls need an accessible name from text, aria-label, or an sr-only child.
unnamed = 0
for i, (t, a) in enumerate(p.tags):
    if t not in ('button', 'a'):
        continue
    text = (p.text_by_open.get(i) or '').strip()
    if not text and not a.get('aria-label') and not a.get('title'):
        unnamed += 1
if unnamed:
    problems.append(f'{unnamed} controls without an accessible name')

iframes = [a for t, a in p.tags if t == 'iframe']
lazy = sum(1 for a in iframes if a.get('loading') == 'lazy')
notes.append(f'iframes: {len(iframes)}, {lazy} lazy-loaded, all titled')

# --------------------------------------------------------------- report
kb = len(src) / 1024
idx_entries = src.count('"action":')
notes.append(f'search index: {idx_entries} entries')
notes.append(f'page weight: {kb:.0f} KB uncompressed HTML (incl. inlined CSS + index)')

for n in notes:
    print(' ·', n)
if problems:
    print('\nPROBLEMS:')
    for x in problems:
        print('  ✗', x)
    sys.exit(1)
print('\nSTRUCTURE + A11Y: all checks pass')
