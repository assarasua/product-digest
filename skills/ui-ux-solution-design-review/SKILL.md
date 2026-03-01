---
name: ui-ux-solution-design-review
description: Evaluate and refine digital product solution designs with professional UI/UX rigor by auditing user goals, end-to-end flows, information architecture, interaction patterns, content clarity, visual hierarchy, accessibility, and implementation risk; then recommend prioritized improvements with rationale and acceptance criteria. Use when asked to critique or improve wireframes, mockups, prototypes, user journeys, dashboards, forms, navigation, onboarding, empty/error states, PRDs, or feature solution proposals before build.
---

# UI/UX Solution Design Review

Assess solution designs like a senior product designer and return implementation-ready refinements.

## Working Principles

- Start from user outcome and task success, not visual preference.
- Separate critical usability blockers from polish work.
- Treat accessibility, clarity, and error prevention as baseline quality.
- Prefer high-impact, low-complexity changes first.
- Tie every recommendation to a measurable behavior or usability outcome.

## Workflow

### 1) Clarify Context

- Extract target user, primary task, environment (desktop/mobile), and business goal.
- Capture constraints: timeline, design system, technical limits, legal/compliance.
- State explicit assumptions when key inputs are missing and proceed.

### 2) Diagnose Current Design

- Audit the design using `references/evaluation-rubric.md`.
- Document each issue as `issue -> user impact -> likely cause`.
- Rate each issue with this severity scale:
  - `critical`: blocks core task success, trust, or accessibility compliance.
  - `major`: creates frequent friction or high drop-off risk.
  - `minor`: noticeable friction with workaround available.
  - `cosmetic`: polish issue with low behavioral impact.

### 3) Prioritize Fixes

- Rank by user impact, issue frequency, and implementation effort.
- Select the top 3-7 improvements for the first refinement pass.
- Keep lower-priority improvements in a backlog list.

### 4) Propose Refinements

- Use patterns in `references/refinement-patterns.md`.
- For each recommendation, provide:
  - `what to change`
  - `why it helps`
  - `how to implement`
  - `acceptance criteria`

### 5) Define Validation

- Propose the fastest validation method per major change:
  - heuristic walkthrough
  - usability test
  - instrumentation/analytics
  - A/B test when appropriate
- State what evidence would confirm or overturn each recommendation.

## Required Output

Return output in this structure unless the user requests a different format.

1. Design Summary: scope, user, core task, constraints.
2. Findings: prioritized issues with severity and user impact.
3. Refinement Plan: concrete design changes with rationale and acceptance criteria.
4. Validation Plan: how to test and expected evidence.
5. Open Questions: unknowns that could materially change the recommendation.

## Output Modes

- Use `quick pass` for rapid feedback: top blockers plus 3 concrete fixes.
- Use `full review` for high-stakes work: full rubric and phased refinement plan.
- Use `handoff mode` when implementation is next: recommendations rewritten as engineer/designer tasks.

## Quality Bar

- Avoid aesthetic-only feedback without outcome impact.
- Avoid vague advice; propose specific, implementable changes.
- Ensure each major issue has at least one actionable fix.
- Ensure acceptance criteria are testable.

## References

- Use `references/evaluation-rubric.md` for rubric dimensions, scoring, and severity guidance.
- Use `references/refinement-patterns.md` for reusable design improvement patterns and acceptance criteria templates.
