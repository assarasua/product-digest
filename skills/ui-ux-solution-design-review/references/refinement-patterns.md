# UI/UX Refinement Patterns

Use these patterns to convert findings into actionable design recommendations.

## Recommendation Card Template

Use this format for each proposed change:

1. `Finding`: what is wrong and where it appears.
2. `Change`: what to modify in the interface or flow.
3. `Rationale`: why this improves user outcomes.
4. `Implementation notes`: constraints, dependencies, design-system mapping.
5. `Acceptance criteria`: testable outcomes.

## Pattern 1: Clarify Primary Action

- Use when users hesitate or choose wrong actions.
- Promote one primary CTA per view.
- Demote secondary actions visually and positionally.
- Acceptance criteria example: users identify the next step in under 3 seconds.

## Pattern 2: Reduce Cognitive Load

- Use when screens feel dense or require too many decisions.
- Group related inputs and content.
- Hide advanced settings behind progressive disclosure.
- Reduce competing messages and visual elements.
- Acceptance criteria example: task completion time drops by at least 15%.

## Pattern 3: Improve Form Usability

- Use when form abandonment or validation errors are high.
- Ask only essential fields in the first step.
- Show inline validation with clear correction guidance.
- Keep labels persistent; avoid placeholder-only labels.
- Acceptance criteria example: form completion rate increases and error retries decrease.

## Pattern 4: Strengthen System Feedback

- Use when users are unsure whether actions succeeded.
- Add immediate, contextual feedback for submit/save/delete actions.
- Distinguish loading, success, and failure states clearly.
- Keep messages specific and next-step oriented.
- Acceptance criteria example: support tickets about action uncertainty decrease.

## Pattern 5: Design Robust Empty and Error States

- Use when users encounter dead ends.
- Explain the state in plain language.
- Offer one primary recovery action and one optional secondary path.
- Provide sensible defaults or examples where possible.
- Acceptance criteria example: users recover from errors without external help.

## Pattern 6: Improve Navigation and Wayfinding

- Use when users feel lost in multi-step or multi-section experiences.
- Add clear section labels, step indicators, or breadcrumbs as needed.
- Preserve context between transitions.
- Keep navigation naming consistent with user language.
- Acceptance criteria example: users backtrack less and reach target screens faster.

## Pattern 7: Mobile Ergonomics and Responsiveness

- Use when key tasks degrade on small screens.
- Prioritize content and actions above the fold.
- Ensure touch targets are large and sufficiently spaced.
- Avoid interactions that rely on hover-only behavior.
- Acceptance criteria example: mobile task success approaches desktop baseline.

## Pattern 8: Accessibility-First Adjustments

- Use when designs rely heavily on color, small text, or non-semantic controls.
- Improve contrast and focus visibility.
- Ensure controls are keyboard reachable and screen-reader friendly.
- Use descriptive labels and helper text.
- Acceptance criteria example: major WCAG issues identified in audit are resolved.

## Pattern 9: Build User Trust

- Use when actions affect billing, privacy, publishing, or irreversible outcomes.
- Add explicit consequence messaging before high-risk actions.
- Make status and data handling transparent.
- Provide undo or safe confirmation when possible.
- Acceptance criteria example: fewer user complaints about unexpected outcomes.
