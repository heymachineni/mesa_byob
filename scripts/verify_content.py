"""Assert every substantive string in the content layer survives into the page.

Content preservation is non-negotiable, so this checks the rendered HTML rather
than trusting the templates. The inlined search index is stripped first so it
cannot mask content that is missing from the visible page.
"""
import json, re, html, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html')
page = PAGE.read_text()

# Drop the search index and the lowercased filter haystacks — otherwise they'd
# satisfy the check on their own.
page = re.sub(r'<script type="application/json" id="cmd-index">.*?</script>', '', page, flags=re.S)
page = re.sub(r'data-text="[^"]*"', '', page)

visible = html.unescape(page)
# Normalise whitespace so wrapped source strings still match.
norm = re.sub(r'\s+', ' ', visible)

# A second haystack with tags replaced by a space: a string is equally present
# whether or not inline markup (a <span> around the last two words, say) splits
# it in the source. What matters is that a reader sees it contiguously.
text_only = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', page)))

# And a third with tags removed to nothing: inline markup that closes flush
# against punctuation (…seed capital</strong>, so…) would otherwise leave a
# stray space before the comma and break the contiguous match.
text_tight = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', page)))

SKIP_KEYS = {'id', 'kind', 'placeholder', 'tone', 'phase', 'milestone', 'channel',
             'target', 'workshops', 'channels', 'tags', 'seq'}

missing, checked = [], 0

def walk(node, path, key=None):
    global checked
    if isinstance(node, dict):
        for k, v in node.items():
            walk(v, f'{path}.{k}', k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, f'{path}[{i}]', key)
    elif isinstance(node, str):
        if key in SKIP_KEYS or len(node) < 4:
            return
        checked += 1
        needle = re.sub(r'\s+', ' ', html.unescape(node)).strip()

        # A YouTube watch URL is legitimately rewritten to a nocookie embed
        # URL; the video id is what must survive.
        m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', needle)
        if m and 'youtube' in needle:
            if m.group(1) in norm:
                return
            missing.append((path, f'video id {m.group(1)} ({needle[:60]})'))
            return

        if needle not in norm and needle not in text_only and needle not in text_tight:
            missing.append((path, needle[:110]))

for f in sorted((ROOT / 'src/content/data').glob('*.json')):
    walk(json.loads(f.read_text()), f.stem)

print(f'checked {checked} strings from {len(list((ROOT/"src/content/data").glob("*.json")))} content files')
if missing:
    print(f'\nMISSING {len(missing)}:')
    for p, s in missing:
        print(f'  {p}\n    {s}')
    sys.exit(1)
print('ALL CONTENT PRESENT IN RENDERED PAGE')
