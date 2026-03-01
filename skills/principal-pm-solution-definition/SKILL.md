---
name: principal-pm-solution-definition
description: Define product solutions with principal product manager rigor by framing ambiguous problems, clarifying outcomes and constraints, comparing solution options, and recommending an execution-ready path with tradeoffs, risks, and success metrics. Use when asked to propose product strategy, feature direction, roadmap decisions, PRD-level approaches, or decision memos under uncertainty.
---

# Principal PM Solution Definition

Define solution direction that can survive executive scrutiny and execution reality.

## Working Contract

- Start by framing the decision before describing a solution.
- Ask for missing critical context only when needed to avoid a wrong recommendation.
- State explicit assumptions when context is incomplete and proceed.
- Prefer recommendation quality over solution novelty.
- Tie every recommendation to outcomes, constraints, and measurable impact.

## Required Deliverable Structure

Produce outputs in this order unless the user requests a different format.

1. Decision statement: describe the exact decision to make now.
2. Problem framing: describe user pain, business impact, and why now.
3. Outcomes and guardrails: define success metrics and non-negotiable constraints.
4. Options: present 2-4 viable approaches, including a credible "do minimum" option.
5. Tradeoff analysis: compare options against the same criteria.
6. Recommendation: select one option and justify with evidence and constraints.
7. Execution plan: define phased plan, owners, dependencies, and timeline assumptions.
8. Risks and mitigations: call out key failure modes and mitigations.
9. Validation plan: define what to test first and what evidence can overturn the recommendation.
10. Open questions: list unresolved items that block confidence.

## Workflow

### 1) Frame the decision

- Convert broad requests into one decision sentence: `We need to decide X for Y segment by Z date to achieve N outcome.`
- Separate the decision from implementation detail.
- Define scope boundaries: what is in and out for this decision.

### 2) Define outcomes and constraints

- Define primary outcome metric and time horizon.
- Define supporting metrics and guardrail metrics.
- Identify fixed constraints: team capacity, technical limits, legal/compliance, GTM deadlines.

### 3) Build decision criteria

Use weighted criteria before comparing options.

- Impact on target outcome.
- Confidence level based on available evidence.
- Time to value.
- Complexity and delivery risk.
- Strategic alignment and defensibility.

If no weights are provided, default to: impact 35, confidence 20, time to value 20, complexity/risk 15, strategic alignment 10.

### 4) Generate options

- Generate 2-4 options that are truly different in mechanism, not cosmetic variants.
- Include at least one low-cost or reversible option.
- For each option, define target segment, value mechanism, required capabilities, and failure condition.

### 5) Evaluate and choose

- Score each option against the same criteria.
- Show key tradeoffs explicitly instead of hiding them in prose.
- Recommend one option and explain why not the others.

### 6) Turn recommendation into execution

- Break into phases: `de-risk -> deliver core value -> scale`.
- Attach entry/exit criteria to each phase.
- Specify first 2-3 milestones and measurable expected outcomes.

### 7) Define validation and reversibility

- Identify assumptions with highest downside if wrong.
- Propose fastest test to validate each critical assumption.
- Define pre-commit and post-commit decision checkpoints.
- State reversal conditions that trigger plan changes.

## Output Modes

- Use `quick mode` for fast guidance: decision statement, options table, recommendation, top risks.
- Use `full mode` for high-stakes decisions: complete 10-part deliverable.
- Use `exec memo mode` when leadership alignment is needed: keep to one page with an appendix table.

## Quality Bar

- Keep every claim tied to evidence, assumption, or explicit judgment.
- Avoid feature lists without outcome logic.
- Avoid single-option recommendations unless constraints eliminate alternatives.
- Quantify impact with ranges when exact values are unknown.
- Include what would change the recommendation.

## References

- Use `references/solution-templates.md` for reusable output templates.
- Use templates as a starting point, then adapt to user context and constraints.
