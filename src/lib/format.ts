/** Indian digit grouping: 700000 → "7,00,000" */
export function groupINR(value: number): string {
  const s = Math.abs(Math.trunc(value)).toString();
  if (s.length <= 3) return (value < 0 ? '-' : '') + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (value < 0 ? '-' : '') + rest + ',' + last3;
}

/** 700000 → "₹7,00,000" */
export function rupees(value: number): string {
  return '₹' + groupINR(value);
}

/**
 * Compact rupee label for dense UI (chips, ladder rungs, axis labels).
 * 0 → ₹0 · 25000 → ₹25K · 150000 → ₹1.5L · 700000 → ₹7L
 */
export function rupeesCompact(value: number): string {
  if (value === 0) return '₹0';
  if (value >= 100000) return '₹' + trimZeros(value / 100000) + 'L';
  if (value >= 1000) return '₹' + trimZeros(value / 1000) + 'K';
  return '₹' + value;
}

function trimZeros(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '');
}

/** A slug safe for ids and anchors. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** Extracts a YouTube video id from watch/share/embed URLs. */
export function youTubeId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1]! : null;
}
