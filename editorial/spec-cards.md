# 15 Article Spec Cards

## 01) Why Most Roadmaps Fail the Learning Test
- `title`: Why Most Roadmaps Fail the Learning Test
- `core_thesis`: Roadmaps fail when they optimize commitment visibility instead of learning velocity.
- `who_this_is_for`: PMs at growth-stage startups managing quarterly planning pressure.
- `why_now`: AI and market volatility shorten certainty half-life.
- `outline`:
  1. The commitment trap
  2. Learning backlog vs delivery backlog
  3. Learning Test Framework (question, signal, decision)
  4. Team-level operating changes
  5. Weekly checklist
- `example_or_case`: B2B onboarding team shipping 6 features but no activation lift.
- `framework`: Learning Test Framework.
- `counterpoint`: "Stakeholders need fixed dates." Rebuttal: stable dates for high-confidence work, learning slots for uncertainty.
- `action_checklist`:
  - Tag roadmap items by confidence tier.
  - Attach one learning question per uncertain initiative.
  - Review decision-ready evidence weekly.
- `cta`: Convert your next roadmap review into a learning review.

## 02) The Decision Velocity Framework (Not Delivery Velocity)
- `title`: The Decision Velocity Framework (Not Delivery Velocity)
- `core_thesis`: Teams win by shortening time from ambiguity to quality decisions, not just time to ship.
- `who_this_is_for`: PMs with fast shipping but low strategic clarity.
- `why_now`: Faster tooling increased shipping speed, not decision quality.
- `outline`:
  1. Throughput illusion
  2. Decision cycle stages
  3. Four bottlenecks (signal, synthesis, alignment, ownership)
  4. Instrumentation model
  5. Cadence redesign
- `example_or_case`: Growth team with weekly releases but repeated pricing reversals.
- `framework`: Decision Velocity Loop.
- `counterpoint`: "More analysis slows us." Rebuttal: higher-quality decisions reduce rework and rollback load.
- `action_checklist`:
  - Measure question-to-decision cycle time.
  - Track reversals within 30 days.
  - Assign one explicit decision owner per initiative.
- `cta`: Pilot decision SLAs in one squad for two weeks.

## 03) Outcome Mapping: From Feature Requests to Behavior Change
- `title`: Outcome Mapping: From Feature Requests to Behavior Change
- `core_thesis`: Feature requests become useful only when translated into measurable behavior change.
- `who_this_is_for`: PMs facing noisy customer request pipelines.
- `why_now`: Request volume is up while capacity stays constrained.
- `outline`:
  1. Why request lists distort priorities
  2. Outcome map components
  3. Converting requests into behavior hypotheses
  4. Prioritization by expected behavior shift
  5. Governance with sales/support
- `example_or_case`: "Export to CSV" requests reframed into reporting completion behavior.
- `framework`: Outcome Mapping Canvas.
- `counterpoint`: "Customers asked directly for the feature." Rebuttal: deliver the outcome, not literal implementation.
- `action_checklist`:
  - Rewrite top 10 requests as behavior statements.
  - Define one primary success signal each.
  - Kill two requests with weak behavior linkage.
- `cta`: Run a behavior-first backlog review this week.

## 04) AI PM Is Risk Management Disguised as Innovation
- `title`: AI PM Is Risk Management Disguised as Innovation
- `core_thesis`: AI PM excellence is mostly disciplined risk management across reliability, trust, and economics.
- `who_this_is_for`: PMs launching AI features under pressure.
- `why_now`: Teams are shipping AI before defining acceptable risk envelopes.
- `outline`:
  1. Innovation theater vs risk reality
  2. Risk stack (model, product, user, business)
  3. Prioritization by risk-adjusted value
  4. Operational controls
  5. Launch criteria
- `example_or_case`: AI summary tool with high adoption but harmful hallucinations in customer-facing workflows.
- `framework`: Risk-Adjusted Value Matrix.
- `counterpoint`: "Move fast, we can patch later." Rebuttal: trust failures create compounding distribution costs.
- `action_checklist`:
  - Define unacceptable failure modes.
  - Set fallback UX for low-confidence outputs.
  - Track cost per successful task completion.
- `cta`: Add a risk review checkpoint before your next AI release.

## 05) The Reliability Ladder for AI Features (v0 to Mission-Critical)
- `title`: The Reliability Ladder for AI Features (v0 to Mission-Critical)
- `core_thesis`: AI products need stage-specific reliability targets that increase with workflow criticality.
- `who_this_is_for`: PMs scaling AI features from beta to core workflow.
- `why_now`: Many teams overfit early demos and underinvest in production reliability.
- `outline`:
  1. Why one reliability bar fails
  2. Ladder levels and criteria
  3. Evaluation methods per level
  4. Escalation and guardrails
  5. Migration strategy
- `example_or_case`: Internal assistant upgraded into customer-facing support copilot.
- `framework`: Reliability Ladder (v0, assistive, decision-support, mission-critical).
- `counterpoint`: "Reliability slows experimentation." Rebuttal: stage-gated reliability protects speed by reducing incident loops.
- `action_checklist`:
  - Classify each AI feature by ladder level.
  - Set minimum eval thresholds per level.
  - Block level-up without incident metrics.
- `cta`: Publish your reliability ladder in product docs.

## 06) Prompt UX vs Product UX: Where Teams Misinvest
- `title`: Prompt UX vs Product UX: Where Teams Misinvest
- `core_thesis`: Teams overinvest in prompt polish and underinvest in workflow integration and recoverability.
- `who_this_is_for`: PMs and designers building AI interactions.
- `why_now`: Prompt tinkering is easy; workflow design is hard but defensible.
- `outline`:
  1. The prompt obsession
  2. Product UX layers beyond prompts
  3. Recovery and confidence signals
  4. Integration into real workflows
  5. Investment allocation model
- `example_or_case`: Writing assistant with great first draft quality but poor revision and handoff flow.
- `framework`: UX Investment Split (Input, Confidence, Recovery, Workflow, Memory).
- `counterpoint`: "Better prompts solve most issues." Rebuttal: prompt gains plateau without workflow architecture.
- `action_checklist`:
  - Audit UX spend by layer.
  - Add confidence + edit affordances.
  - Instrument drop-off after first output.
- `cta`: Shift 30% of prompt effort to workflow UX in the next sprint.

## 07) Eval-Driven Product Management: The Missing Operating System
- `title`: Eval-Driven Product Management: The Missing Operating System
- `core_thesis`: AI product teams need evaluations as a core PM operating system, not a model team side activity.
- `who_this_is_for`: PMs coordinating AI, engineering, and data teams.
- `why_now`: Feature decisions are increasingly coupled to model behavior quality.
- `outline`:
  1. Why PMs must own eval intent
  2. Eval taxonomy (quality, safety, latency, cost)
  3. Product decision loops driven by eval signals
  4. Release governance with eval gates
  5. Org design implications
- `example_or_case`: Search relevance rollout halted by quality regressions caught late.
- `framework`: Eval-Driven Decision Loop.
- `counterpoint`: "Evals belong to ML engineering." Rebuttal: PM owns user-value thresholds and tradeoffs.
- `action_checklist`:
  - Define 3 product-critical eval metrics.
  - Tie release readiness to eval deltas.
  - Review eval trends in weekly product reviews.
- `cta`: Add eval scorecards to your next PRD.

## 08) SaaS Is Dead, Bundles Are Back: What Actually Changed
- `title`: SaaS Is Dead, Bundles Are Back: What Actually Changed
- `core_thesis`: Standalone SaaS value is compressing; bundled workflows with integrated intelligence are capturing margin.
- `who_this_is_for`: PM leaders shaping product strategy and packaging.
- `why_now`: AI reduces feature differentiation and increases buyer focus on end-to-end outcomes.
- `outline`:
  1. Define what "dead" means
  2. Economic shifts behind bundling
  3. Where standalone SaaS still wins
  4. Migration paths to bundled value
  5. Decision criteria
- `example_or_case`: Point solution absorbed by suite with workflow-native automation.
- `framework`: SaaS Viability Test (Differentiation, Workflow Depth, Distribution Leverage, Margin Defensibility).
- `counterpoint`: "Vertical SaaS still grows." Rebuttal: yes, where workflow depth creates compounding advantage.
- `action_checklist`:
  - Score your product on viability dimensions.
  - Identify one bundle-risk surface area.
  - Define one expansion path into adjacent workflow.
- `cta`: Run a 90-day bundle-risk strategy review.

## 09) The New Moat Stack: Distribution, Data, Workflow, Trust
- `title`: The New Moat Stack: Distribution, Data, Workflow, Trust
- `core_thesis`: Durable product advantage now comes from stacked moats rather than any single differentiator.
- `who_this_is_for`: PM and GTM leaders defining long-term defensibility.
- `why_now`: Model and UI advantages erode quickly.
- `outline`:
  1. Why old moats decay faster
  2. Four-layer moat stack
  3. Reinforcement loops between layers
  4. Common false moats
  5. How to invest over 12 months
- `example_or_case`: Workflow product gaining trust moat through auditability + distribution moat through ecosystem embeds.
- `framework`: New Moat Stack.
- `counterpoint`: "Data alone is enough." Rebuttal: data without distribution and workflow embed is easy to displace.
- `action_checklist`:
  - Rate each moat layer 1-5.
  - Identify weakest reinforcing loop.
  - Set one quarterly moat-building initiative.
- `cta`: Publish your moat stack score in strategy docs.

## 10) Interface Is Commodity, Workflow Is Defensible
- `title`: Interface Is Commodity, Workflow Is Defensible
- `core_thesis`: UI quality is necessary but insufficient; defensibility comes from owning repeat workflows and decision moments.
- `who_this_is_for`: PMs prioritizing roadmap investments.
- `why_now`: AI-assisted UI generation reduces interface uniqueness.
- `outline`:
  1. Why interface advantage decays
  2. Workflow ownership as moat
  3. Identifying high-value decision moments
  4. Product architecture implications
  5. Measurement framework
- `example_or_case`: Beautiful analytics UI losing to workflow-integrated competitor.
- `framework`: Workflow Defensibility Matrix.
- `counterpoint`: "Great UX is our edge." Rebuttal: UX wins retention only when embedded in recurring workflow outcomes.
- `action_checklist`:
  - Map top 3 recurring workflows.
  - Identify one decision moment to own deeply.
  - Reallocate one UI polish initiative to workflow depth.
- `cta`: Choose one workflow to make 2x stickier this quarter.

## 11) Seat-Based Pricing Breaks in the Agent Era
- `title`: Seat-Based Pricing Breaks in the Agent Era
- `core_thesis`: Seat-based pricing mismatches value when AI agents perform variable amounts of work per user.
- `who_this_is_for`: PMs partnering with pricing and finance.
- `why_now`: AI usage patterns vary widely and disconnect seats from outcomes.
- `outline`:
  1. Seat model mismatch
  2. Value metric design principles
  3. Hybrid pricing models
  4. Migration risk management
  5. Sales + product alignment
- `example_or_case`: Customer success platform where one power user drives most agent workload.
- `framework`: Value Metric Ladder (seat, usage, outcome, hybrid).
- `counterpoint`: "Seats are simple for sales." Rebuttal: simplicity without value alignment causes churn and expansion limits.
- `action_checklist`:
  - Analyze value concentration by account.
  - Test one usage-aligned pricing axis.
  - Build guardrails for bill shock.
- `cta`: Run a pricing experiment with 5 design partners.

## 12) From SaaS App to System of Decisions
- `title`: From SaaS App to System of Decisions
- `core_thesis`: Winning products shift from record systems to decision systems that reduce cognitive load at key moments.
- `who_this_is_for`: PMs evolving mature SaaS products.
- `why_now`: Data abundance increases decision fatigue for users.
- `outline`:
  1. System of record limits
  2. Anatomy of a decision system
  3. Decision quality instrumentation
  4. Human override and trust
  5. Transition roadmap
- `example_or_case`: RevOps product moving from dashboards to guided action recommendations.
- `framework`: Decision System Canvas.
- `counterpoint`: "Users want control, not automation." Rebuttal: decision systems augment control through context and confidence.
- `action_checklist`:
  - Identify top recurring user decisions.
  - Add one recommendation with confidence metadata.
  - Track decision acceptance vs override.
- `cta`: Prototype one decision-centered workflow this sprint.

## 13) Why Vertical AI Wins Where Horizontal SaaS Stalls
- `title`: Why Vertical AI Wins Where Horizontal SaaS Stalls
- `core_thesis`: Vertical AI compounds value faster through domain workflows, constrained contexts, and tighter feedback loops.
- `who_this_is_for`: PMs evaluating market focus strategy.
- `why_now`: General-purpose tooling is saturated while domain outcomes remain underserved.
- `outline`:
  1. Horizontal ceiling dynamics
  2. Vertical advantage mechanisms
  3. Choosing a wedge market
  4. Expansion logic inside verticals
  5. Risks of over-specialization
- `example_or_case`: Legal review AI outperforming general copilots due to domain workflow integration.
- `framework`: Vertical Compounding Loop.
- `counterpoint`: "Horizontal TAM is bigger." Rebuttal: serviceable, defensible value often grows faster from vertical beachheads.
- `action_checklist`:
  - Define one domain-specific workflow wedge.
  - Specify domain ground-truth signals.
  - Build expansion map within that domain.
- `cta`: Validate one vertical wedge with 10 customer interviews.

## 14) The Post-SaaS GTM Playbook: Wedges, Expansion, Lock-In
- `title`: The Post-SaaS GTM Playbook: Wedges, Expansion, Lock-In
- `core_thesis`: Modern GTM should start with a narrow workflow wedge, then expand through adjacent jobs and trust-based lock-in.
- `who_this_is_for`: PMs collaborating with GTM on growth strategy.
- `why_now`: Legacy funnel-heavy SaaS playbooks underperform in AI-accelerated categories.
- `outline`:
  1. Why old GTM breaks
  2. Wedge selection criteria
  3. Expansion paths by adjacent jobs
  4. Lock-in through workflow + trust
  5. Metrics by stage
- `example_or_case`: Team collaboration product entering via meeting summaries, expanding into decisions and execution workflows.
- `framework`: Wedge-Expansion-Lock-In Model.
- `counterpoint`: "Just add more top-of-funnel." Rebuttal: retention and expansion loops matter more than raw acquisition.
- `action_checklist`:
  - Pick one wedge with acute pain + high frequency.
  - Design two adjacency expansion bets.
  - Define lock-in metrics (workflow depth, switching cost).
- `cta`: Rebuild your quarterly GTM plan around wedge economics.

## 15) Your Product Strategy Is a Portfolio of Time Horizons
- `title`: Your Product Strategy Is a Portfolio of Time Horizons
- `core_thesis`: Strong product strategy balances short-term execution, medium-term positioning, and long-term option creation.
- `who_this_is_for`: PM leaders setting direction under uncertainty.
- `why_now`: AI-era shifts make single-horizon planning fragile.
- `outline`:
  1. One-horizon strategy failure pattern
  2. Three-horizon portfolio model
  3. Allocation rules by business stage
  4. Governance and review cadence
  5. Signals to rebalance
- `example_or_case`: PLG startup overinvesting in near-term growth at the expense of moat-building initiatives.
- `framework`: Time Horizon Strategy Portfolio.
- `counterpoint`: "We cannot afford long-term bets." Rebuttal: no option creation today increases existential risk tomorrow.
- `action_checklist`:
  - Tag initiatives by horizon.
  - Rebalance capacity by explicit target mix.
  - Add monthly rebalance review using market signals.
- `cta`: Publish your horizon allocation and rebalance triggers this week.
