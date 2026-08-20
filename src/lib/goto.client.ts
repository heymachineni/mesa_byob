/**
 * Arriving on a page with a hash. Half the kit's detail sits inside <details>
 * folds, so landing on an anchor has to open the fold it lives in before the
 * browser can scroll to it — and a brief mark shows which entry answered you.
 */
export function onArrival() {
  const hash = decodeURIComponent(location.hash);
  if (!hash || hash.length < 2) return;
  const el = document.querySelector<HTMLElement>(hash.replace(/([^\w#-])/g, '\\$1'));
  if (!el) return;

  if (el instanceof HTMLDetailsElement) el.open = true;
  for (let n = el.parentElement; n; n = n.parentElement) {
    if (n instanceof HTMLDetailsElement) n.open = true;
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  if (el.tagName !== 'SECTION' && el.getBoundingClientRect().height < innerHeight * 0.55) {
    el.classList.add('is-found');
    setTimeout(() => el.classList.remove('is-found'), 2000);
  }
}
