# Report Format

Write the final report to `docs/ux-ideas/<YYYY-MM-DD>-<focus-slug>.md`. Structure:

```markdown
# UX Brainstorm: <Focus Area> — <Date>

## Summary

Ranked table of all ideas by ROI descending.

| Rank | Idea | Value (1-10) | Effort (1-5) | ROI | Takeaway |
|---|---|---|---|---|---|
| 1 | ... | 8.7 | 2 | 4.4 | Quick win |
| ... | | | | | |

## Ideas

One section per idea, in ranked order.

### <Rank>. <Idea Title>

**Pitch:** final revised pitch (1 paragraph)

**Problem it solves:** one sentence

<!-- only if user asked for revision history in step 0 -->
**Revision history:** original pitch → what changed and why (from the revision prompt's "what changed and why" note)

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: X/5):** critique text
- 🎨 **Design Purist (score: X/5):** critique text
- ✨ **Delight & Novelty (score: X/5):** critique text

**Feasibility (effort: X/5):** justification text, naming real files/patterns

**Scores:** Value **X/10** · Effort **X/5** · ROI **X**

---
```

## Notes

- Keep the summary table at the top so the ranked list is skimmable without reading every section.
- Idea order in the "Ideas" section follows the same rank as the summary table.
- Slugify the focus area for the filename (lowercase, hyphens, no special characters). Use "whole-app" if no specific focus was given.
- If two ideas tie on ROI, break ties by higher Value.
