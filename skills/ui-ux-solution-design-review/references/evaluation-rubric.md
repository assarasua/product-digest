# UI/UX Evaluation Rubric

Use this rubric to evaluate solution designs consistently before proposing changes.

## How to Score

- Score each dimension from `0` to `3`.
- Use `0` when the design is missing or fails core expectations.
- Use `1` when the design is weak and creates significant friction.
- Use `2` when the design is acceptable but has clear improvement room.
- Use `3` when the design is strong and supports the task well.
- Flag any `0` in critical-path flows as `critical` severity.

## Dimensions

### 1) Problem and User Fit

- Confirm the primary user and context are explicit.
- Confirm the screen/flow supports a clear job-to-be-done.
- Confirm the design aligns with the intended user outcome.

### 2) Information Architecture and Content Clarity

- Confirm labels and grouping are predictable and unambiguous.
- Confirm navigation supports orientation and wayfinding.
- Confirm microcopy is concise, specific, and action-oriented.

### 3) Task Flow and Interaction Design

- Confirm the main flow minimizes steps and unnecessary decisions.
- Confirm controls map naturally to user intent.
- Confirm feedback is immediate for user actions.

### 4) Visual Hierarchy and Readability

- Confirm primary action and key information are visually dominant.
- Confirm spacing, typography, and contrast support scanability.
- Confirm the design avoids visual noise and competing focal points.

### 5) States, Errors, and Recovery

- Confirm empty, loading, success, and error states are designed.
- Confirm errors explain cause and next step.
- Confirm the flow prevents or gracefully recovers from mistakes.

### 6) Accessibility and Inclusion

- Confirm keyboard and assistive technology usage are supported.
- Confirm color is not the only signal.
- Confirm contrast, target size, and focus treatment are sufficient.
- Confirm language is plain and inclusive.

### 7) Trust, Privacy, and Confidence

- Confirm risky or irreversible actions are clearly communicated.
- Confirm data use and privacy-sensitive actions are transparent.
- Confirm the UI sets accurate expectations about system behavior.

### 8) Implementation Feasibility

- Confirm recommendations can map to current design system components.
- Confirm interaction complexity is realistic for planned timeline.
- Confirm dependencies and edge cases are known.

## Severity Rules

- `critical`: blocks task completion, creates compliance risk, or causes high mistrust.
- `major`: significantly harms success rate, speed, or confidence for common tasks.
- `minor`: causes noticeable friction but does not block core outcomes.
- `cosmetic`: low-impact polish issue with minimal effect on behavior.

## Prioritization Formula

Use this formula for each issue:

`priority score = impact (1-5) + frequency (1-5) + risk (1-5) - effort (1-5)`

- Prioritize highest scores first.
- Break ties by choosing the issue with higher accessibility or trust impact.
