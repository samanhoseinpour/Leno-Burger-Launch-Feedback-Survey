# Tap-to-Deselect Rating Circles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-02-rating-deselect-design.md`

**Goal:** Tapping the currently selected rating circle deselects it (stamp fades out, circle returns to its outline); Space on the focused selected radio does the same for keyboard users.

**Architecture:** The radios in `RatingQuestion` become controlled by a local `selected: number | null` state — the only way to clear a native radio, which users can never uncheck themselves. `onChange` selects (and keeps clearing the question's error via `onSelect`); `onClick` deselects when the tapped option is already the selected one — correct because the browser dispatches `click` before `change`, and a click on an already-checked radio fires *only* `click`, so the handler always sees the pre-click selection; `onKeyDown` turns Space-on-the-selected-radio into deselect (natively a no-op) with `preventDefault()`. All selected styling stays pure CSS off `:checked`, so unchecking reverts the stamp/fill/bold automatically. Nothing outside this one component changes: submit still reads `FormData`, where an unchecked group is simply absent and the required-rating rule reports it.

**Tech Stack:** Next.js 16.2.9 (App Router) + React 19, TypeScript, Tailwind CSS v4. Verification: ESLint, `next build`, and headless Chrome driven over CDP with true device emulation.

## Global Constraints

Every task's requirements implicitly include all of these.

- **Persian copy is verbatim and untouched.** This feature changes no user-facing string. Do not "fix" any Persian text you see.
- **Stored score = array index + 1.** The input `value={value}` (where `value = index + 1`), the input `name`s, and all submit logic stay untouched. RTL flips visual order only; deselection stores nothing.
- **Ratings stay REQUIRED.** `validation.ts` is not modified. Deselect only returns a group to "no value"; the «لطفاً به این پرسش پاسخ دهید.» error appears at the next submit attempt, not on deselect.
- **A11y invariants:** real radio group; the radio keeps `peer sr-only`; the circle span keeps `aria-hidden="true"`; every existing `peer-*` and `group-has-checked:*` class stays byte-identical. This feature adds behavior (JS), not styling.
- **No `"use client"` is added to `RatingQuestion.tsx`** — it already lives inside the `SurveyForm` client boundary (it receives an `onSelect` function prop).
- **No test framework exists and none may be added** (CLAUDE.md). Verification = `npm run lint` + `npm run build` + CDP device-emulated checks.
- **Never use plain headless `--screenshot` for phone widths** — it produces false right-edge clipping below ~500px window width. Always CDP `Emulation.setDeviceMetricsOverride` (as scripted below).
- **Commits:** single short imperative subject line only — no body, no `Co-Authored-By` trailer.
- Node ≥ 22 required for the verify script (global `WebSocket`; this machine runs Node 24). Dev server is `npm run dev` at `http://localhost:3000`.
- `$SHOT_DIR` in commands = your session scratchpad directory (any writable temp dir works). Files there are throwaway — never commit them.

## File Structure

- `src/components/RatingQuestion.tsx` (modify) — the 5-point radio group; selection becomes controlled so a repeat tap / Space can clear it.
- `$SHOT_DIR/verify-deselect.mjs` (create, throwaway) — CDP verification script; not committed.

No new source files; no schema, action, validation, or copy changes.

---

### Task 1: Controlled selection with tap/Space deselect

**Files:**
- Modify: `src/components/RatingQuestion.tsx`
- Create (throwaway, never committed): `$SHOT_DIR/verify-deselect.mjs`

**Interfaces:**
- Consumes: `LenoMark` from `./Brand` (already imported; unchanged), `useState` from `react`.
- Produces: no new exports; `RatingQuestion`'s props are unchanged (`id`, `number`, `text`, `scale`, `error?`, `onSelect?`). Nothing else in the codebase changes.

- [ ] **Step 1: Ensure the dev server is up and record the baseline**

```bash
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" != "200" ]; then
  npm run dev > "$SHOT_DIR/dev.log" 2>&1 &
  for i in $(seq 1 30); do
    sleep 1
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" = "200" ] && break
  done
fi
curl -s http://localhost:3000 | grep -o 'name="q1"' | wc -l | tr -d ' '
```

Expected output: `5` (five radios in question 1). If it is not 5, stop and investigate before editing anything.

- [ ] **Step 2: Replace `src/components/RatingQuestion.tsx` with this exact content**

```tsx
import { useState } from "react";
import { toPersianDigits } from "@/lib/format";
import { UI_COPY } from "@/lib/survey";
import { LenoMark } from "./Brand";

type RatingQuestionProps = {
  id: string;
  number: number;
  text: string;
  scale: readonly string[];
  error?: string;
  onSelect?: () => void;
};

// A 5-point rating as a real radio group (fieldset/legend). Each option's value
// is its array index + 1, so the stored score never depends on visual position.
// In RTL the row flips visually — index 0 renders rightmost — but value is fixed.
export function RatingQuestion({
  id,
  number,
  text,
  scale,
  error,
  onSelect,
}: RatingQuestionProps) {
  // Selection is controlled solely so a repeat tap can CLEAR it — users can
  // never uncheck a native radio. `null` = unanswered: no radio is checked,
  // FormData omits the field, and the required rule in validation.ts reports
  // it at submit. All selected styling still reads the DOM `:checked` state.
  const [selected, setSelected] = useState<number | null>(null);
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    >
      <legend className="mb-4 flex w-full items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-cream">
          {toPersianDigits(number)}
        </span>
        <span className="pt-0.5 text-base font-semibold leading-7 text-ink">
          {text}
          {/* Required marker — q1..q6 are required (validation.ts). */}
          <span aria-hidden="true" className="ms-1 text-brand">
            *
          </span>
          <span className="sr-only">{UI_COPY.requiredHint}</span>
        </span>
      </legend>

      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {scale.map((label, index) => {
          const value = index + 1;
          return (
            <label
              key={index}
              className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl py-1"
            >
              <input
                type="radio"
                name={id}
                value={value}
                checked={selected === value}
                onChange={() => {
                  setSelected(value);
                  onSelect?.();
                }}
                // A tap on the already-selected option clears it. Safe because
                // the browser dispatches click BEFORE change — and a click on
                // an already-checked radio fires click alone — so `selected`
                // still holds the pre-click choice here.
                onClick={() => {
                  if (selected === value) setSelected(null);
                }}
                // Space on a checked radio is natively a no-op; make it
                // deselect so keyboard users get the same toggle as touch.
                // preventDefault stops the browser's own re-activation click.
                onKeyDown={(event) => {
                  if (event.key === " " && selected === value) {
                    event.preventDefault();
                    setSelected(null);
                  }
                }}
                aria-describedby={describedBy}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`grid size-11 place-items-center rounded-full border-2 bg-cream/60 transition peer-hover:border-brand/60 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand sm:size-12 ${
                  error ? "border-brand/70" : "border-brand/30"
                }`}
              >
                {/* The badge "stamp" — pops in while this option's radio is
                    checked. The mark is a descendant of this span (not a
                    sibling of the radio), so it can't use peer-checked; the
                    label is the `group`, and :has(:checked) only ever sees the
                    label's own radio. */}
                <LenoMark className="w-7 text-cream opacity-0 scale-75 transition duration-200 ease-out group-has-checked:opacity-100 group-has-checked:scale-100" />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-muted transition-colors peer-checked:font-bold peer-checked:text-ink sm:text-xs">
                {label}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-3 text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </fieldset>
  );
}
```

The changes from the current file: the `useState` import; the `selected` state (with the why-controlled comment); the map callback becomes a block body introducing `const value = index + 1;`; and the `<input>` gains `checked`, a state-setting `onChange` (still calling `onSelect`), and the `onClick` / `onKeyDown` deselect handlers. Every className, span, comment, and the error paragraph are byte-identical to before.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exit 0 (runs `prisma generate`, `prisma migrate deploy`, `next build`; all succeed as before this change).

- [ ] **Step 5: Write `$SHOT_DIR/verify-deselect.mjs` with this exact content**

```js
// Throwaway CDP check for tap-to-deselect on rating circles. Not committed.
// Usage: SHOT_DIR=<scratch dir> node verify-deselect.mjs
// Requires: dev server on http://localhost:3000, Chrome headless on CDP port 9333.
import fs from "node:fs";

const SHOT_DIR = process.env.SHOT_DIR ?? ".";
const targets = await fetch("http://127.0.0.1:9333/json/list").then((r) => r.json());
const page = targets.find((t) => t.type === "page");
if (!page) throw new Error("no page target — is Chrome running with --remote-debugging-port=9333?");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let nextId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    nextId += 1;
    pending.set(nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? "evaluate failed");
  }
  return result.value;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const shot = async (name) => {
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: cssContentSize.width,
      height: Math.min(cssContentSize.height, 3000),
      scale: 1,
    },
  });
  const path = `${SHOT_DIR}/${name}.png`;
  fs.writeFileSync(path, Buffer.from(data, "base64"));
  console.log("saved", path);
};

const clickRadio = (name, value) =>
  evaluate(`document.querySelector('input[name="${name}"][value="${value}"]').click()`);

const focusRadio = (name, value) =>
  evaluate(`document.querySelector('input[name="${name}"][value="${value}"]').focus()`);

// checked state + how many in the group are checked + the stamp's opacity.
const radioState = (name, value) => evaluate(`(() => {
  const input = document.querySelector('input[name="${name}"][value="${value}"]');
  const svg = input.closest("label").querySelector("svg");
  return {
    checked: input.checked,
    checkedInGroup: document.querySelectorAll('input[name="${name}"]:checked').length,
    stampOpacity: getComputedStyle(svg).opacity,
  };
})()`);

const pressSpace = async () => {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown", key: " ", code: "Space", text: " ", windowsVirtualKeyCode: 32,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32,
  });
};

// Emulate a real phone BEFORE navigating (plain --screenshot lies < 500px).
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Page.navigate", { url: "http://localhost:3000" });
for (let i = 0; i < 40; i += 1) {
  if (await evaluate(`!!document.querySelector('input[name="q1"]')`)) break;
  await sleep(250);
}

// 1) Tap selects (existing behavior must survive the controlled rewrite).
await clickRadio("q1", 5);
await sleep(400);
console.log("q1 v5 selected:", await radioState("q1", 5));
await shot("q1-selected");

// 2) A second tap on the same option deselects.
await clickRadio("q1", 5);
await sleep(400);
console.log("q1 v5 after second tap:", await radioState("q1", 5));
await shot("q1-deselected");

// 3) Tapping it again reselects.
await clickRadio("q1", 5);
await sleep(400);
console.log("q1 v5 reselected:", await radioState("q1", 5));

// 4) Keyboard: Space on the focused, selected radio deselects…
await clickRadio("q2", 3);
await sleep(200);
await focusRadio("q2", 3);
await pressSpace();
await sleep(300);
console.log("q2 v3 after Space:", await radioState("q2", 3));

// 5) …and Space again reselects (native activation still works).
await pressSpace();
await sleep(300);
console.log("q2 v3 after Space again:", await radioState("q2", 3));

// 6) Arrow keys still move the selection (never clear it).
await clickRadio("q3", 2);
await sleep(200);
await focusRadio("q3", 2);
await send("Input.dispatchKeyEvent", {
  type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
});
await send("Input.dispatchKeyEvent", {
  type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
});
await sleep(300);
const q3 = await evaluate(`(() => {
  const checked = document.querySelector('input[name="q3"]:checked');
  const svg = checked ? checked.closest("label").querySelector("svg") : null;
  return {
    value: checked ? checked.value : null,
    checkedInGroup: document.querySelectorAll('input[name="q3"]:checked').length,
    stampOpacity: svg ? getComputedStyle(svg).opacity : null,
  };
})()`);
console.log("q3 after ArrowRight:", q3);

// 7) Submit with one question deselected → the required error appears.
//    (q1, q2, q3 are selected above; fill q4–q6, then clear q6 by tapping twice.)
await clickRadio("q4", 4);
await clickRadio("q5", 4);
await clickRadio("q6", 4);
await sleep(300);
await clickRadio("q6", 4); // second tap — clears it
await sleep(400);
await evaluate(`document.querySelector('button[type="submit"]').click()`);
await sleep(600);
const submit = await evaluate(`(() => {
  const err = document.getElementById("q6-error");
  return {
    errorPresent: !!err,
    errorText: err ? err.textContent : null,
    textOk: !!err && err.textContent === "لطفاً به این پرسش پاسخ دهید.",
    formStillThere: !!document.querySelector("form"),
  };
})()`);
console.log("submit with q6 deselected:", submit);
await shot("submit-error");

ws.close();
```

- [ ] **Step 6: Launch headless Chrome and run the script**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --remote-debugging-port=9333 --user-data-dir="$SHOT_DIR/chrome-profile" about:blank &
sleep 2
SHOT_DIR="$SHOT_DIR" node "$SHOT_DIR/verify-deselect.mjs"
```

Expected console output (values, not necessarily formatting):
- `q1 v5 selected:` → `checked: true, checkedInGroup: 1, stampOpacity: "1"`
- `q1 v5 after second tap:` → `checked: false, checkedInGroup: 0, stampOpacity: "0"` ← the feature
- `q1 v5 reselected:` → `checked: true, checkedInGroup: 1, stampOpacity: "1"`
- `q2 v3 after Space:` → `checked: false, checkedInGroup: 0, stampOpacity: "0"` ← keyboard parity
- `q2 v3 after Space again:` → `checked: true, checkedInGroup: 1, stampOpacity: "1"`
- `q3 after ArrowRight:` → `value` ≠ `"2"` and not `null`, `checkedInGroup: 1`, `stampOpacity: "1"` (arrows move, never clear; in RTL ArrowRight may go to a lower index — any single checked value other than "2" is correct)
- `submit with q6 deselected:` → `errorPresent: true, textOk: true, formStillThere: true`
- three `saved …/q1-selected.png` / `…/q1-deselected.png` / `…/submit-error.png` lines

If `q1 v5 after second tap` still shows `checked: true`, the deselect handler isn't seeing the pre-click state — re-check that `onClick` compares against the `selected` state (not `event.currentTarget.checked`, which is already `true` by click time) before debugging anything else.

- [ ] **Step 7: Inspect the three screenshots**

Open `$SHOT_DIR/q1-selected.png`, `$SHOT_DIR/q1-deselected.png`, `$SHOT_DIR/submit-error.png` (780px wide: 390 CSS px × DSF 2). Confirm:
- selected: q1's chosen circle is solid red with the cream bars stamped in;
- deselected: all five q1 circles are back to the light outline state — no red fill, no bars, label no longer bold — indistinguishable from never-selected;
- submit-error: the form is still present (no thank-you), with the red inline error under q6 and the summary alert box above the submit button.

- [ ] **Step 8: Clean up Chrome**

```bash
pkill -f 'remote-debugging-port=9333'
```

- [ ] **Step 9: Commit**

```bash
git add src/components/RatingQuestion.tsx
git commit -m "Let a second tap deselect a rating circle"
```
