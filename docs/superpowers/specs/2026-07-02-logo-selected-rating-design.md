# Design: Logo stamp in selected rating circles

**Date:** 2026-07-02
**Status:** Approved 2026-07-02. Implementation plan: `docs/superpowers/plans/2026-07-02-logo-selected-rating.md`.

## Context

On the survey (`/`), each of the six Likert questions renders five tappable circles. Today the selected circle fills solid red (`peer-checked:bg-brand` in `src/components/RatingQuestion.tsx`) with nothing inside. The user wants the selected circle to carry the Leno mark — the three stacked bars — matching the red badge with cream bars already used on `/admin`, the survey header, and the footer (`src/components/Brand.tsx`).

## Behavior

- Tapping (or keyboard-selecting) a rating option fills the circle red exactly as today, and the three cream bars appear inside it with a pop: scale from 75% to 100% plus fade-in, 200ms (Tailwind `duration-200`), ease-out — the badge being "stamped" on.
- Only the currently selected circle in each question shows the mark; picking a different option moves the stamp (single selection is already guaranteed by radio semantics).
- Unselected, hover, focus-visible, and error styling are unchanged. The label under the selected circle keeps its existing bold treatment.
- `prefers-reduced-motion`: the existing global rule in `src/app/globals.css` collapses transitions, so the bars appear instantly. No additional code.

## Changes

1. **`src/components/Brand.tsx`** — extract the inline three-bar SVG into an exported `LenoMark({ className })` component in the same file; `Brand` renders it internally. No visual change to any current usage; it gives the mark one source of truth instead of duplicating the SVG.
2. **`src/components/RatingQuestion.tsx`** — the aria-hidden circle span becomes a `grid place-items-center` container with a `LenoMark` child. The mark stays `w-7` at both circle sizes (`size-11` and `sm:size-12`), matching the badge's own proportions. It is `text-cream`, hidden at `opacity-0 scale-75`, and transitions to `opacity-100 scale-100` while the option's radio is checked — pure CSS, driven from the option label's existing `group` class via `:has(:checked)` (Tailwind `group-has-checked:`), since the mark is a descendant of the circle span and `peer-checked:` only reaches siblings. Each label is its own `group`, so the state can't leak across options. No JS, no new props, no new state.

## Invariants (unchanged by this design)

- Stored score = array index + 1; never derived from visual/RTL position.
- Radio-group semantics, keyboard operability, and visible focus ring.
- All Persian copy, validation rules, the server action, and the data model.
- RTL rendering: the mark is horizontally symmetric (all bars centered on x=60 in the viewBox), so it is direction-proof; no `dir` pinning needed inside the circles.
- Flat brand style: no gradients or shadows introduced.

## Alternatives considered

- **Soft fade only** (no scale): calmer and marginally less code, but loses the "stamped" moment. The user chose the pop-in instead.
- **Inverted colors** (red bars on a light circle): weakens selected-vs-unselected contrast and diverges from the target screenshot. Rejected.

## Verification

- Mobile-emulated screenshots via CDP device emulation (not plain `--screenshot`) of unselected → selected → reselected states.
- Keyboard pass: arrow keys move the selection within a group, the focus ring stays visible, and the stamp follows the selection.
- Reduced-motion spot check.
- `npm run lint` and `npm run build` pass.
