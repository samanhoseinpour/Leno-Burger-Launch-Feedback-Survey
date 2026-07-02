# Logo Stamp in Selected Rating Circles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-02-logo-selected-rating-design.md`

**Goal:** When a guest selects a rating option on the survey, the circle fills red and the three cream Leno bars pop in — the brand badge "stamped" into the selected circle.

**Architecture:** Extract the three-bar SVG from `Brand` into a shared `LenoMark` component (same file), then render it inside the already-`aria-hidden` circle span in `RatingQuestion`. The mark is revealed purely in CSS from the radio's `:checked` state, via the option label's existing `group` class and `:has()` (`group-has-checked:` in Tailwind v4) — the mark is a *descendant* of the circle span, not a sibling of the radio, so `peer-checked:` cannot reach it directly. No JS, no new state, no props or data changes.

**Tech Stack:** Next.js 16.2.9 (App Router) + React 19, TypeScript, Tailwind CSS v4. Verification: ESLint, `next build`, and headless Chrome driven over CDP with true device emulation.

## Global Constraints

Every task's requirements implicitly include all of these.

- **Persian copy is verbatim and untouched.** This feature changes no user-facing string. Do not "fix" any Persian text you see.
- **Stored score = array index + 1.** Do not touch `value={index + 1}`, the input `name`s, or any submit logic. RTL flips visual order only.
- **A11y invariants:** the circle span keeps `aria-hidden="true"`; the radio keeps `peer sr-only`; every `peer-focus-visible:*` and `peer-checked:*` class already on the circle span stays exactly as-is.
- **Flat brand:** no gradients, no shadows. Colors only via existing tokens (`text-cream`, `bg-brand`, …).
- **No test framework exists and none may be added** (CLAUDE.md). Verification = `npm run lint` + `npm run build` + CDP device-emulated checks.
- **Never use plain headless `--screenshot` for phone widths** — it produces false right-edge clipping below ~500px window width. Always CDP `Emulation.setDeviceMetricsOverride` (as scripted below).
- **Commits:** single short imperative subject line only — no body, no `Co-Authored-By` trailer.
- Node ≥ 22 required for the verify script (global `WebSocket`; this machine runs Node 24). Dev server is `npm run dev` at `http://localhost:3000`.
- `$SHOT_DIR` in commands = your session scratchpad directory (any writable temp dir works). Files there are throwaway — never commit them.

## File Structure

- `src/components/Brand.tsx` (modify) — brand lockup; gains the exported `LenoMark` so the SVG has one source of truth. Public `Brand` API unchanged.
- `src/components/RatingQuestion.tsx` (modify) — the 5-point radio group; the selected circle gains the stamped mark.
- `$SHOT_DIR/verify-stamp.mjs` (create, throwaway) — CDP verification script; not committed.

No new source files; no schema, action, or copy changes.

---

### Task 1: Extract `LenoMark` from `Brand`

**Files:**
- Modify: `src/components/Brand.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `export function LenoMark({ className }: { className?: string }): React.JSX.Element` — renders the bare `<svg viewBox="10 32 100 70" aria-hidden="true">` three-bar mark, filled with `currentColor` so the parent's text color paints it. Task 2 imports it as `import { LenoMark } from "./Brand";`.

- [ ] **Step 1: Ensure the dev server is up and record the baseline mark count**

```bash
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" != "200" ]; then
  npm run dev > "$SHOT_DIR/dev.log" 2>&1 &
  for i in $(seq 1 30); do
    sleep 1
    [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" = "200" ] && break
  done
fi
curl -s http://localhost:3000 | grep -o 'viewBox="10 32 100 70"' | wc -l | tr -d ' '
```

Expected output: `2` (header badge + footer badge). If it is not 2, stop and investigate before editing anything — Task 2's counts assume this baseline.

- [ ] **Step 2: Replace `src/components/Brand.tsx` with this exact content**

```tsx
// The Leno mark: a circular badge holding the three stacked rounded bars
// (inline SVG from SPEC.md §"Logo mark"), next to the "Leno" wordmark.
//
// The badge contrasts the surface it sits on so it stays legible:
//   surface="red"   → cream badge + red mark  (on the red header / footer band)
//   surface="paper" → red badge + cream mark  (on the warm paper surfaces)
// Both use the spec's red/cream pairings; the assignment keeps the mark visible.
//
// markOnly renders just the badge (used in the footer band, which has no wordmark).

type BrandProps = {
  surface?: "red" | "paper";
  markOnly?: boolean;
  className?: string;
};

// The bare three-bar mark. It draws in currentColor, so whichever surface
// renders it (badge span, selected rating circle) picks the color via CSS.
export function LenoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="10 32 100 70" aria-hidden="true" className={className}>
      <g fill="currentColor">
        <rect x="20" y="40" width="80" height="14" rx="7" />
        <rect x="14" y="60" width="92" height="14" rx="3" />
        <rect x="20" y="80" width="80" height="14" rx="7" />
      </g>
    </svg>
  );
}

export function Brand({
  surface = "red",
  markOnly = false,
  className = "",
}: BrandProps) {
  const onRed = surface === "red";

  return (
    // The mark + Latin "Leno" wordmark is a fixed LTR lockup (mark left,
    // wordmark right) — pin the direction so it renders identically on RTL
    // surfaces (e.g. /admin) instead of flipping to inherit the page's dir.
    <div dir="ltr" className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-full ${
          onRed ? "bg-cream text-brand" : "bg-brand text-cream"
        }`}
      >
        <LenoMark className="w-7" />
      </span>

      {!markOnly && (
        <span
          dir="ltr"
          className={`font-display text-[1.7rem] leading-none tracking-tight ${
            onRed ? "text-cream" : "text-ink"
          }`}
        >
          Leno
        </span>
      )}
    </div>
  );
}
```

The only changes from the current file: the SVG moved out of `Brand`'s badge span into the new exported `LenoMark` (which adds `aria-hidden="true"` on the `<svg>` itself — harmless, since every consumer also wraps it in an `aria-hidden` span), and the badge span now renders `<LenoMark className="w-7" />`.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: exit 0, no output about `Brand.tsx`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exit 0 (runs `prisma generate`, `prisma migrate deploy`, `next build`; all succeed as before this change).

- [ ] **Step 5: Verify the rendered markup is unchanged**

```bash
curl -s http://localhost:3000 | grep -o 'viewBox="10 32 100 70"' | wc -l | tr -d ' '
```

Expected output: `2` — identical to the Step 1 baseline (pure refactor, zero visual change). If the count differs or the page errors, the dev watcher may be serving stale HTML: restart `npm run dev` and re-check before assuming the code is wrong.

- [ ] **Step 6: Commit**

```bash
git add src/components/Brand.tsx
git commit -m "Extract the Leno bar mark into a shared LenoMark component"
```

---

### Task 2: Stamp the mark into the selected rating circle

**Files:**
- Modify: `src/components/RatingQuestion.tsx`
- Create (throwaway, never committed): `$SHOT_DIR/verify-stamp.mjs`

**Interfaces:**
- Consumes: `LenoMark` from Task 1 — `import { LenoMark } from "./Brand";` (props: `{ className?: string }`).
- Produces: no new exports; `RatingQuestion`'s props are unchanged.

- [ ] **Step 1: Replace `src/components/RatingQuestion.tsx` with this exact content**

```tsx
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
        {scale.map((label, index) => (
          <label
            key={index}
            className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl py-1"
          >
            <input
              type="radio"
              name={id}
              value={index + 1}
              onChange={onSelect}
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
        ))}
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

The changes from the current file: the new `LenoMark` import; the circle span gains `grid place-items-center` (its size, borders, and every `peer-*` class are untouched); and the span — previously self-closing and empty — now wraps the `LenoMark` stamp. `w-7` matches the badge's own mark-to-circle proportion at both `size-11` and `sm:size-12`. Everything else is byte-identical.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 4: Confirm the dev server serves the new markup**

```bash
curl -s http://localhost:3000 | grep -o 'viewBox="10 32 100 70"' | wc -l | tr -d ' '
curl -s http://localhost:3000 | grep -o 'group-has-checked:opacity-100' | head -1
```

Expected: first command prints `32` (2 badges + 6 questions × 5 circles); second prints `group-has-checked:opacity-100`. If either is off, restart `npm run dev` (a wedged watcher can serve stale route HTML while CSS updates flow) and re-check.

- [ ] **Step 5: Write `$SHOT_DIR/verify-stamp.mjs` with this exact content**

```js
// Throwaway CDP check for the rating-circle logo stamp. Not committed.
// Usage: SHOT_DIR=<scratch dir> node verify-stamp.mjs
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

const readState = (name, value) => evaluate(`(() => {
  const input = document.querySelector('input[name="${name}"][value="${value}"]');
  const svg = input.closest("label").querySelector("svg");
  const cs = getComputedStyle(svg);
  return { opacity: cs.opacity, scale: cs.scale, transform: cs.transform };
})()`);

console.log("q1 v5 before:", await readState("q1", 5));
await shot("q1-before");

await evaluate(`document.querySelector('input[name="q1"][value="5"]').click()`);
await sleep(400); // let the 200ms pop settle
console.log("q1 v5 after click:", await readState("q1", 5));
await shot("q1-after");

// Reduced motion: the stamp must land instantly and leave the old option.
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await evaluate(`document.querySelector('input[name="q1"][value="1"]').click()`);
await sleep(60);
console.log("q1 v1 (reduced motion, new):", await readState("q1", 1));
console.log("q1 v5 (reduced motion, old):", await readState("q1", 5));

// Keyboard: arrows move the checked state, and the stamp follows it.
await evaluate(`document.querySelector('input[name="q2"][value="3"]').click()`);
await evaluate(`document.querySelector('input[name="q2"][value="3"]').focus()`);
await send("Input.dispatchKeyEvent", {
  type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
});
await send("Input.dispatchKeyEvent", {
  type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39,
});
await sleep(80);
const kb = await evaluate(`(() => {
  const checked = document.querySelector('input[name="q2"]:checked');
  const svg = checked.closest("label").querySelector("svg");
  return { value: checked.value, opacity: getComputedStyle(svg).opacity };
})()`);
console.log("q2 after ArrowRight:", kb);

ws.close();
```

- [ ] **Step 6: Launch headless Chrome and run the script**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --remote-debugging-port=9333 --user-data-dir="$SHOT_DIR/chrome-profile" about:blank &
sleep 2
SHOT_DIR="$SHOT_DIR" node "$SHOT_DIR/verify-stamp.mjs"
```

Expected console output (values, not necessarily formatting):
- `q1 v5 before:` → `opacity: "0"`, `scale: "0.75"`
- `q1 v5 after click:` → `opacity: "1"`, `scale: "1"`
- `q1 v1 (reduced motion, new):` → `opacity: "1"` after only ~60ms (instant reveal)
- `q1 v5 (reduced motion, old):` → `opacity: "0"` (stamp moved off the old option)
- `q2 after ArrowRight:` → `value` ≠ `"3"`, `opacity: "1"` (keyboard drives the same stamp)
- two `saved …/q1-before.png` / `…/q1-after.png` lines

**Fallback (only if "after click" opacity stays `"0"`):** the `group-has-checked:` shorthand didn't emit CSS in this Tailwind v4 minor. In `RatingQuestion.tsx`, replace the two prefixes with the arbitrary form — `group-has-[:checked]:opacity-100 group-has-[:checked]:scale-100` (semantically identical selector) — then repeat Steps 2–6.

- [ ] **Step 7: Inspect the two screenshots**

Open `$SHOT_DIR/q1-before.png` and `$SHOT_DIR/q1-after.png` (they are 780px wide: 390 CSS px × DSF 2). Confirm:
- before: all five q1 circles are light with no bars visible;
- after: the selected circle is solid red with the three cream bars, visually matching the footer badge; the other circles are unchanged; no label text is clipped at the container edges.

- [ ] **Step 8: Clean up Chrome**

```bash
pkill -f 'remote-debugging-port=9333'
```

- [ ] **Step 9: Commit**

```bash
git add src/components/RatingQuestion.tsx
git commit -m "Stamp the Leno mark into the selected rating circle"
```
