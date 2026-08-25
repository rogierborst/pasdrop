---
name: ux-brainstorm
description: Run a multi-agent pipeline that generates, critiques, revises, and scores new UX ideas for PassDrop, ending in a ranked report with value/effort/ROI numbers. Use when the user wants to brainstorm UX ideas, invokes /ux-brainstorm, or asks for new feature/design ideas with feasibility and impact scoring.
---

# UX Brainstorm

Multi-agent pipeline: two creative agents ideate, three reviewer personas critique and score, ideas get one revision pass, a feasibility agent grounds effort in the real codebase, and a synthesis agent produces a ranked report of **at least 5** (typically 10-16) fully worked-out ideas.

Reference files:
- [PERSONAS.md](PERSONAS.md) — prompts for the 2 creative agents, 3 reviewer personas, feasibility agent, synthesis agent
- [REPORT-FORMAT.md](REPORT-FORMAT.md) — final markdown report template

## 0. Setup

Parse the trailing text after `/ux-brainstorm` as the focus area (e.g. "onboarding flow", "pass list screen"). If no focus is given, or the user hasn't stated a revision-history preference, ask both via `ask_user` (one at a time) before proceeding:

- **Focus area** — a specific screen/flow, or "whole app" (default if user has no preference).
- **Revision history verbosity** — show original-vs-revised idea + what changed, or final version only.

Once both are known, run the rest of the pipeline **fully automatically** — no more checkpoints until the final report.

## 1. Ideation (parallel)

Launch two background `general-purpose` agents at once (see [PERSONAS.md](PERSONAS.md) for exact prompts):

- **Agent A — Blue-sky**: no constraints, wild ideas welcome, ignore current implementation. ~6-8 ideas.
- **Agent B — Grounded**: must first explore the codebase (read `CONTEXT.md`, skim `src/views`, `src/components`, `src/stores`) and root ideas in real pain points or natural extensions of existing components. ~6-8 ideas.

Each idea from both agents must have: a short title, a one-paragraph pitch, and the user problem it solves.

## 2. Merge & dedupe

Combine both lists yourself. Merge near-duplicate ideas (same core concept, different wording) into one, keeping the stronger pitch. Don't cut anything for quality at this stage — only for true duplication. Track which original creative agent (A or B) authored each surviving idea.

## 3. Review round 1 (parallel)

Launch three background `general-purpose` agents at once, one per persona (prompts in [PERSONAS.md](PERSONAS.md)):

- **Marketing Expert** — "what sells?"
- **Visual/Interaction Design Purist**
- **Delight & Novelty Enthusiast**

Each reviewer sees the full deduped idea list (titles + pitches only, no codebase access) and returns, per idea: a short qualitative critique from their lens + a 1-5 score.

## 4. Revision round (one pass)

For each idea, compile its 3 critiques and send it back to whichever creative agent authored it (A or B) with a prompt to revise the idea once, addressing the feedback where it strengthens the idea (not obligated to agree with every critique). Run Agent A's revisions and Agent B's revisions in parallel, each handling only the ideas it originally authored.

## 5. Review round 2

Re-run the same three reviewer persona agents (fresh calls, same personas) on the revised ideas only, producing updated critiques + scores. This is the final critique/score used downstream.

## 6. Feasibility scoring

Launch one background `general-purpose` agent that explores the actual PassDrop codebase (stack, existing components, store patterns — see `CLAUDE.md`) and scores each final revised idea 1-5 on implementation difficulty (1 = trivial, 5 = major undertaking), with a short justification per idea grounded in real files/patterns it finds.

## 7. Synthesis

Launch one background `general-purpose` agent (or do it yourself if trivial) that combines, per idea:

- **Value (1-10)**: average of the 3 round-2 persona scores, scaled from 1-5 to 1-10.
- **Effort (1-5)**: the feasibility agent's score.
- **ROI**: `Value / Effort`, rounded to 1 decimal.

Rank all surviving ideas by ROI descending. Every idea that survived dedup gets a row — do not trim further (floor is 5, expect 10-16).

## 8. Report

Write the full report per [REPORT-FORMAT.md](REPORT-FORMAT.md) to `docs/ux-ideas/<YYYY-MM-DD>-<focus-slug>.md` in the repo. Include revision history detail only if the user asked for it in step 0. After writing, show the ranked summary table in chat and give the file path.
