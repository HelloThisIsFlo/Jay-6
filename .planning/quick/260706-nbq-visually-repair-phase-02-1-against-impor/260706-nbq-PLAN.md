---
phase: 02.1-visual-redesign-adoption
plan: 260706-nbq
type: execute
quick: true
wave: 1
depends_on: []
files_modified:
  - src/styles/tokens.css
  - src/components/TopBar.svelte
  - src/components/PianoLayout.svelte
  - src/components/VariationPicker.svelte
  - src/App.svelte
autonomous: true
requirements:
  - R1-visual-token-adoption
  - R2-topbar-c2-redesign
  - R3-pad-surface-redesign
  - R5-responsive-redesign-coverage
  - R6-existing-behavior-preservation

must_haves:
  truths:
    - "Fresh current-state screenshots exist at desktop, iPad-sized (1024x768), and iPhone-landscape (844x390) viewports covering every state in the browser-smoke checklist, saved to a non-committed scratch location."
    - "Each captured state is visually compared against the matching mock in .research/design/screenshots and against 02.1-UI-SPEC.md, and every gap is enumerated."
    - "Visual gaps found (clipped controls, unreadable primary labels, inaccessible pad rows, orange misuse per D-03, unreachable/undismissable setup per D-06) are closed with targeted CSS/markup edits in the Svelte source."
    - "just ci passes after the fixes (no behavior regression, protected files untouched)."
    - "Re-captured after-fix screenshots confirm each gap closed at all three viewports."
  artifacts:
    - path: "/tmp/jay6-visual-repair/before/"
      provides: "Baseline current-state screenshots for comparison (not committed)"
    - path: "/tmp/jay6-visual-repair/after/"
      provides: "Post-fix screenshots proving gap closure (not committed)"
  key_links:
    - from: "src/styles/tokens.css"
      to: "src/components/*.svelte"
      via: "shared CSS custom properties"
      pattern: "var(--"
    - from: "src/components/PianoLayout.svelte"
      to: "orange accent"
      via: ".pad.held only (D-03 semantic color)"
      pattern: ".pad.held"
    - from: "src/components/TopBar.svelte"
      to: "setup popover"
      via: "reachable + dismissible across viewports (D-06)"
      pattern: "popover"
---

<objective>
Run the deferred human-verification pass for Phase 02.1 as an evidence-backed visual repair: capture fresh screenshots of the live app, compare them against the approved v3 redesign mocks and 02.1-UI-SPEC.md, and close any visual gaps in the Svelte source.

Purpose: 02.1-VERIFICATION.md is `human_needed` because Plan 04's Playwright smoke left no retained screenshots for independent inspection. This plan produces the missing before/after evidence and fixes whatever the comparison surfaces (R1/R3/R5 were flagged ⚠ HUMAN NEEDED).
Output: Non-committed before/after screenshot sets, targeted CSS/markup fixes in the Svelte source, and a green `just ci`.
</objective>

<execution_context>
@/Users/flo/.codex/gsd-core/workflows/execute-plan.md
@/Users/flo/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.planning/phases/02.1-visual-redesign-adoption/02.1-UI-SPEC.md
@.planning/phases/02.1-visual-redesign-adoption/02.1-UAT.md
@.planning/phases/02.1-visual-redesign-adoption/02.1-VERIFICATION.md
@.research/design/README.md
@.codex/skills/sketch-findings-jay-6/references/tokens.md
@.codex/skills/sketch-findings-jay-6/references/topbar.md
@.codex/skills/sketch-findings-jay-6/references/pads-and-feedback.md
@.codex/skills/sketch-findings-jay-6/references/variations.md
@src/App.svelte
@src/components/TopBar.svelte
@src/components/PianoLayout.svelte
@src/components/VariationPicker.svelte
@src/styles/tokens.css

Target mocks to Read for comparison (Read renders PNGs visually):
- .research/design/screenshots/01-topbar-c2-recommended.png (closed C2 TopBar)
- .research/design/screenshots/04-full-mock-v2-recommended.png (full instrument shell + lifted pads + held-orange pad) — IGNORE the SUGGESTIONS/progression rail and toast: both are out of scope this phase per 02.1-UI-SPEC Scope Lock
- .research/design/screenshots/02-variations-arp-composed.png (Arp composed picker)
- .research/design/screenshots/05-variations-beat-grid.png (Beat 6x2 grid)
- .research/design/screenshots/06-variations-rhythm-gate-tiles.png (Rhythm Gate 4x3 tiles)
- 03-progressions-chip-rail.png and 07-toast-bottom-center-pill.png are FUTURE-ONLY references — do not implement or diff against them
</context>

<tasks>

<task type="auto">
  <name>Task 1: Capture fresh current-state screenshots at three viewports</name>
  <files>/tmp/jay6-visual-repair/before/ (scratch, not committed)</files>
  <read_first>
    @src/App.svelte
    @src/components/TopBar.svelte
    @src/components/PianoLayout.svelte
    @src/components/VariationPicker.svelte
    @.planning/phases/02.1-visual-redesign-adoption/02.1-UI-SPEC.md
  </read_first>
  <action>
    Start the Vite dev server in the background with `just dev` (run_in_background) and read the printed Local URL (Vite default is http://localhost:5173). Create the scratch dir `/tmp/jay6-visual-repair/before/` (NOT under the repo, never committed).

    Drive the live app with the Playwright MCP browser tools (`mcp__plugin_playwright_playwright_*`: browser_navigate, browser_resize, browser_click, browser_press_key, browser_take_screenshot). For EACH of the three viewports — desktop (1440x900), iPad-sized (1024x768), and iPhone-landscape (844x390) — resize then capture the browser-smoke checklist states, saving each as a descriptive `{viewport}-{state}.png` into the before/ dir:
    - closed TopBar / full instrument shell
    - open setup popover (click the setup status pill) — confirm it opens and can be dismissed
    - BPM readout in pill and in the setup popover, plus the Clock control (Int/Ext). Web MIDI is typically permission-denied in the automated browser, so the live Ext-clock read-only state may not be enterable — capture the Int-clock BPM + Clock control and note that the Ext read-only binding is source-verified in TopBar.svelte if no MIDI input is selectable
    - bank controls (prev/next + direct select), transpose stepper, latch control
    - Hold style selected → no variation picker shown
    - Arp picker, Beat grid, Rhythm Gate tiles, and the Rhythm Gate gate slider (present only for rhythm4/rhythm5)
    - pad pointer press then release (pointer down/up on a pad, e.g. C), keyboard pad press then release (App.svelte maps computer keys to pads, e.g. `a` for C), and a latched pad highlight (enable latch, press+release a pad, confirm it stays lit)

    The dense per-style pickers and gate slider can be captured at desktop primarily; the closed TopBar, open setup popover, and an active pad must be captured at all three viewports (02.1-UI-SPEC Responsive Contract). Do NOT commit anything; this task only produces scratch evidence.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const d='/tmp/jay6-visual-repair/before'; const n=fs.existsSync(d)?fs.readdirSync(d).filter(f=>f.endsWith('.png')).length:0; if(n<10){console.error('expected >=10 before screenshots, found '+n); process.exit(1);} console.log(n+' before screenshots captured');"</automated>
  </verify>
  <done>The before/ dir holds fresh screenshots covering closed TopBar, open setup popover, BPM/clock, bank/transpose/latch, Hold no-picker, Arp/Beat/Rhythm-Gate pickers, gate slider, and pointer/keyboard/latched pad states across the three viewports.</done>
</task>

<task type="auto">
  <name>Task 2: Diff against mocks and apply targeted visual fixes</name>
  <files>src/styles/tokens.css, src/components/TopBar.svelte, src/components/PianoLayout.svelte, src/components/VariationPicker.svelte, src/App.svelte</files>
  <read_first>
    @.planning/phases/02.1-visual-redesign-adoption/02.1-UI-SPEC.md
    @.codex/skills/sketch-findings-jay-6/references/topbar.md
    @.codex/skills/sketch-findings-jay-6/references/pads-and-feedback.md
    @.codex/skills/sketch-findings-jay-6/references/variations.md
  </read_first>
  <action>
    Read each before/ screenshot and Read the matching target mock (01/02/04/05/06), then compare state-by-state against the mock AND the 02.1-UI-SPEC contracts. Invoke `Skill("frontend-design")` for aesthetic judgment on any fix — spacing, contrast, hierarchy, typography — so changes read as intentional, not templated.

    Enumerate concrete gaps, then fix them with the smallest possible scoped CSS/markup edits in the Svelte source. Prioritize the acceptance-blocking defects called out in 02.1-UAT test 1 and 02.1-VERIFICATION:
    - clipped or overflowing controls (TopBar groups, setup popover fields, gate slider)
    - unreadable or overlapping primary labels (pad chord names must stay legible at all three sizes per Typography contract)
    - inaccessible or trapped pad rows / setup fields at iPad and iPhone-landscape (short-viewport scroll escape must remain; nothing off-screen — D-06)
    - orange used anywhere other than a currently sounding or latched pad — orange stays scoped to `.pad.held`; selected variation cells, latch-enabled-only, hover, focus, and setup states use steel/border treatment (D-03)
    - setup popover must open from the pill AND be dismissible on desktop, iPad, and iPhone-landscape (D-06)

    Honor the locked contract: keep global UI state in state.svelte.ts, do not touch engines/tickSource/midi/clock/banks.data.json or any playback behavior, render MIDI device names through Svelte text interpolation only, and preserve PianoLayout pointer capture + all release paths. This is a restyle-only repair — no new surfaces (no progression rail, sequencer, or toast — those stay out of scope per Scope Lock).

    If a state already matches the mock and UI-SPEC, record it as matching and make NO edit — do not invent changes to appear productive (Plan 04 legitimately needed zero source edits; a zero-gap outcome for a given state is valid).
  </action>
  <verify>
    <automated>just check</automated>
  </verify>
  <done>Every enumerated visual gap is either fixed with a scoped source edit or explicitly recorded as already-matching; `just check` reports 0 errors and 0 warnings; no protected behavior file was modified.</done>
</task>

<task type="auto">
  <name>Task 3: Regression gate and re-capture to prove closure</name>
  <files>/tmp/jay6-visual-repair/after/ (scratch, not committed)</files>
  <read_first>
    @Justfile
    @.planning/phases/02.1-visual-redesign-adoption/02.1-UAT.md
  </read_first>
  <action>
    Run `just ci` (check + test + build) to confirm the fixes introduced no regression. If the dev server was stopped, restart `just dev` in the background.

    Re-capture the states that had gaps (at minimum the three cross-viewport states: closed TopBar, open setup popover, active pad, plus any specific state that was fixed) into `/tmp/jay6-visual-repair/after/` using the same Playwright MCP flow as Task 1. Read the after/ screenshots against the matching mocks and confirm each previously-identified gap is closed and no new gap was introduced.

    Record a concise findings summary (per-state: matched / fixed-what / still-open) so the operator can fold the result into 02.1-UAT test 1 and flip 02.1-VERIFICATION's human-needed items. Do NOT commit the scratch screenshots; commit only the source fixes (if any) plus this plan. Note the temp screenshots live at /tmp/jay6-visual-repair and are safe to delete after review.
  </action>
  <verify>
    <automated>just ci</automated>
    <automated>node -e "const fs=require('fs'); const d='/tmp/jay6-visual-repair/after'; const n=fs.existsSync(d)?fs.readdirSync(d).filter(f=>f.endsWith('.png')).length:0; if(n<3){console.error('expected >=3 after screenshots, found '+n); process.exit(1);} console.log(n+' after screenshots captured');"</automated>
    <human-check>Eyeball before/ vs after/ vs the approved mocks to sign off the visual match; confirm no clipped controls, unreadable labels, or inaccessible pad rows remain.</human-check>
  </verify>
  <done>`just ci` passes green, after/ screenshots confirm every gap closed at the affected viewports, and a per-state findings summary is recorded for the operator to update UAT/VERIFICATION.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser controls → local MIDI/app state | Restyle must keep controls routing through existing state + MIDI paths, unchanged. |
| Visual state → user interpretation | Orange must mean only "currently sounding or latched pad"; misuse would spoof active state. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-nbq-01 | Tampering | Svelte CSS/markup edits | medium | mitigate | Task 3 runs `just ci`; Task 2 forbids touching engines/tickSource/midi/clock/banks.data.json and preserves pointer release paths. |
| T-nbq-02 | Spoofing | Active/selected visual semantics | low | mitigate | Task 2 enforces D-03 — orange scoped to `.pad.held` only; selected/latch-enabled/hover/focus/setup use steel/border. |
| T-nbq-SC | Tampering | npm/pip/cargo installs | low | accept | No dependency changes; restyle uses existing tokens + `just` commands only. |
</threat_model>

<verification>
- `just check` passes (0 errors, 0 warnings) after fixes.
- `just ci` passes (check + test + build) — no regression.
- before/ and after/ screenshot sets exist in /tmp/jay6-visual-repair (not committed).
- Each previously-identified gap is closed in after/ at the affected viewports.
- No progression rail, sequencer, or toast surface was added (Scope Lock).
- src/banks.data.json, src/engines/, src/tickSource.ts, src/midi.ts, src/clock.ts unchanged.
</verification>

<success_criteria>
- Live app visually matches the approved v3 mocks (01/02/04/05/06) and 02.1-UI-SPEC at desktop, iPad-sized, and iPhone-landscape, with no clipped controls, unreadable primary labels, or inaccessible pad rows.
- D-03 orange semantics and D-06 setup reachability/dismissibility hold across all three viewports.
- Evidence (before/after screenshots + findings summary) exists so the operator can close 02.1-UAT test 1 and the human-needed items in 02.1-VERIFICATION.
</success_criteria>

<output>
Commit only the source fixes (if any) plus this plan file. Scratch screenshots at /tmp/jay6-visual-repair remain uncommitted. Record the per-state findings summary in the task output for the operator to fold into 02.1-UAT.md and 02.1-VERIFICATION.md.
</output>
