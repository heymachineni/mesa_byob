#!/usr/bin/env python3
"""
Menu and search wiring.

Every destination in this build is reached one of two ways: an anchor id, or a
drawer panel opened by clicking a `[data-open]` trigger. Both can rot silently —
a renamed section id, a panel whose only trigger sat inside a fold that got
removed — and neither shows up as a broken build. So they are asserted here.

Run against a built page:  python3 scripts/verify_nav.py dist/index.html
"""
import json
import re
import sys
from collections import Counter

EXPECTED_TOP = ["Overview", "Milestones", "Channels", "Workshops", "Money", "Flea", "Help"]
EXPECTED_COUNTS = {"milestone": 8, "channel": 5, "workshop": 13}


def strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def main(path: str) -> int:
    html = open(path, encoding="utf-8").read()
    fails: list[str] = []
    notes: list[str] = []

    ids = set(re.findall(r'\sid="([^"]+)"', html))
    panels = set(re.findall(r'data-panel="([^"]+)"', html))
    triggers = set(re.findall(r'data-open="([^"]+)"', html))

    def resolves(target: str) -> bool:
        if target.startswith("panel:"):
            return target[6:] in panels
        return target.lstrip("#") in ids

    # ── the menu ──────────────────────────────────────────────────────────
    tops = [strip_tags(m) for m in re.findall(r'<button[^>]*data-nav-top="[^"]*"[^>]*>(.*?)</button>', html, re.S)]
    flea = re.findall(r'<a[^>]*data-go="#flea"[^>]*>(.*?)</a>', html, re.S)
    labels = tops + [strip_tags(f) for f in flea]
    for want in EXPECTED_TOP:
        if not any(want.lower() in l.lower() for l in labels):
            fails.append(f"top-level item missing from the menu: {want}")
    notes.append(f"top-level items: {len(labels)}")

    menu_targets = re.findall(r'data-go="([^"]+)"', html)
    dead = sorted({t for t in menu_targets if not resolves(t)})
    for t in dead:
        fails.append(f"menu row points nowhere: {t}")
    notes.append(f"menu rows: {len(menu_targets)} ({len(set(menu_targets))} distinct destinations)")

    kinds = Counter()
    for t in set(menu_targets):
        if t.startswith("panel:"):
            m = re.search(r'data-panel="%s"[^>]*data-group="([^"]+)"' % re.escape(t[6:]), html)
            if m:
                kinds[m.group(1)] += 1
    for kind, want in EXPECTED_COUNTS.items():
        if kinds[kind] != want:
            fails.append(f"menu lists {kinds[kind]} of {want} {kind}s")
    notes.append("menu covers " + ", ".join(f"{kinds[k]} {k}s" for k in EXPECTED_COUNTS))

    # ── the search index ──────────────────────────────────────────────────
    m = re.search(r'data-find-index[^>]*>(\[.*?\])</script>', html, re.S)
    if not m:
        fails.append("no search index inlined on the page")
        index = []
    else:
        index = json.loads(m.group(1))
        notes.append(f"search entries: {len(index)}")

    for e in index:
        if not resolves(e["a"]):
            fails.append(f"search result points nowhere: {e['a']}  ({e['t'][:40]})")

    # Opening a panel works by clicking one of the page's own triggers, so a
    # panel with no trigger is unreachable however it is linked.
    wanted = {t[6:] for t in set(menu_targets) if t.startswith("panel:")}
    wanted |= {e["a"][6:] for e in index if e["a"].startswith("panel:")}
    for p in sorted(wanted - triggers):
        fails.append(f"panel '{p}' is linked but has no [data-open] trigger to open it")
    notes.append(f"panels reachable: {len(wanted & triggers)}/{len(wanted)}")

    # Every entry needs a breadcrumb, or you can't tell where you're being sent.
    missing_where = [e["t"] for e in index if not e.get("w")]
    if missing_where:
        fails.append(f"{len(missing_where)} search entries have no breadcrumb")

    # ── report ────────────────────────────────────────────────────────────
    for n in notes:
        print(f" · {n}")
    if fails:
        print(f"\nNAV + SEARCH: {len(fails)} PROBLEM(S)")
        for f in fails:
            print(f"  ✗ {f}")
        return 1
    print("\nNAV + SEARCH: every menu row and every search result resolves")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "dist/index.html"))
