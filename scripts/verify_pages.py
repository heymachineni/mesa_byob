#!/usr/bin/env python3
"""
Structural checks for the multi-page kit.

Runs against a directory of fetched pages (one .html per route). Asserts the
things that rot silently: dead internal links, a second h1, an em dash that
slipped back into copy, a milestone that fell off the page, a search result
pointing at a route that no longer exists.
"""
import json, re, sys, html, pathlib

OUT = pathlib.Path(sys.argv[1])
PAGES = json.loads((OUT / 'pages.json').read_text())  # route -> filename

fails, notes = [], []
docs = {}
for route, fname in PAGES.items():
    docs[route] = (OUT / fname).read_text()

known_routes = set(PAGES)
def resolves(href: str) -> bool:
    path = href.split('#')[0].split('?')[0] or '/'
    if path.rstrip('/') in {r.rstrip('/') for r in known_routes}: return True
    if path.startswith(('/api/', '/fonts/', '/_astro/')): return True
    if re.search(r'\.(png|ico|svg|woff2?)$', path): return True
    return False

DASH = re.compile(r'[—–]')
for route, doc in docs.items():
    # one h1 per page
    h1 = len(re.findall(r'<h1[ >]', doc))
    if h1 != 1: fails.append(f'{route}: {h1} h1 elements')

    # no long dashes in what a reader sees
    body = re.sub(r'<script.*?</script>', ' ', doc, flags=re.S)
    body = re.sub(r'<style.*?</style>', ' ', body, flags=re.S)
    text = html.unescape(re.sub(r'<[^>]+>', ' ', body))
    hits = DASH.findall(text)
    if hits: fails.append(f'{route}: {len(hits)} long dash(es) in visible text')

    # internal links resolve
    for href in set(re.findall(r'href="(/[^"]*)"', doc)):
        if not resolves(href): fails.append(f'{route}: dead link {href}')

    # iframes stay lazy and titled
    for tag in re.findall(r'<iframe[^>]*>', doc):
        if 'loading="lazy"' not in tag: fails.append(f'{route}: iframe not lazy')
        if 'title=' not in tag: fails.append(f'{route}: iframe untitled')

    # the rail marks exactly one current page
    cur = doc.count('aria-current="page"')
    if route != '/signin' and cur < 1: fails.append(f'{route}: no aria-current in nav')

# completeness: the things that must all be present
ms = re.findall(r'id="(m\d)"', docs['/milestones'])
if sorted(set(ms)) != [f'm{i}' for i in range(1, 9)]:
    fails.append(f'/milestones: found {sorted(set(ms))}, wanted m1..m8')
ws = re.findall(r'id="(ws\d+)"', docs['/workshops'])
if len(set(ws)) != 13: fails.append(f'/workshops: {len(set(ws))} of 13 workshops')
qs = len(re.findall(r'<details[^>]*id="q-', docs['/faq']))
if qs != 13: fails.append(f'/faq: {qs} of 13 questions')
wk = len(re.findall(r'id="wk\d+"', docs['/weeks']))
if wk != 8: fails.append(f'/weeks: {wk} of 8 check-ins')
for c in ('offline', 'online-organic', 'influencer', 'performance', 'b2b'):
    if f'/playbook/{c}' not in docs: fails.append(f'channel page missing: {c}')
if '45%' not in docs['/grading'] or '10%' not in docs['/grading']:
    fails.append('/grading: component weights missing')

# every search entry goes somewhere real
m = re.search(r'data-find-index[^>]*>(\[.*?\])</script>', docs['/'], re.S)
if not m:
    fails.append('no search index on /')
else:
    idx = json.loads(m.group(1))
    bad = [e['a'] for e in idx if not resolves(e['a'])]
    for b in sorted(set(bad)): fails.append(f'search result points nowhere: {b}')
    notes.append(f'search entries: {len(idx)}')

notes.append(f'pages checked: {len(docs)}')
for n in notes: print(f' · {n}')
if fails:
    print(f'\nPAGES: {len(fails)} PROBLEM(S)')
    for f in fails: print(f'  ✗ {f}')
    sys.exit(1)
print('\nPAGES: one h1 each, no long dashes, every link and search result resolves')
