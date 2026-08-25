---
name: ux-brainstorm
description: Run a multi-agent pipeline that generates, critiques, revises, and scores new UX ideas for PassDrop, ending in a ranked report with value/effort/ROI numbers. Use when the user wants to brainstorm UX ideas, invokes /ux-brainstorm, or asks for new feature/design ideas with feasibility and impact scoring.
---

# UX Brainstorm

Multi-agent pipeline: two creative agents ideate while a feasibility-and-fit agent front-loads codebase and `CONTEXT.md` exploration in parallel, three reviewer personas critique and score, ideas get one revision pass, reviewer delta-scoring and feasibility/fit finalization run in parallel, and a synthesis agent produces a ranked report of **at least 5** (typically 10-16) fully worked-out ideas.

Reference files:
- [PERSONAS.md](PERSONAS.md) — prompts for the 2 creative agents, 3 reviewer personas, feasibility-and-fit agent, synthesis agent
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — final markdown report template

## 0. Setup

Parse the trailing text after `/ux-brainstorm` as the focus area (e.g. "onboarding flow", "pass list screen"). If no focus is given, or the user hasn't stated a revision-history preference, ask both via `ask_user` (one at a time) before proceeding:

- **Focus area** — a specific screen/flow, or "whole app" (default if user has no preference).
- **Revision history verbosity** — show original-vs-revised idea + what changed, or final version only.

Then, yourself (no sub-agent — this must be fast, a couple of `glob`/`view` calls), build three short digests:

- **Existing-features digest**: list `src/views/*.vue` page names and skim `CONTEXT.md` if present, and write 5-8 bullets naming what already exists (screens/flows only, not implementation detail).
- **Backlog digest**: read `docs/wishlist.md` if present. Split it into **open items** (unchecked `[ ]` — real, already-stated friction/wants) and **done items** (checked `[x]` — fold these into the existing-features digest so they're not re-proposed).
- **Recent-history digest**: skim `CHANGELOG.md` if present (the last 2-3 entries are enough) to see what shipped most recently and what direction the app has been moving in. This is grounding context, not a constraint — it helps ideas build on recent momentum instead of ignoring it or re-treading it.

Pass all three digests to Creative Agents A and B in step 1: open backlog items and recent history are real signal worth treating as priority seeds (though agents aren't limited to them); the done items (merged into the existing-features digest) are purely to avoid wasted re-proposals. Do not write back to `wishlist.md` or `CHANGELOG.md` — both are read-only input, maintained by the user themselves.

Once setup is done, run the rest of the pipeline **fully automatically** — no more checkpoints until the final report.

## 1. Ideation (parallel) + draft feasibility (parallel)

Launch three background `general-purpose` agents at once (see [PERSONAS.md](PERSONAS.md) for exact prompts):

- **Agent A — Blue-sky**: no constraints, wild ideas welcome, ignore current implementation *except* the existing-features, backlog, and recent-history digests from step 0 (avoid re-proposing what's shipped; treat open backlog items and recent momentum as worthwhile seeds but not a limit). ~6-8 ideas.
- **Agent B — Grounded**: must first explore the codebase (read `CONTEXT.md`, skim `src/views`, `src/components`, `src/stores`) and root ideas in real pain points or natural extensions of existing components — including the open items from the backlog digest and the direction shown in the recent-history digest, which it should treat as strong candidates to flesh out into full ideas. ~6-8 ideas.
- **Feasibility & Fit Agent (draft pass)**: does NOT wait for the merged list. Instead, explore the codebase now (stack, components, store patterns, `CLAUDE.md`) *and* read `CONTEXT.md` closely for PassDrop's stated principles (all data stays on-device, no accounts/cloud, the domain glossary and its "avoid" terms) — produce a written summary covering both: (a) technical constraints/patterns for effort scoring, and (b) the core principles it will check ideas against for fit scoring. This front-loads the expensive exploration so step 5 becomes a cheap scoring-only call.

## 2. Merge & dedupe

Combine both ideation lists yourself. Merge two ideas only if they share the same core mechanism **and** the same user problem — similar wording alone is not enough to merge, and a shared problem with a different mechanism is not enough either. Don't cut anything for quality at this stage. Track which original creative agent (A or B) authored each surviving idea.

## 3. Review round 1 (parallel)

Launch three background `general-purpose` agents at once, one per persona (prompts in [PERSONAS.md](PERSONAS.md), each including its 1/3/5 score-anchor rubric for consistency):

- **Target-User Advocate** — "does this help the person scanning a pass at checkout?"
- **Visual/Interaction Design Purist**
- **Delight & Novelty Enthusiast**

Each reviewer sees the full deduped idea list (titles + pitches only, no codebase access) and returns, per idea: a short qualitative critique from their lens + a 1-5 score anchored to the rubric.

## 4. Revision round (one pass)

For each idea, compile its 3 critiques and send it back to whichever creative agent authored it (A or B) with a prompt to revise the idea once, addressing the feedback where it strengthens the idea (not obligated to agree with every critique). Run Agent A's revisions and Agent B's revisions in parallel, each handling only the ideas it originally authored. Each revision must include a `scope_changed: true/false` flag — true only if the technical scope/implementation approach materially changed (not for wording/positioning tweaks).

## 5. Review round 2 (delta scoring) + feasibility finalization (parallel)

Run both of these at once — they're independent:

- **Reviewer delta pass**: re-run the same three reviewer persona agents, but give each its *own* round-1 critique + score alongside the revised idea, and ask: did this address your concern? Adjust your score accordingly (same rubric anchors). This replaces blind re-scoring with a comparable, calibrated delta.
- **Feasibility & Fit finalization**: reuse the step-1 draft scores (both effort and fit) for all ideas unmodified since round 1. Only send the (small) subset of ideas flagged `scope_changed: true` back to the agent — seeded with the step-1 constraints/principles summary — for fresh effort and fit scores. This is a light call, not a full re-exploration.

## 6. Synthesis

Launch one background `general-purpose` agent (or do it yourself if trivial) that combines, per idea:

- **Value (1-10)**: average of the 3 round-2 delta persona scores, scaled from 1-5 to 1-10.
- **Effort (1-5)**: the finalized feasibility score.
- **Fit (1-5)**: the finalized fit score against `CONTEXT.md` principles.
- **ROI**: `Value / Effort`, rounded to 1 decimal.

Rank all surviving ideas by ROI descending. Every idea that survived dedup gets a row — do not trim further (floor is 5, expect 10-16). Ideas with **Fit ≤ 2** are not excluded or re-ranked, but must be flagged with a ⚠️ next to their title and a one-line note on which principle they strain — this is a visibility flag for you to weigh, not an automatic disqualifier.

## 7. Report

Write the full report per [REPORT-FORMAT.md](REPORT-FORMAT.md) to `docs/ux-ideas/<YYYY-MM-DD>-<focus-slug>.md` in the repo. Include revision history detail only if the user asked for it in step 0. After writing, show the ranked summary table in chat and give the file path.
