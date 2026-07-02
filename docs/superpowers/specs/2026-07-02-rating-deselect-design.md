# Design: Tap-to-deselect for rating circles

**Date:** 2026-07-02
**Status:** Approved 2026-07-02. Implementation plan: `docs/superpowers/plans/2026-07-02-rating-deselect.md`.

## Context

On the survey (`/`), each Likert question is a radio group of five circles (`src/components/RatingQuestion.tsx`). Radios are native single-select: once a circle is picked, tapping it again does nothing, so a guest who taps by accident can only switch to another value, never clear the question. The user wants tapping the selected circle to deselect it.

The radios are currently **uncontrolled** — the DOM owns the selection, all selected styling (red fill, Leno stamp, bold label) is pure CSS off `:checked`, and submit reads values from `FormData`. That is the crux: by the time a `click` handler runs, the browser has already set `checked`, so "was already selected" and "just became selected" look identical without extra state.

## Behavior

- Tapping (or clicking) the currently selected circle deselects it: the radio unchecks, the stamp fades out and the circle returns to its unselected outline via the existing 200ms transitions in reverse, and the label un-bolds. Tapping any other circle still just moves the selection.
- Keyboard parity: **Space** on the focused, already-selected radio deselects it. Arrow keys keep their native move-the-selection behavior; Space on an unselected focused radio keeps its native select behavior.
- Ratings remain **required** (the deliberate validation override stays untouched): a question left deselected shows the existing «لطفاً به این پرسش پاسخ دهید.» inline error at the next submit attempt. Deselecting does not itself surface an error — if the question's error was already cleared by a selection, deselecting leaves it hidden until the next submit, matching the survey's gentle validation voice.
- `prefers-reduced-motion`: the global rule collapses the transitions, so the stamp disappears instantly. No additional code.

## Changes

1. **`src/components/RatingQuestion.tsx`** (only file):
   - Add local state `selected: number | null` (`useState`); initial `null` matches the server-rendered markup (nothing checked), so hydration is unaffected.
   - Radios become controlled: `checked={selected === index + 1}`.
   - `onChange` sets `selected` and keeps calling `onSelect` (error clearing) exactly as today.
   - `onClick` deselects when the clicked option is already the selected one. This is correct because React dispatches `onClick` before `onChange` for the same native click, and clicking an already-checked radio fires *only* click (checkedness doesn't change) — so the handler always compares against the pre-click selection.
   - `onKeyDown` handles Space when the option is the selected one: `preventDefault()` + clear. This makes keyboard deselect deterministic instead of relying on browsers synthesizing a click for Space on a checked radio.
   - No `"use client"` needed: the component already lives inside the `SurveyForm` client boundary (it receives an `onSelect` function prop).

No changes to `SurveyForm`, validation, the server action, or the schema — submit still reads `FormData`, and an unchecked group simply serializes as absent, which the required-rating rule already handles.

## Invariants (unchanged by this design)

- Stored score = array index + 1; never derived from visual/RTL position. Deselection stores nothing — it only returns the group to "no value".
- Real radio-group semantics, keyboard operability, and the visible focus ring.
- All Persian copy, validation rules (ratings required), the server action, and the data model.
- Flat brand style and the existing stamp animation timings.

## Alternatives considered

- **Stay uncontrolled, track pre-click state manually** (`pointerdown`/`keydown` bookkeeping + imperative `input.checked = false`): no React state, but needs refs and two capture paths, and has fragile edges (a drag fires `pointerdown` but no `click`, leaving a stale flag). Rejected as more code that's easier to get subtly wrong.
- **Checkboxes styled as a radio group**: toggling is native, but it breaks the "real radio group" a11y acceptance criterion. Rejected.

## Verification

- Mobile-emulated (CDP device emulation, not plain `--screenshot`) walkthrough: select → same-circle tap deselects → reselect → submit with one question deselected shows the required error.
- Keyboard pass: arrow keys move selection; Space on the selected radio clears it; Space on an unselected radio selects it; focus ring stays visible throughout.
- `npm run lint` and `npm run build` pass.
