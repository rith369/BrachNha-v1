/**
 * Score-band colours, shared by the results screen's ring/heading and the
 * Previous Results list on the generated-exam tab.
 *
 * A .ts file rather than living in exam-results.tsx for the reason
 * utils/focus-styles.ts documents: a non-component export from a .tsx trips
 * oxlint's `only-export-components` fast-refresh rule, which the repo carries
 * once already in components/ui/button.tsx and shouldn't grow a second time.
 *
 * Two functions rather than one because the two roles need different forms: a
 * Tailwind class for text, and a raw var() for the conic-gradient ring, which
 * is a style property a class cannot reach.
 */
export function scoreColor(pct: number) {
  if (pct >= 80) return "text-mint";
  if (pct >= 60) return "text-yellow";
  return "text-pink";
}

export function scoreColorHex(pct: number) {
  if (pct >= 80) return "var(--color-mint)";
  if (pct >= 60) return "var(--color-yellow)";
  return "var(--color-pink)";
}
