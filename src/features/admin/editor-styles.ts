/**
 * Class strings shared by the content editor's parts (content-item-editors,
 * section-editor, paper-editor). In a .ts file because a non-component export
 * from a .tsx trips oxlint's only-export-components rule (the reason
 * utils/focus-styles.ts exists).
 */

export const FIELD =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold outline-none [field-sizing:content] placeholder:text-muted focus:border-purple";

export const SMALL_BTN =
  "inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-extrabold disabled:opacity-40";

/** A card that groups one part of the thing being edited. */
export const PANEL = "rounded-2xl border border-border bg-surface p-3 shadow-panel-sm";
