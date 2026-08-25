# Report Format

Write the final report to `docs/ux-ideas/<YYYY-MM-DD>-<focus-slug>.md`. Structure:

```markdown
# UX Brainstorm: <Focus Area> — <Date>

## Summary

Ranked table of all ideas by ROI descending.

| Rank | Idea | Value (1-10) | Effort (1-5) | Fit (1-5) | ROI | Takeaway |
|---|---|---|---|---|---|---|
| 1 | ... | 8.7 | 2 | 5 | 4.4 | Quick win |
| ... | | | | | | |

## Ideas

One section per idea, in ranked order.

### <Rank>. <Idea Title> <!-- prefix with ⚠️ if Fit ≤ 2 -->

**Pitch:** final revised pitch (1 paragraph)

**Problem it solves:** one sentence

<!-- only if Fit ≤ 2 -->
**⚠️ Fit concern:** one line naming which PassDrop principle (from `CONTEXT.md`) this idea strains, e.g. "requires a server/account, conflicts with on-device-only design."

<!-- only if user asked for revision history in step 0 -->
**Revision history:** original pitch → what changed and why (from the revision prompt's "what changed and why" note), followed by each reviewer's delta note (e.g. "🙋 addressed my concern about X by doing Y")

**Reviewer critiques:**

Self-contained assessments of the idea as it stands now — do not reference round 1, "the revision," or that anything changed.

- 🙋 **Target-User Advocate (score: X/5):** critique text
- 🎨 **Design Purist (score: X/5):** critique text
- ✨ **Delight & Novelty (score: X/5):** critique text

**Feasibility (effort: X/5):** justification text, naming real files/patterns

**Fit (X/5):** one-line justification naming the specific principle at stake

**Scores:** Value **X/10** · Effort **X/5** · Fit **X/5** · ROI **X**

---
```

## Notes

- Keep the summary table at the top so the ranked list is skimmable without reading every section.
- Idea order in the "Ideas" section follows the same rank as the summary table.
- Slugify the focus area for the filename (lowercase, hyphens, no special characters). Use "whole-app" if no specific focus was given.
- If two ideas tie on ROI, break ties by higher Value.
- The "Reviewer critiques" section must always read as a fresh, standalone assessment — a reader who skips revision history entirely should never see phrasing like "this addressed my concern" or "the revision improved...". That comparative framing belongs only in the "Revision history" block's delta notes.
