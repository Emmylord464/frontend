# Figma handoff and design-to-code checklist

## 1) VS Code + Figma setup

The workspace already contains the MCP config at [.vscode/mcp.json](../.vscode/mcp.json).

Use this setup in VS Code:

1. Open the Command Palette.
2. Reload the window or reconnect MCP servers.
3. Confirm the `figma` server appears as available.
4. If the server does not connect, verify the config matches:

```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

This gives you the Figma connection context for app review and design handoff workflows.

---

## 2) Recommended Figma workflow

Create a Figma file with this structure:

- 00_Design System
  - Colors
  - Typography
  - Buttons
  - Cards
  - Form states
- 01_Landing Page
- 02_Dashboard
- 03_Exam Screen
- 04_Results Screen
- 05_Learning / Workout
- 06_Account / App Shell

Suggested order for stakeholder review:

1. 00_Design System
2. 01_Landing Page
3. 02_Dashboard
4. 03_Exam Screen
5. 04_Results Screen

This matches the current product flow and the code structure in the app.

---

## 3) Screen-by-screen design brief

### 3.1 Landing page

Source: [src/app/page.tsx](../src/app/page.tsx)

Goal:
- Position JAMB AI as a premium exam-prep product.
- Clearly communicate the value proposition and convert to app onboarding.

Key layout blocks:
- Top navigation with logo and sign-in button
- Hero headline + CTA buttons
- App-store style CTA blocks
- Feature cards in a 3-column layout
- Dark green / warm neutral brand palette

Visual system:
- Background: warm light neutrals
- Primary dark green: `#18352b`
- Accent orange: `#e2763b`
- Support neutrals: `#f2efe9`, `#f5f1ea`, `#d9d0c6`
- Large editorial headline, heavy tracking, strong card shadows

Design notes:
- Keep hero copy minimal and conversion-focused.
- CTA hierarchy should be very clear: primary action is “Get started”.
- Match the current “premium but smart” tone.

---

### 3.2 Dashboard

Source: [src/app/dashboard/page.tsx](../src/app/dashboard/page.tsx)

Goal:
- Show progress, upcoming work, and weak topic recovery.
- Make the next action obvious: start or continue practice.

Key layout blocks:
- Top header with page label and action buttons
- Score hero card in dark green
- Target score progress bar
- Subject score cards
- Weak topics list
- Recent mock history section

Visual system:
- Dark green surface for hero KPI card
- White panels for secondary content
- Warm accent for focus areas and alerts
- Strong metric emphasis with large numerals

Design notes:
- The dashboard should feel like a “command center”, not a list of content.
- Prioritize bottom-line score and “what should I do next?”

---

### 3.3 Exam screen

Source: [src/app/exam/page.tsx](../src/app/exam/page.tsx)

Goal:
- Provide a focused exam environment for timed question attempts.
- Support answer selection, flagging, and submission.

Key layout blocks:
- Subject tabs or segmented controls
- Timer at the top right
- Question number indicator
- Question prompt and options card
- Question palette / nav across the exam
- Submit action button in a high-contrast accent
- Optional tutor panel or topic context

Visual system:
- Clean white / off-white containers
- High-contrast text for readability
- Accent orange for urgent actions
- Neutral UI for disabled and secondary states

Design notes:
- Use a “calm but precise” exam look: low visual noise, high focus.
- The timer and final submission CTA must remain visually prominent.
- Question nav should allow quick jump and flagging.

---

### 3.4 Results screen

Source: [src/app/cbt/results/[attemptId]/page.tsx](../src/app/cbt/results/[attemptId]/page.tsx)

Goal:
- Show overall performance and clear next-step actions.
- Make weak topics actionable.

Key layout blocks:
- Dark green summary header with score and target progress
- Subject cards with colored strength indicators
- Weak topics panel with remediation CTA buttons
- Footer actions: retake exam / return to skill tree

Visual system:
- Strong score hero with warm accent for progress state
- Subject status chips: strong / average / weak
- Opportunity cards for weak topics with orange highlight

Design notes:
- Results should feel motivating and corrective at the same time.
- Recommendations should be explicit, supporting a next step instead of just a raw score.

---

### 3.5 Learning / workout screen

This page is not fully captured in the current read, but the app structure indicates it is a central learning and remedial mode.

Design expectation:
- Topic cards and branch/level progression
- Module detail view with concept cards and learner progress
- Workout drill cards with a strong action CTA

Use the same visual language as the landing and dashboard:
- clean cards
- progress bars
- warm highlight accents
- dark green app shell

---

## 4) Design-to-code checklist based on the current codebase

### Layout foundations
- [x] Global warm neutral app background
- [x] Dark green primary surfaces for key KPI sections
- [x] Warm orange highlight for key actions and weak-state indicators
- [x] White cards with soft border and subtle shadow
- [x] Large rounded corners on cards and panels

### Reusable components to define in Figma
- [ ] App shell / nav container
- [ ] Primary CTA button
- [ ] Secondary outline button
- [ ] Score hero card
- [ ] Subject summary card
- [ ] Topic focus card
- [ ] Mock history row / table
- [ ] Exam question card
- [ ] Multiple-choice option button
- [ ] Question flag toggle
- [ ] Timer widget
- [ ] Results subject card
- [ ] Weak-topic remediation card

### Typography
- [ ] Heading 1: editorial, oversized, very high contrast
- [ ] Heading 2: with tight tracking for app sections
- [ ] Strong metric labels for score and percent values
- [ ] Small uppercase labels for status badges and metadata

### States to include
- [ ] Default state
- [ ] Hover state
- [ ] Active/selected state
- [ ] Disabled state
- [ ] Focus state for accessibility
- [ ] Success state
- [ ] Warning / weak-topic state
- [ ] Error / submission state

### Spacing and scale
- [ ] Use a consistent 8px spacing system
- [ ] Cards increase to 20-32px radius
- [ ] Make gutters generous to preserve clarity on desktop and tablet layouts

---

## 5) Priority screens for stakeholder review

These are the exact screens to design first:

1. 00_Design System
2. 01_Landing Page
3. 02_Dashboard
4. 03_Exam Screen
5. 04_Results Screen

This order will give stakeholders a coherent story from marketing to learning to assessment and performance feedback.

---

## 6) Recommended deliverables for the Figma review

For each screen, provide:
- 1 desktop layout
- 1 tablet layout
- 1 mobile adaptation
- a component spec sheet
- a notes section for behavior and states

For handoff, also add a simple review label:
- “Brand direction: premium educational SaaS”
- “Target: Nigerian secondary school exam prep”
- “Key user action: study > practice > assess > remediate”

---

## 7) Best next action

Open Figma and build the file in this order:

1. 00_Design System
2. 01_Landing
3. 02_Dashboard
4. 03_Exam
5. 04_Results

Then compare each screen against the existing implementation in:
- [src/app/page.tsx](../src/app/page.tsx)
- [src/app/dashboard/page.tsx](../src/app/dashboard/page.tsx)
- [src/app/exam/page.tsx](../src/app/exam/page.tsx)
- [src/app/cbt/results/[attemptId]/page.tsx](../src/app/cbt/results/[attemptId]/page.tsx)

This keeps the Figma design aligned to what already works in code and makes the handoff clean.
