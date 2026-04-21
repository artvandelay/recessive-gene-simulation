# Cursor Agent Build Brief: Recessive Disease Population Simulator

## Objective
Build a modern, visually elegant, educational web app for medical students that simulates the epidemiology of severe autosomal recessive disorders over generations.

The app should help users understand the difference between:
- family-level Mendelian inheritance
- population-level allele dynamics
- carrier prevalence
- affected prevalence
- selection against severe disease
- heterozygote advantage
- effects of assortative mating / endogamy / consanguinity
- effects of improved treatment on long-term prevalence

The initial disease focus is:
- sickle cell disease
- beta-thalassemia major

The experience should feel more like an interactive explorable infographic than a classic dashboard.

---

## Product vision
Create a single-screen simulation that lets the user:
1. set a small number of high-lelevance epidemiologic parameters in a left control panel
2. watch the population evolve on the right in a visually intuitive, animated way
3. switch between family-level intuition and population-level consequences
4. compare scenarios over time

The look should be clean, modern, and visually compelling.
Avoid heavy spreadsheet or institutional-dashboard aesthetics.

Design inspiration:
- explorable explanations
- modern product animation
- cohort visuals / dots / flowing composition blocks
- restrained typography and color
- infographic-first, chart-second

---

## Core learning outcomes
A student using the app should be able to answer:

1. When does the 25-50-25 rule apply?
2. Why does carrier count not need to remain constant?
3. Why is allele frequency the important conserved quantity absent selection?
4. Why does severe recessive disease prevalence tend to fall if affected individuals rarely reproduce?
5. Why can harmful alleles persist anyway?
6. How do malaria-like heterozygote advantage, consanguinity, or improved treatment change the long-run trajectory?

---

## Scope for v1
### Must include
- one-locus autosomal recessive model with genotypes AA, Aa, aa
- deterministic simulation over discrete generations
- animated population composition view
- animated time progression
- left-side hyperparameter controls
- right-side visual population output
- presets for:
  - neutral recessive
  - severe recessive with low aa fitness
  - sickle-like heterozygote advantage
  - beta-thalassemia with treatment improvement over time
- clear live counters
- educational callouts/tooltips

### Nice to have
- stochastic mode
- side-by-side scenario comparison
- guided teaching mode
- export image / share scenario URL

### Out of scope for v1
- multilocus genetics
- age-structured demography
- full real-world registry data integration
- geographic spread
- detailed compound heterozygosity modeling
- every pediatric hem/onc disease

---

## UI requirements
## Layout
### Left panel
Persistent control panel with grouped controls.

Sections:
1. Initial population
2. Mating structure
3. Selection / fitness
4. Environment / disease mode
5. Simulation controls

### Right panel
Primary visual experience.
Prefer non-chart visuals first.

Should include:
- animated cohort / genotype composition visual
- generation scrubber and play/pause
- live counts and prevalence values
- optional compact trend sparkline or small plot

---

## Visual language
### Preferred visual metaphors
Use one or more of these:
- dot-grid population
- flowing stacked bands by genotype over generations
- cohort tiles / glyphs
- family cards for local Punnett intuition
- animated transitions between generations

### Avoid
- dense academic plots as the main interface
- over-labeled charts
- too many simultaneous controls
- medical UI clutter

### Visual states
Use only three primary genotype states:
- AA = unaffected
- Aa = carrier
- aa = affected

These should remain color-consistent across the entire app.
Use an accessible palette.
Do not rely on red/green alone.

---

## Simulation requirements
## Core state variables
Track at minimum per generation:
- population size N
- count of AA
- count of Aa
- count of aa
- allele frequency q
- carrier prevalence
- affected prevalence

## Hyperparameters
### Initial conditions
- total starting population N
- initial allele frequency q OR direct genotype counts

### Reproductive structure
- average children per couple
- fixed population size toggle vs variable size

### Mating structure
- random mating
- endogamy / subgroup bias
- carrier-carrier assortative mating slider
- consanguinity-like increase in carrier pairing probability

### Genotype-specific fitness
Need separate controls for:
- survival to reproductive age
  - w_AA
  - w_Aa
  - w_aa
- fertility multiplier
  - f_AA
  - f_Aa
  - f_aa

### Environment / selection modifiers
- malaria pressure toggle
- heterozygote advantage strength
- treatment era improvement toggle at selected generation

### Simulation runtime
- number of generations
- animation speed
- reset
- preset selector

---

## Educational framing
The app must explicitly teach that:
- 25-50-25 applies only to carrier x carrier mating
- family-level ratios do not equal population-level stability
- prevalence can be undercounted clinically, but the simulation is modeling true underlying genotype frequency
- selection acts on reproductive success, not diagnosis rate

Tooltips or side notes should be short, clinically literate, and accurate.

---

## Suggested interaction flow
1. App opens with default preset: severe recessive disease.
2. User sees a clean cohort visualization and generation 0 counts.
3. User presses play.
4. Over generations, the affected group shrinks faster than the carrier reservoir.
5. User switches to malaria / heterozygote advantage preset and sees stabilization.
6. User switches to treatment improvement and sees altered trajectory.
7. User understands why true prevalence can decline or persist depending on fitness and mating structure.

---

## Presets to implement
## Preset 1: Neutral recessive
- w_AA = 1.0
- w_Aa = 1.0
- w_aa = 1.0
- random mating

Expected behavior:
- no selection-driven decline
- genotype frequencies redistribute but allele persists

## Preset 2: Severe recessive disease
- w_AA = 1.0
- w_Aa = 1.0
- w_aa = 0.05
- fertility of aa near zero
- random mating

Expected behavior:
- affected prevalence declines
- allele declines gradually
- carrier reservoir persists longer

## Preset 3: Sickle-like balancing selection
- w_AA = 0.9
- w_Aa = 1.0
- w_aa = 0.2
- malaria pressure on

Expected behavior:
- allele stabilizes above zero
- affected prevalence remains non-zero
- carrier state remains common

## Preset 4: Thalassemia with treatment improvement
- generations 0-10: w_aa = 0.1
- generations 11+: w_aa = 0.6
- fertility improves after treatment transition

Expected behavior:
- strong early decline softens after treatment improvement
- long-run prevalence falls more slowly or stabilizes at a higher level than untreated scenario

---

## Implementation guidance for Cursor
## Stack
Preferred:
- React
- TypeScript
- Tailwind
- Framer Motion for animation
- Recharts or custom SVG/D3 only if needed minimally

## Architecture
Split into:
1. simulation engine
2. scenario presets
3. visual rendering layer
4. control panel
5. educational copy layer

### Recommended file structure
- `/src/sim/engine.ts`
- `/src/sim/types.ts`
- `/src/sim/presets.ts`
- `/src/components/ControlPanel.tsx`
- `/src/components/PopulationView.tsx`
- `/src/components/StatsPanel.tsx`
- `/src/components/TimelineControls.tsx`
- `/src/components/ScenarioCard.tsx`
- `/src/app/page.tsx`

### Simulation engine requirements
- pure functions where possible
- easy to test
- deterministic mode first
- each generation should return a full state snapshot

### Visual layer requirements
- animate between generation snapshots
- keep transitions smooth
- keep numbers readable
- ensure visual identity remains understandable at a glance

---

## Engineering milestones
## Milestone 1: Core simulator
Deliver:
- genotype state model
- deterministic generation update
- preset loading
- console-testable outputs

## Milestone 2: Basic UI shell
Deliver:
- left panel controls
- right panel population visual
- play/pause/reset
- live counters

## Milestone 3: Teaching polish
Deliver:
- explanatory annotations
- preset cards
- cleaner visual design
- small trend indicators

## Milestone 4: Comparison / refinement
Deliver:
- compare two scenarios OR save/share scenario states
- performance optimization
- responsive layout

---

## Acceptance tests
## Scientific correctness tests
1. **Neutral recessive conservation test**
   - Given w_AA = w_Aa = w_aa = 1 and random mating,
   - allele frequency q should remain approximately constant across generations in deterministic mode.

2. **Selection against aa test**
   - Given w_aa << 1 and w_AA = w_Aa = 1,
   - affected prevalence should decline over generations.

3. **Carrier reservoir persistence test**
   - Under strong selection against aa,
   - carrier prevalence should decline more slowly than affected prevalence.

4. **Balancing selection test**
   - Given heterozygote advantage (w_Aa > w_AA and w_Aa > w_aa),
   - allele frequency should converge toward a non-zero equilibrium rather than zero.

5. **Treatment shift test**
   - If w_aa increases after generation T,
   - the slope of decline in affected prevalence should become less steep after T.

6. **Population accounting test**
   - Counts of AA + Aa + aa must always equal total population N in fixed-size mode.

7. **Prevalence calculation test**
   - carrier prevalence = Aa / N
   - affected prevalence = aa / N
   - allele frequency q = (Aa + 2*aa) / (2*N)
   - computed values must exactly match displayed values.

## UX tests
1. A new user should be able to run a preset simulation within 30 seconds.
2. A user should be able to explain the difference between carrier prevalence and affected prevalence after interacting with two presets.
3. The visual should remain interpretable at all times without needing the chart legend.
4. Controls should be understandable without technical genetics jargon where possible.
5. The animation should not feel ornamental; it should clarify causal change.

## Performance tests
1. Deterministic simulation of 100 generations should feel instant.
2. UI control changes should update within 300 ms.
3. Animation should remain smooth on a typical laptop browser.

## Accessibility tests
1. Color choices must remain distinguishable for common color vision deficiencies.
2. All controls must be keyboard accessible.
3. Key values must be shown as text, not only color or position.
4. Tooltips / educational notes must be readable and concise.

---

## Success criteria
The project is successful if all of the following are true:

### Product success
- A medical student can use it to intuit why a severe recessive disease may decline in true prevalence over generations.
- A student can also see why sickle-like balancing selection prevents simple disappearance.
- The tool feels like a polished explorable, not a classroom spreadsheet.

### Scientific success
- The simulator correctly reproduces expected qualitative dynamics under neutral inheritance, strong selection, and heterozygote advantage.
- No visual or textual element incorrectly implies that 25-50-25 alone determines population prevalence.

### UX success
- The main insight is visible within the first 15 seconds of use.
- The interface is attractive enough to be used in a lecture slide or self-study module.
- The right-side visual communicates the story even if the user ignores the detailed counters.

### Engineering success
- Core simulation logic is unit tested.
- Presets are stable and reproducible.
- Architecture is modular enough to support later stochastic mode.

---

## What Cursor should do first
1. Implement the deterministic simulation engine and preset definitions.
2. Build a clean single-screen React UI with left controls and right animated population composition.
3. Start with one dominant visual metaphor: cohort dots or flowing stacked bands.
4. Add live counters and one compact trend line only after the primary visual works.
5. Write unit tests for allele frequency, prevalence math, and preset behavior before polishing.
6. Iterate on aesthetics only after the educational dynamics are correct.

---

## Deliverables expected from Cursor
### First output
- working local prototype
- one-screen experience
- presets functional
- deterministic simulation correct

### Second output
- improved visual polish
- educational annotations
- responsive layout
- passing tests

### Third output
- optional compare mode and scenario sharing
- presentation-ready visual refinement

---

## Final note for implementation tone
Bias toward clarity, elegance, and conceptual insight.
This is not a data dashboard.
This is an educational explorable for understanding population genetics in clinically relevant recessive disease.

