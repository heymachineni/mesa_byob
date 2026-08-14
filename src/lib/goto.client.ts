/**
 * Going to a destination — shared by the menu and by search.
 *
 * The hard part of navigating this page is that roughly half its text sits
 * inside a collapsed `<details>` and another 26 documents live in drawer
 * panels that aren't rendered until you ask for them. Scrolling to an anchor
 * is therefore not enough: you'd arrive somewhere that still looks empty.
 * So a destination is *opened*, then scrolled to, then flashed.
 */

/** `#id` scrolls to an anchor; `panel:<id>` opens a drawer panel. */
export function go(target: string): boolean {
  if (target.startsWith('panel:')) {
    /* Reuse the page's own trigger rather than reaching into the drawer's
       internals — that keeps history, focus and the scroll lock consistent
       with a normal click, and there is always at least one trigger per panel. */
    const id = target.slice(6);
    const trigger = document.querySelector<HTMLElement>(`[data-open="${id}"]`);
    if (!trigger) return false;
    trigger.click();
    return true;
  }

  const el = document.querySelector<HTMLElement>(target);
  if (!el) return false;

  /* Open the fold it's in, and itself if it is one. Walking up catches a
     question inside the FAQ accordion inside a section. */
  if (el instanceof HTMLDetailsElement) el.open = true;
  for (let n = el.parentElement; n; n = n.parentElement) {
    if (n instanceof HTMLDetailsElement) n.open = true;
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  flash(el);
  return true;
}

/**
 * A brief mark on the thing you were sent to. Without it, arriving in the
 * middle of a long section leaves you to work out which paragraph answered
 * your question.
 */
export function flash(el: HTMLElement) {
  el.classList.remove('is-found');
  /* Restart the animation if the same target is picked twice. */
  void el.offsetWidth;
  el.classList.add('is-found');
  window.setTimeout(() => el.classList.remove('is-found'), 2000);
}
