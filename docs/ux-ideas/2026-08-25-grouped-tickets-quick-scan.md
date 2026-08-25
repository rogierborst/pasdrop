# UX Brainstorm: Grouped Tickets & Quick-Scan/Quick-Access Flows (Efteling scenario) — 2026-08-25

Scenario: a family buys 3 individual entry tickets plus 1 parking ticket for a day at De Efteling. At the park entrance, the 3 tickets must be scanned in quick succession. The parking ticket matters at a completely different, high-pressure moment: the parking exit gate, with a queue of cars waiting behind you.

## Summary

| Rank | Idea | Value (1-10) | Effort (1-5) | Fit (1-5) | ROI | Takeaway |
|---|---|---|---|---|---|---|
| 1 | Pin to Urgent Shelf | 8.0 | 2 | 5 | 4.0 | Quick win — build this first |
| 2 | Warm Dark Ticket-Paper Theme | 8.0 | 2 | 4 | 4.0 | Quick win, low-risk polish |
| 3 | Scan Queue Relay Mode | 10.0 | 3 | 5 | 3.3 | Highest value in the set — strategic bet worth prioritizing |
| 4 | Trip Set With Quick Links | 9.3 | 3 | 5 | 3.1 | Strong value, moderate effort — high priority |
| 5 | Backseat Hand-Off View | 8.7 | 3 | 5 | 2.9 | Strong value, moderate effort |
| 6 | Smart Home Surface | 8.0 | 3 | 5 | 2.7 | Good value, needs disciplined scope to earn its effort |
| 7 | Ready Now Context Strip | 8.0 | 3 | 5 | 2.7 | Good value, needs disciplined scope to earn its effort |
| 8 | Family Bundle with Quick Moments | 8.7 | 4 | 4 | 2.2 | Solid value but touches the data model — bigger bet |
| 9 | Assigned-to-a-Person Tickets | 8.7 | 4 | 4 | 2.2 | Solid value but depends on the bundle model existing first |
| 10 | Bundle Pass with Ticket Strip | 8.7 | 4 | 3 | 2.2 | Solid value but naming/glossary friction adds risk |
| 11 | Mark-as-Used Ticket States | 8.0 | 4 | 5 | 2.0 | Worthwhile add-on once a bundle/relay flow exists |
| 12 | Parking Panic Button | 9.3 | 5 | 5 | 1.9 | High value, high effort — strategic bet, needs native work |
| 13 | Trip Timeline with Quiet Stages | 7.3 | 4 | 5 | 1.8 | Lowest ROI — deprioritize or fold into simpler ideas |

## Ideas

### 1. Pin to Urgent Shelf

**Pitch:** Any Pass can be pinned into a compact urgent shelf at the top of the Pass list, separate from Categories and the main stack. It stays visually restrained, but it's always one tap away for high-friction moments like parking or access codes, so the user can open the right Pass immediately without remembering where it lives or scrolling past the rest of the outing.

**Problem it solves:** One high-pressure ticket (the parking pass) matters at a different moment than the rest of the outing's passes and must be retrievable in one move, with a queue of cars waiting.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 5/5):** This is still one of the clearest, most directly useful ideas here. A compact urgent shelf shortens retrieval for high-stress passes without adding much learning cost, and it works well for one-handed, under-pressure use.
- 🎨 **Design Purist (score: 5/5):** This remains the cleanest and most convention-friendly idea in the set. A compact urgent shelf solves a real retrieval problem with minimal cognitive load, and separating it from categories and the main list keeps the hierarchy legible.
- ✨ **Delight & Novelty (score: 2/5):** This is clean, practical, and absolutely worth having for high-stress retrieval moments. Still, the experience is mostly a solid utility affordance rather than something with personality or delight users would remember later.

**Feasibility (effort: 2/5):** Close to a textbook small extension — add a pinned/urgent field in `src\stores\passes.ts` and render a separate shelf above the current card stack in `PassesPage.vue`.

**Fit (5/5):** Improves immediate local retrieval and stays fully within the on-device product shape — no server or account needed.

**Scores:** Value **8.0/10** · Effort **2/5** · Fit **5/5** · ROI **4.0**

---

### 2. Warm Dark Ticket-Paper Theme

**Pitch:** Dark mode shifts from cool blue-black surfaces to warmer charcoal-and-paper tones. The key is disciplined contrast: barcode areas stay bright and highly legible, expiry badges remain crisp, and action states are easy to scan at a glance. Done well, the result feels less like generic dark UI and more like a polished physical Pass organizer.

**Problem it solves:** Current dark mode can feel cold and slightly muddy for a ticket app, especially in fullscreen/high-focus scanning moments.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 3/5):** Better contrast, clearer action states, and brighter barcode areas do help reduce strain, especially in dim environments or quick-glance use. Even so, this mostly improves feel and readability around the edges rather than removing major friction from finding and showing the right pass.
- 🎨 **Design Purist (score: 5/5):** This is a refined visual direction with the right priorities: mood second, legibility first. Warm charcoal-and-paper tones could give PassDrop a more distinctive and tactile identity, and explicitly protecting barcode contrast and scan readability keeps it from becoming decorative at the expense of function.
- ✨ **Delight & Novelty (score: 4/5):** This gives PassDrop a more ownable mood and makes the product feel crafted rather than generic, which is exactly the kind of subtle delight that can elevate everyday use. It's not a big playful mechanic, but if executed beautifully, it could make the whole app feel more intimate and screenshot-worthy.

**Feasibility (effort: 2/5):** Most of this belongs in theme tokens/CSS (`variables.css`, Ionic overrides), though some components use direct styling so contrast checks would still touch multiple viewer/badge/action surfaces.

**Fit (4/5):** Doesn't stress any core principle and supports clarity, though it's more aesthetic polish than a direct reinforcement of the on-device philosophy.

**Scores:** Value **8.0/10** · Effort **2/5** · Fit **4/5** · ROI **4.0**

---

### 3. Scan Queue Relay Mode

**Pitch:** Turn ticket bundles into a full-screen relay: opens on ticket 1 with a giant code, a huge next-ticket thumb target, and a calm progress marker like "1 of 3". A single tap or swipe advances instantly to the next ticket, with optional haptic confirmation and a subtle already-shown state — like flipping boarding passes, not navigating screens.

**Problem it solves:** Scanning several near-identical tickets in a row is stressful and disorienting when each must be found manually; families need quick successive scans without re-orienting after each code.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 5/5):** This directly serves the scan line: giant code, obvious next target, clear progress, minimal thinking. If it's instant and reliable, it removes real friction for parents or anyone carrying multiple tickets.
- 🎨 **Design Purist (score: 5/5):** This is excellent mobile interaction design: one job, one screen, huge target, explicit progress, minimal decision load. If kept visually calm and instant, it feels purpose-built rather than feature-heavy.
- ✨ **Delight & Novelty (score: 5/5):** This has real magic potential: big code, instant advance, progress marker, haptic click — it turns a frazzled checkpoint moment into a satisfying ritual. If the transitions feel snappy and confident, this is absolutely the kind of thing people notice and tell others about.

**Feasibility (effort: 3/5):** A relay screen can reuse the existing viewer pattern (`ShowPassPage.vue` → `FullscreenCodeViewer.vue`) plus existing haptics patterns, but needs new sequence/progress state not present in today's single-shot viewer.

**Fit (5/5):** Reinforces fast, on-device retrieval under pressure without needing accounts, cloud, or backend features.

**Scores:** Value **10.0/10** · Effort **3/5** · Fit **5/5** · ROI **3.3**

---

### 4. Trip Set With Quick Links

**Pitch:** A lightweight Trip Set relationship connects related Passes for one outing, while each Pass still stands on its own for fast retrieval. Opening the family Passes shows a compact "linked Passes" row with one-tap access to the parking Pass, so the app understands these belong to the same outing without forcing them into a single scan flow. Because everything stays on-device, the relationship can be instant, private, and always available offline.

**Problem it solves:** Some passes belong together conceptually (same day out) but not operationally at the exact same checkpoint — the entry tickets and parking ticket are used at different moments and shouldn't be forced into one scan sequence.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 5/5):** This strikes a practical balance between context and speed: related passes are easy to jump between, but each one still stands alone when the user needs it immediately. A compact linked row is easy to understand and fits real outing behavior better than forcing everything into one bundled flow.
- 🎨 **Design Purist (score: 5/5):** This is thoughtful information architecture because it links related passes without collapsing them into one rigid flow. The compact quick-links row feels appropriately lightweight, provided it stays subordinate to the main pass content and does not compete with the primary code view.
- ✨ **Delight & Novelty (score: 4/5):** Quick links make the relationship between passes more tangible and much more immediately useful in the moment. It still lives mostly in information architecture territory, but at least now the structure produces a visible, satisfying shortcut instead of staying abstract.

**Feasibility (effort: 3/5):** Lightweight relationship links are feasible with extra pass fields/store helpers plus a compact linked row in the group/detail view, without changing native layers.

**Fit (5/5):** Preserves standalone passes, stays local-only, and avoids backend/social features.

**Scores:** Value **9.3/10** · Effort **3/5** · Fit **5/5** · ROI **3.1**

---

### 5. Backseat Hand-Off View

**Pitch:** A passenger mode where the driver keeps holding the phone, but the screen becomes an oversized, ultra-clear code with giant left/right tap zones so a passenger can advance tickets without learning the app. For parking, it becomes a minimal single-code screen with extra brightness and no chrome.

**Problem it solves:** Family travel often involves two adults sharing retrieval in awkward physical conditions, especially in a car queue where the driver can't safely operate a phone.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** The oversized, stripped-back display is excellent for actual handoff moments in a car or at a gate. "Passenger mode" as a concept may be overnamed, but the underlying UI simplification is very strong.
- 🎨 **Design Purist (score: 5/5):** This respects real-world use beautifully: oversized code, giant tap zones, reduced chrome, high brightness all feel native to the context. It succeeds because it simplifies rather than invents a clever new mode.
- ✨ **Delight & Novelty (score: 4/5):** I love that this acknowledges messy real life: one person holds the phone, another taps, nobody needs onboarding. The extra brightness and giant tap zones feel thoughtful, but the personality depends heavily on visual execution.

**Feasibility (effort: 3/5):** The app already has a fullscreen viewer pattern, so oversized code display and giant next/previous tap targets fit naturally in `FullscreenCodeViewer.vue`; the main work is the new navigation/chrome-light UI.

**Fit (5/5):** Directly supports rapid local use without violating the no-account/no-cloud principle.

**Scores:** Value **8.7/10** · Effort **3/5** · Fit **5/5** · ROI **2.9**

---

### 6. Smart Home Surface

**Pitch:** On the morning of a trip, PassDrop can promote one obvious home surface: "Today: Efteling." Tapping it opens the family Pass immediately, and later the same surface can shift to a relevant follow-up like "Leaving soon? Parking pass ready." The logic stays local, simple, time-bound, and easy to dismiss, so it feels predictable and trustworthy rather than magical or mysterious.

**Problem it solves:** Users shouldn't have to mentally re-orient every time they reopen the app during the same outing.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** A single obvious "Today" surface is strong because it reduces choice at the exact moment the user wants certainty, not cleverness. The local, time-bound, dismissible behavior makes it feel understandable enough to trust, which matters more than being smart.
- 🎨 **Design Purist (score: 4/5):** This can feel premium if the home surface behaves with absolute consistency, and the described rules are finally simple enough to earn trust. A single prominent, dismissible, time-bound surface respects attention far better than a vague "smart" layer and fits mobile home-screen behavior well.
- ✨ **Delight & Novelty (score: 4/5):** This is highly useful and emotionally legible: one prominent surface that seems to know what matters today is a strong experience. But stripping away too much of the "magic" also strips away some of the charm, so it now feels polished and dependable more than surprising.

**Feasibility (effort: 3/5):** If this is an in-app surface at the top of `PassesPage.vue`, it is moderate; if it also nudges by time, it can reuse existing local-notification/time patterns without needing backend architecture.

**Fit (5/5):** Time-bound local surfacing fits the app's on-device, no-cloud model very well.

**Scores:** Value **8.0/10** · Effort **3/5** · Fit **5/5** · ROI **2.7**

---

### 7. Ready Now Context Strip

**Pitch:** When a pass or trip set is relevant, it surfaces in a temporary "Ready now" strip above the stack: after opening the Efteling bundle in the morning, PassDrop keeps that bundle and the linked parking pass parked at the top until dismissed. This gives the app a short-term memory for the day's active outing without needing cloud, accounts, or heavy planning features.

**Problem it solves:** The user shouldn't have to re-find the same important passes multiple times across the day.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** This is helpful because it gives the app short-term memory without forcing the user into planning mode. As long as it's temporary and easy to dismiss, it reduces repeat hunting during the same outing.
- 🎨 **Design Purist (score: 4/5):** This is a smart middle ground between manual pinning and over-clever automation. A temporary contextual strip can feel helpful and lightweight, but it needs strict rules and an easy dismissal so it doesn't become persistent top-of-screen noise.
- ✨ **Delight & Novelty (score: 4/5):** The short-term memory angle is lovely: it makes PassDrop feel attentive without becoming heavy or over-planned. It's a subtle delight rather than a flashy one, but that "oh nice, it kept this handy for me" moment is very real.

**Feasibility (effort: 3/5):** A dismissible strip above the main stack fits `PassesPage.vue` well, but it depends on some new relevance model and local dismissal state in the store/Preferences.

**Fit (5/5):** Temporary local context surfacing is strongly aligned with the focused, on-device principle set.

**Scores:** Value **8.0/10** · Effort **3/5** · Fit **5/5** · ROI **2.7**

---

### 8. Family Bundle with Quick Moments

**Pitch:** For a day out like Efteling, one family Pass can hold several passes and surface them through a few simple moments: "Now," "Next," and "Later." The point is not to force people to plan their day like a workflow; it's to make the right pass easy to reach under pressure, while still keeping an obvious "All Passes" path for anyone who just wants to browse everything in one place. That keeps the mental model light, useful, and fast on device.

**Problem it solves:** Families think in real-world moments, not separate pass records scattered through a list, but shouldn't be forced into pre-planning their day.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** This helps when one outing contains several codes and the person needs the next likely pass fast without hunting through a long list. "Now / Next / Later" is simple enough to work one-handed under mild pressure, and the visible "All Passes" escape hatch keeps it from feeling over-structured.
- 🎨 **Design Purist (score: 5/5):** This is a strong mobile interaction model because it organizes access around immediate need instead of storage structure. "Now / Next / Later" is simple enough to scan under pressure, and the explicit "All Passes" path prevents the system from feeling over-authored or restrictive.
- ✨ **Delight & Novelty (score: 4/5):** This turns a potentially messy family bundle into a calm, glanceable companion for real-life pressure moments. "Now / Next / Later" adds just enough narrative shape to feel thoughtful, but it still lands more as reassuring convenience than as a truly grin-inducing moment.

**Feasibility (effort: 4/5):** The hard part is adding a new local bundle/moment model to `src\stores\passes.ts`/Preferences and then surfacing it across `PassesPage.vue`, `ShowPassPage.vue`, and possibly a new route; the current model is simple to extend, but it is still "one pass = one code" today.

**Fit (4/5):** Strongly on-device and focused, but "one family Pass holds several passes" pushes against the glossary's strict Pass meaning unless named carefully.

**Scores:** Value **8.7/10** · Effort **4/5** · Fit **4/5** · ROI **2.2**

---

### 9. Assigned-to-a-Person Tickets

**Pitch:** Inside a grouped pass, each code can be assigned to a person with a tiny identity cue: name plus a color, emoji, or silhouette. In relay mode, that identity stays visible so the parent always knows whose ticket is up. After a scan, that person's ticket visually checks off and drops away.

**Problem it solves:** Users lose confidence about which ticket was already scanned and whose turn is next.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** Identity cues help in the exact moment of "whose ticket is this?" without adding much overhead, especially for family or group entry. It only stays good if setup is lightweight; too much labeling work upfront would dilute the value.
- 🎨 **Design Purist (score: 4/5):** Identity cues are useful, but this can slip into decoration fast if color, emoji, and silhouettes all compete. Done minimally — name first, one secondary cue — it meaningfully reduces mistakes in relay mode.
- ✨ **Delight & Novelty (score: 5/5):** Names, colors, emoji, and a ticket dropping away after use add personality in exactly the right place: a stressful real-world handoff. It makes the bundle feel like it belongs to your family, not just "3 generic QR codes."

**Feasibility (effort: 4/5):** Per-person metadata is easy as extra local fields, but the real work is wiring those child identities into the same new bundle/relay model and UI state.

**Fit (4/5):** On-device person cues fit well, though the idea depends on a new construct distinct from both Pass and Category.

**Scores:** Value **8.7/10** · Effort **4/5** · Fit **4/5** · ROI **2.2**

---

### 10. Bundle Pass with Ticket Strip

**Pitch:** One pass becomes a small bundle: "Efteling — gezin" opens to a horizontal strip of 3 child codes plus metadata for each person, while the parking ticket can live as a linked sibling or separate urgent pass. In the Detail Page and Fullscreen Viewer, you move through the tickets with thumb swipes or big next/previous targets, so the family stays in one flow instead of bouncing back to the list after every scan.

**Problem it solves:** 3 entry tickets belong together in the real world, but today the store and viewer model would force 3 separate passes and extra list-fumbling at the gate.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 5/5):** This is much closer to the real gate moment: keep the family's tickets in one flow and let the holder move ticket-to-ticket without bouncing around the app. The parking ticket staying separate is also smart, because entry flow and exit panic are different jobs.
- 🎨 **Design Purist (score: 4/5):** Very coherent for family entry flow: keeping related tickets in one object with swipe/large controls fits mobile ergonomics and reduces list bouncing. The danger is horizontal strips becoming fiddly or visually busy, so the strip must stay secondary to one clear primary code at a time.
- ✨ **Delight & Novelty (score: 4/5):** The horizontal strip has nice physicality; it feels closer to shuffling real tickets than tapping through app furniture. It's smooth and humane, though the joy comes from flow and polish, not from surprise.

**Feasibility (effort: 4/5):** This needs both data-model expansion beyond the current single-code Pass and substantial UI work in the Detail Page / `FullscreenCodeViewer.vue` flow for child-code strip navigation.

**Fit (3/5):** Still local-first, but "one Pass becomes a bundle" conflicts with the glossary's strict Pass definition and risks muddling Detail Page / Fullscreen Viewer naming — needs careful terminology work, not a principle violation.

**Scores:** Value **8.7/10** · Effort **4/5** · Fit **3/5** · ROI **2.2**

---

### 11. Mark-as-Used Ticket States

**Pitch:** Grouped tickets get live states during fast entry: ready, just scanned, already used, skip for now. Each code can be marked used right after it is scanned — automatically via the scan queue or manually with one tap — and used tickets fade into a reassuring thumbnail while the next unused ticket is promoted to center stage. If a staff member says one failed, the last code can be pulled back instantly.

**Problem it solves:** Multiple near-identical tickets are easy to mix up under pressure; rapid-succession scanning needs reassurance and recovery, not just speed.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 4/5):** This gives reassurance during multi-ticket scanning and reduces the chance of re-showing the wrong code. It's valuable because it supports recovery too, but it must stay one-tap and reversible or it becomes fussy state management.
- 🎨 **Design Purist (score: 4/5):** Clear state handling is valuable, especially the instant recovery path for failures. The design risk is turning a fast scanning flow into a state-management UI, so statuses must stay quiet and automatic with manual override as a safety valve.
- ✨ **Delight & Novelty (score: 4/5):** The fade-away and instant recovery are satisfying little bits of stagecraft; they make progress visible and calm. It's a strong micro-interaction idea, though slightly more "competent" than "delightfully unexpected."

**Feasibility (effort: 4/5):** Ready/used/skip/undo states are easy to persist in `src\stores\passes.ts`, but auto/manual promotion, fade-away behavior, and failure recovery create a real UI/state-machine redesign on top of the current simple viewer flow.

**Fit (5/5):** Purely device-local workflow state strongly matches the product principles.

**Scores:** Value **8.0/10** · Effort **4/5** · Fit **5/5** · ROI **2.0**

---

### 12. Parking Panic Button

**Pitch:** Any pass can be marked as a panic pass for high-pressure moments, then made retrievable from absurdly fast entry points: long-press on the app icon, lock-screen shortcut, persistent outing-day notification, or a giant "Show parking now" chip. This is not a favorite; it is an emergency lane.

**Problem it solves:** The parking ticket matters at one very specific, stressful moment where even a few extra taps feel terrible.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 5/5):** This solves a real high-pressure retrieval problem better than generic favorites do. The danger is clutter and too many shortcut surfaces, but if it stays opt-in and sparse, it's genuinely useful.
- 🎨 **Design Purist (score: 4/5):** The core instinct is right: parking retrieval is a high-stress edge case that deserves a faster lane than "favorites." But multiple entry points risk fragmentation and platform inconsistency; choose one or two native-feeling shortcuts, not every possible surface.
- ✨ **Delight & Novelty (score: 5/5):** "Emergency lane" is a strong emotional frame, and the absurd-speed retrieval is memorable because it respects a very real panic moment. It's delight through relief rather than whimsy, but that can still feel magical when the app saves you from fumbling at the gate.

**Feasibility (effort: 5/5):** A giant in-app chip is easy, but app-icon long-press, lock-screen shortcuts, and persistent-notification access go beyond the current minimal Capacitor shell (`MainActivity.java`, `AndroidManifest.xml`, `capacitor.config.ts`) and require new native/platform work.

**Fit (5/5):** Highly aligned with fast local access and does not require cloud/accounts.

**Scores:** Value **9.3/10** · Effort **5/5** · Fit **5/5** · ROI **1.9**

---

### 13. Trip Timeline with Quiet Stages

**Pitch:** A grouped outing becomes a simple, local timeline: arrive, enter, enjoy, leave. Each stage quietly brings forward the passes that matter right now and pushes the rest out of the way, so PassDrop feels helpful without becoming a planner. The timeline stays lightweight and optional: it guides attention, but never blocks access to the full set of passes.

**Problem it solves:** Users freeze when too many equally important-looking codes are shown at once during a multi-stop outing.

**Reviewer critiques:**

- 🙋 **Target-User Advocate (score: 3/5):** Quietly bringing forward the relevant passes can reduce visual clutter in the moment, especially for outings with several unrelated codes. Still, a stage-based timeline introduces one more mental model, so its value depends on staying truly optional and never being the main way to find a pass fast.
- 🎨 **Design Purist (score: 4/5):** This is more disciplined than a typical timeline concept because it uses stages as a quiet attention guide rather than a heavy planning framework. The idea becomes workable once the timeline stays optional and secondary to direct access, though it still needs careful visual restraint to avoid feeling like extra UI structure.
- ✨ **Delight & Novelty (score: 4/5):** The stage framing gives the outing a soft sense of rhythm, which makes PassDrop feel considerate instead of just organized. It's elegant and warm, but the quietness keeps it from becoming the kind of playful, screenshot-worthy delight that really stands out.

**Feasibility (effort: 4/5):** This needs a new local trip/stage model plus filtering/surfacing logic across `PassesPage.vue` and likely new route/view state, even though adding local fields/actions is straightforward.

**Fit (5/5):** Keeps everything on-device and focused on situational retrieval while preserving access to the full pass list.

**Scores:** Value **7.3/10** · Effort **4/5** · Fit **5/5** · ROI **1.8**

---
