# UX Brainstorm: Pass List / Home Screen — 2026-08-25

## Summary

Ranked table of all ideas by ROI descending.

| Rank | Idea | Value (1-10) | Effort (1-5) | ROI | Takeaway |
|---|---|---|---|---|---|
| 1 | Focused Status Cards | 7.3 | 1 | 7.3 | High value, trivial effort — quick win |
| 2 | Search with Opinionated Shortcuts | 8.0 | 2 | 4.0 | High value, low effort — quick win |
| 3 | Today Needs Attention | 8.0 | 2 | 4.0 | High value, low effort — quick win |
| 4 | Saved Pass Confirmation Row | 8.0 | 2 | 4.0 | High value, low effort — quick win |
| 5 | Helpful Empty Moments | 7.3 | 2 | 3.7 | High value, low effort — quick win |
| 6 | Favorites Up Top | 9.3 | 3 | 3.1 | Highest value overall, moderate effort — strategic bet |
| 7 | Quiet Collection Pulse | 6.7 | 3 | 2.2 | Moderate value, moderate effort — nice-to-have |
| 8 | Ready to Scan Mode | 8.0 | 4 | 2.0 | High value, high effort — strategic bet |
| 9 | Spotlight Pass | 8.7 | 5 | 1.7 | High value, major effort — strategic bet |
| 10 | Fast Shelf | 6.7 | 4 | 1.7 | Moderate value, high effort — deprioritize |
| 11 | Recent Use Trail | 6.7 | 5 | 1.3 | Moderate value, major effort — deprioritize |
| 12 | Lens-Based Views | 6.0 | 5 | 1.2 | Low-moderate value, major effort — deprioritize |

## Ideas

### 1. Focused Status Cards

**Pitch:** Tighten each pass card around a strict hierarchy: one primary cue and, at most, one secondary cue beyond the title. Show either an urgency signal (expiring soon / expired / reminder due) or a quiet category marker, not a pile of badges. Small touches like warm expiry accents or softer category pills can add personality without turning the card into chrome.

**Problem it solves:** Users should be able to tell what a pass is and whether it needs attention without opening it.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 3/5):** This is good product hygiene, not a growth hook. Users will notice the app feels calmer and easier to scan, which helps retention a bit, but nobody downloads PassDrop because "the badge hierarchy is cleaner."
- 🎨 **Design Purist (score: 5/5):** This shows strong restraint: one primary signal plus one secondary cue is exactly how a mobile card stays scannable under stress. If executed with disciplined typography and spacing, it would make the list feel calmer, clearer, and much more polished than badge-heavy alternatives.
- ✨ **Delight & Novelty (score: 3/5):** This is good restraint, and restraint can absolutely feel premium—but it's more elegant than delightful. The warm expiry accents and softer pills add a little charm, yet the idea mostly removes noise rather than creating a memorable moment of personality.

**Feasibility (effort: 1/5):** Mostly an isolated `src\components\PassCard.vue` refinement. The card already has a clear structure plus `ExpiredBadge.vue` and expiry logic inline, so tightening hierarchy and adding one extra quiet cue is small UI work.

**Scores:** Value **7.3/10** · Effort **1/5** · ROI **7.3**

---

### 2. Search with Opinionated Shortcuts

**Pitch:** Add a lightweight search field paired with a deliberately small set of smart shortcuts—such as Expiring soon, Expired, QR only, and Uncategorized—so search, chips, and category tabs each have a distinct role instead of competing equally. The search feels instant and crisp, with opinionated defaults that reflect real pass-management jobs rather than generic filtering.

**Problem it solves:** Category tabs alone are not enough once users have enough passes to forget labels, formats, or status.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 4/5):** Once collections grow, this becomes table stakes — but good table stakes still matter a lot. "Search plus smart shortcuts" is not sexy, yet users absolutely notice when retrieval is fast, and fast retrieval is the core job here.
- 🎨 **Design Purist (score: 5/5):** This is excellent product hygiene: search plus a few opinionated shortcuts solves real retrieval problems without overbuilding filter complexity. Distinct roles for search, chips, and tabs is exactly the kind of structural clarity polished apps get right.
- ✨ **Delight & Novelty (score: 3/5):** Opinionated shortcuts are useful and can feel smart, but this is still mostly competence, not charm. The delight will come from speed and surprisingly relevant defaults, not from the concept itself.

**Feasibility (effort: 2/5):** The app already has one filter axis—category tabs via `categoriesStore.selectedCategoryId` and `passesStore.filteredPasses`—so adding query + chips is mostly more derived filtering in `PassesPage.vue`. The needed chip predicates already map to existing fields like `format`, `expires`, `categoryId`, and reminders.

**Scores:** Value **8.0/10** · Effort **2/5** · ROI **4.0**

---

### 3. Today Needs Attention

**Pitch:** Add a compact "Today" shelf above the main stack that only shows a very small number of time-sensitive passes—expiring soon, expired, or reminder-related—so it feels like triage, not a second list. Keep the tone gentle with calm copy and soft urgency styling, and let the shelf collapse away when nothing needs attention, preserving the concierge feeling while avoiding the mini-dashboard trap.

**Problem it solves:** Users can miss urgent passes because the current Home stack gives everything roughly equal visual priority.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 4/5):** This has real user-facing value because it makes the app feel useful today, not just like storage. "The app tells me what matters right now" is a better retention story and a more marketable promise than generic organization.
- 🎨 **Design Purist (score: 4/5):** The triage framing is smart because it creates hierarchy without turning Home into a dashboard. The risk is duplication and visual competition with the main list, so it only works if the shelf stays very small, visually lighter, and easy to ignore when irrelevant.
- ✨ **Delight & Novelty (score: 4/5):** This has a nice "helpful concierge" energy: the app quietly steps forward only when something matters, then disappears when it doesn't. It's not wildly novel, but the compact, calm triage behavior could feel surprisingly caring in everyday use.

**Feasibility (effort: 2/5):** `src\views\PassesPage.vue` already owns the Home layout, and urgency data already exists in `src\composables\usePassExpiry.ts`, `src\stores\passes.ts`, and `src\utils\reminders.ts`. This is mainly a new computed subset + conditional section above `CardStack.vue`.

**Scores:** Value **8.0/10** · Effort **2/5** · ROI **4.0**

---

### 4. Saved Pass Confirmation Row

**Pitch:** After a scan or save, briefly surface the new pass in a small confirmation row with a reassuring cue like "Saved" and a quick reopen affordance. It fades from prominence quickly—more like a post-action handshake than a permanent section—and could borrow a subtle celebratory motion or microcopy to reduce anxiety without adding clutter.

**Problem it solves:** Users need immediate reassurance that a newly scanned pass was saved and is easy to find again.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 3/5):** This solves a real anxiety moment after scanning, which is good for trust and early retention. But it's more reassurance than delight — helpful polish, not a headline feature.
- 🎨 **Design Purist (score: 4/5):** Good idea because save confirmation is often missing in scan flows, and a temporary row is calmer than a toast if it also supports quick recovery. The key is timing and subtlety: if it lingers too long or animates too much, it becomes self-congratulatory clutter.
- ✨ **Delight & Novelty (score: 5/5):** This is a lovely little reassurance moment: fast, warm, and emotionally smart right after a potentially anxious action. A subtle celebratory cue here could make the app feel noticeably more human, because it turns "task complete" into a tiny moment of relief and satisfaction.

**Feasibility (effort: 2/5):** `src\views\NewPassPage.vue` and `AddPage.vue` already save then `router.replace('/passes')`, and `Pass` already gets a `timestamp` in `stores\passes.ts`. The missing piece is a cross-route ephemeral UI state; `useAddPassFlow.ts` shows the pattern, but today it only triggers add flow, not a temporary confirmation row.

**Scores:** Value **8.0/10** · Effort **2/5** · ROI **4.0**

---

### 5. Helpful Empty Moments

**Pitch:** Turn every blank Home state into a context-aware recovery moment with clear explanation, one strong next action, and slightly warm copy. "No passes yet" should confidently invite the add flow; "Nothing in this category" should offer Show all or Add here; empty search should suggest clearing filters — invisible polish that makes the whole app feel intentional and kind.

**Problem it solves:** Blank states currently risk feeling ambiguous or dead-ended instead of guiding users forward.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 2/5):** Necessary, yes; compelling, no. This improves first-run and dead-end moments, which helps conversion at the margins, but it's not something users will remember or mention.
- 🎨 **Design Purist (score: 5/5):** This is foundational polish, not a gimmick, and it meaningfully improves comprehension at low cost. Clear explanation plus one dominant next action is exactly the right pattern for a mobile utility app.
- ✨ **Delight & Novelty (score: 4/5):** Warm, context-aware empty states are one of those "small joys" users absolutely feel, even if they don't name them. This won't make PassDrop magical on its own, but it can make the app feel kind, intentional, and surprisingly alive in dead-end moments.

**Feasibility (effort: 2/5):** There is already a generic empty state in `src\components\CardStack\CardStack.vue` and a separate one in `src\views\CategoriesPage.vue`. The main work is moving Home empty-state decisions up into `PassesPage.vue` so it can distinguish no passes, empty category, and future filter/search-zero states.

**Scores:** Value **7.3/10** · Effort **2/5** · ROI **3.7**

---

### 6. Favorites Up Top

**Pitch:** Let users keep a handful of frequently used passes in a small "always ready" pocket at the top of Home, separate from the rest of the collection. Framing it like the front pocket of a wallet gives the feature more warmth and identity than generic pinning, while preserving its real strength: your everyday staples are instantly there without reorganizing everything else.

**Problem it solves:** Frequent-use passes get lost in the main collection, even though users tend to rely on the same few over and over.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 4/5):** This is boring in the best possible way: obvious, understandable, and useful immediately. "Put your everyday passes in the front pocket" is a solid app-store line because real people get it in one second and can imagine using it daily.
- 🎨 **Design Purist (score: 5/5):** This is highly coherent with real user behavior and easy to understand instantly. A small, explicit favorites area is a familiar, low-friction pattern that improves retrieval without destabilizing the rest of Home.
- ✨ **Delight & Novelty (score: 5/5):** "Front pocket of a wallet" is exactly the kind of metaphor that gives a utility app personality without becoming cute-for-cute's-sake. It's familiar, emotionally legible, and useful—one of the strongest ideas here for making PassDrop feel personal rather than merely organized.

**Feasibility (effort: 3/5):** Persisting a `favorite` flag in `src\stores\passes.ts` is easy, but "top section independent of normal ordering" conflicts with the current manual reorder model in `reorderPasses`. You'd also need a pin/unpin affordance somewhere like `PassCard.vue` or `ShowPassPage.vue`.

**Scores:** Value **9.3/10** · Effort **3/5** · ROI **3.1**

---

### 7. Quiet Collection Pulse

**Pitch:** Recast the summary from a static metrics block into a whisper-quiet pulse line that only appears when it helps, such as "2 need attention" or "3 uncategorized," with each phrase tappable into a filtered view. Rather than always showing multiple counts, keep it situational and lightweight so it supports retrieval instead of competing with it.

**Problem it solves:** Users sometimes need quick orientation about cleanup or urgency, but not a full administrative summary.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 2/5):** Useful, but mostly invisible. It may reduce friction for power users, yet it's too subtle to drive adoption or word-of-mouth unless paired with a stronger retrieval benefit people actually feel.
- 🎨 **Design Purist (score: 5/5):** This is a mature interaction instinct: situational, quiet, and directly actionable rather than ornamental. It respects attention by only appearing when useful, and tappable phrases into filtered views feel coherent with mobile conventions.
- ✨ **Delight & Novelty (score: 3/5):** The whisper-quiet pulse line is tasteful and humane, which I appreciate, but it's still fairly administrative at heart. The tappable phrasing adds some elegance, though it needs really sharp copy to feel like a tiny pleasure instead of just a cleaner status bar.

**Feasibility (effort: 3/5):** The summary line itself is easy in `PassesPage.vue`, but tappable phrases imply a new filter state beyond today's single `categoriesStore.selectedCategoryId` → `passesStore.filteredPasses` flow. That means adding combined filter semantics, not just copy.

**Scores:** Value **6.7/10** · Effort **3/5** · ROI **2.2**

---

### 8. Ready to Scan Mode

**Pitch:** Add an explicit, easy-to-exit "Ready to scan" mode that reshapes Home into large, fast, vertically scrollable pass strips for checkout, boarding, or gate moments. The entry is intentional and obvious, and the exit equally clear, so it feels like a purposeful short-term mode instead of general UI complexity.

**Problem it solves:** Users who need to present multiple passes in stressful real-world situations need a faster path than the normal browsing layout.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 4/5):** This is one of the few ideas with a crisp "oh, that would help in real life" reaction. Stressful moments like boarding or checkout are exactly where people form strong product opinions, so a dedicated high-speed mode has genuine retention and word-of-mouth potential.
- 🎨 **Design Purist (score: 4/5):** A dedicated presentation mode is defensible because the use case is genuinely different and often high-stress. The danger is creating a second Home; it must feel unmistakably temporary, with a strong entry cue and a dead-simple exit.
- ✨ **Delight & Novelty (score: 4/5):** This is situational delight: not whimsical, but deeply satisfying in high-stress real-world moments. The transformation into a bold, presentation-first mode could feel almost heroic if the entry/exit is sharp and the visual shift is confident.

**Feasibility (effort: 4/5):** Rendering is reusable (`src\components\CodeViewer\PassCodePanel.vue`, `BarCode.vue`, `QR-Code.vue`), but Home is architected around overlapped wallet cards in `src\components\CardStack\CardStack.vue`. A scan-ready strip mode is effectively a second Home presentation with its own entry/exit and scrolling behavior.

**Scores:** Value **8.0/10** · Effort **4/5** · ROI **2.0**

---

### 9. Spotlight Pass

**Pitch:** Feature one suggested pass at the top of Home only when confidence is high, with an explicit reason label like "Usually used now" or "Near this location," while leaving the full list untouched beneath it. The key revision is trust: Spotlight should read as a helpful suggestion, not a reordering of reality, so users get the delight of "how did it know?" without losing confidence when the guess is wrong.

**Problem it solves:** Users want the app to reduce hunt time in the moment, but only if proactive suggestions feel transparent, optional, and reliably helpful.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 5/5):** If it's accurate, this is the only idea here that feels like a real "tell a friend" feature. "It just shows me the pass I probably need" is a strong app-store story and a credible differentiator — but only if the confidence threshold is strict enough that it feels smart, not creepy or wrong.
- 🎨 **Design Purist (score: 3/5):** The transparency revision helps, but proactive suggestion UI is still fragile because one wrong guess can feel intrusive or uncanny. Unless confidence is genuinely high and the explanation is crystal clear, it risks undermining trust more than reducing hunt time.
- ✨ **Delight & Novelty (score: 5/5):** "How did it know?" is one of the best delight engines in software when trust is preserved, and the explicit reason label is exactly what keeps this from feeling creepy or chaotic. This has real spark: it can make PassDrop feel perceptive, timely, and a little magical.

**Feasibility (effort: 5/5):** A confident suggestion system is not supported by the current model: `src\stores\passes.ts` has only creation `timestamp`, category, notes, and reminders, not behavior/location signals. To do this well you'd need new instrumentation, possibly geolocation, ranking logic, and explicit "reason" UX on Home.

**Scores:** Value **8.7/10** · Effort **5/5** · ROI **1.7**

---

### 10. Fast Shelf

**Pitch:** Recast the "shelf" as a speed-first quick-access layout, not a new interaction system: the first few passes sit in a compact, tactile row that makes priority obvious at a glance, while the rest remain in a familiar list below. Motion is reduced to crisp cues that confirm what is ready, what is tucked away, and what was just selected—so the physical metaphor adds instant clarity and charm without asking users to learn "pin, collapse, stage" as new behaviors.

**Problem it solves:** Users need the right pass to feel both faster to spot and more physically intuitive to grab, without turning Home into a complex organizer.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 3/5):** Better framing than "fancy shelf interaction," and speed is always sellable, but it still risks sounding like layout theater unless it truly gets people to the right pass faster. If users instantly feel "my important stuff is right there," it helps; if not, it's just rearranged furniture.
- 🎨 **Design Purist (score: 3/5):** The revision is better, but the "shelf" metaphor still risks feeling like branded novelty over a problem that may be solved more cleanly by favorites or attention treatment. If it introduces even slight ambiguity about what is "on the shelf" versus "in the list," it will feel bolted-on.
- ✨ **Delight & Novelty (score: 4/5):** The physicality here is the fun part: a compact top row that feels tactile and "grab-ready" gives Home a bit of snap. It risks becoming just another layout variant, but if the motion and selection cues are crisp, this could add real charm without demanding new mental load.

**Feasibility (effort: 4/5):** Home is currently one stacked surface: `PassesPage.vue` feeds one `CardStack` from `passesStore.filteredPasses`. A separate priority row with motion/selection states means a new top component plus interaction rules that won't fit neatly into the current `useCardDrag.ts` stack model.

**Scores:** Value **6.7/10** · Effort **4/5** · ROI **1.7**

---

### 11. Recent Use Trail

**Pitch:** Move the memory layer out of the main browsing surface and make it an optional reveal on each pass: a tiny "last used" hint on Home can expand into a short recent trail only when the user asks for it. The human, memory-like quality of the idea is intentionally kept, because that charm is the point—but narrowing it to lightweight, user-invoked history makes it feel useful and personal instead of sentimental clutter.

**Problem it solves:** Users sometimes want help remembering whether a pass was used recently, without turning the Home screen into a logbook.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 2/5):** Charming, yes; meaningfully differentiating, probably not. Most users do not care enough about pass memory/history for this to move adoption, and the value is too occasional to justify much surface area.
- 🎨 **Design Purist (score: 4/5):** Moving this behind intentional reveal is the right correction; it keeps the charm without making the main surface sentimental or noisy. Still, the value feels secondary, so it should remain a very lightweight detail rather than earn prime UI real estate.
- ✨ **Delight & Novelty (score: 4/5):** There's something charmingly human about a pass having a little memory, and that's rare in apps like this. Keeping it user-invoked is the right move: it preserves the personality while avoiding the sentimental clutter that would kill the magic.

**Feasibility (effort: 5/5):** There is no recent-use history model at all—`src\stores\passes.ts` stores pass metadata, not scan/use events—and `src\views\ShowPassPage.vue` only renders static pass details. Adding time/place trails means new persisted event logging, reveal UI, and likely location-permission/plugin work.

**Scores:** Value **6.7/10** · Effort **5/5** · ROI **1.3**

---

### 12. Lens-Based Views

**Pitch:** Keep Home stable, but add clearly labeled, lightweight lenses—Today, Expiring Soon, Most Used, Nearby—that users can tap or swipe between without changing the underlying structure of the screen. Each lens should feel like a temporary "view for this moment," not a mode switch, with obvious labels and consistent persistence rules so the feature stays contextual and playful rather than disorienting.

**Problem it solves:** Users need different ways to surface the right pass in different moments, but not at the cost of Home feeling unstable or mode-heavy.

**Reviewer critiques (final, round 2):**

- 🎯 **Marketing (score: 3/5):** Potentially useful, but dangerously close to "extra tabs nobody asked for." If the lenses are ruthlessly chosen around real jobs, it could improve retention; if they're too clever, it becomes mode soup and loses marketing clarity fast.
- 🎨 **Design Purist (score: 3/5):** "Lenses" can sound elegant in concept, but in practice this edges toward mode complexity unless the set is very tight and visually subordinate. Swipe-between views especially risks accidental state changes and a less stable feeling Home screen.
- ✨ **Delight & Novelty (score: 3/5):** The temporary-view framing is smart, but delight-wise this still leans more "well-structured" than "special." The playful potential is there, yet without really distinct visual character or clever defaults, lenses can slip into being just filters with a friendlier name.

**Feasibility (effort: 5/5):** `PassesPage.vue` only supports category tabs today, so swipeable/tappable lenses need a fuller Home state model and persistence rules. It gets much bigger because Most Used and Nearby are unsupported: `Pass` in `src\stores\passes.ts` has no usage/location data, and `package.json` has no geolocation dependency.

**Scores:** Value **6.0/10** · Effort **5/5** · ROI **1.2**

---
