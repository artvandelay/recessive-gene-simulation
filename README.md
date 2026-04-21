# Recessive Gene Simulation

Educational simulator for recessive disease population genetics.

**Try it live: [artvandelay.github.io/recessive-gene-simulation](https://artvandelay.github.io/recessive-gene-simulation/)**

## What it is

An interactive classroom-friendly simulator that shows how allele and genotype frequencies change across generations under real-world forces: natural selection, genetic drift, non-random mating, mutation, and treatment-era shifts. It is meant for students, teachers, and curious readers who want to see concepts like *mutation-selection balance* and *heterozygote advantage* play out visually instead of reading about them.

No biology prerequisites are required to run it — pick a disease, pick a preset, and watch the population evolve.

## How to use it

1. Open the live demo.
2. Pick a **disease profile** (e.g. Sickle Cell, Beta-Thalassemia Major). The profile controls which biological forces are relevant and the genotype labels you see (e.g. `HbAA / HbAS / HbSS`).
3. Pick a **preset** — each preset is a curated scenario that tells a specific story (e.g. *Sickle-like Balancing Selection*, *Mutation-Selection Balance*).
4. Tweak any control on the right panel. Controls you have changed from the preset show a small amber dot so you can tell at a glance what's been customized.
5. Watch the **timeline** and **population view** update generation-by-generation. Use the play/pause/step controls to scrub through time.

Tip: click *Reset to preset* on a control to undo your tweak and bring it back to the preset value.

## The forces at play

The controls are grouped into sections that map directly to a concept students learn:

| Section | What it models |
| --- | --- |
| **Population Setup** | Starting population size, starting allele frequency, whether `N` is held constant |
| **Mating and Drift Forces** | Carrier-pairing bias, consanguinity, endogamy — and how small `N` causes drift |
| **Natural Selection** | Genotype-specific survival (`w_AA / w_Aa / w_aa`) and fertility multipliers |
| **Environmental Forces** | Malaria pressure and heterozygote-advantage strength |
| **Treatment Era** | A generation after which survival and fertility of affected genotypes improve |
| **Simulation Settings** | Number of generations, average children per couple, mutation rate |

Mutation input is explicitly modeled as a per-allele, per-generation rate (`μ`), which lets you demonstrate **mutation-selection balance**: a rare allele can persist at a non-zero equilibrium even under strong selection if mutation keeps refilling it.

## Included disease profiles and presets

| Disease profile | Representative presets |
| --- | --- |
| **Sickle Cell Disease** | Balancing Selection, Low-Malaria Setting, With Consanguinity |
| **Beta-Thalassemia Major** | With Treatment Improvement, Without Treatment, With Mutation Input |
| **Hereditary Spherocytosis** (dominant approx) | Dominant Burden + Mild Selection, + Care Improvement, + Endogamy |
| **G6PD Deficiency** (X-linked approx) | Low Selection, In Malaria Context, Small Population with Malaria |
| **HbSC Disease** (multi-allelic approx) | Moderate Burden, With Care Improvement, Without Malaria |
| **Generic Teaching Profile** | Neutral, Severe Recessive, Mutation-Selection Balance, Small Population Drift |

The Generic Teaching Profile is designed as a clean baseline for isolating one force at a time — a good starting point if you want to build intuition before using the disease-specific profiles.

## Development

Stack: React 19, TypeScript, Vite, Tailwind v4, Vitest.

```bash
npm install
npm run dev      # local dev server
npm test         # vitest one-shot
npm run lint
npm run build    # type-check + production build
```

Project layout:

```
src/
  components/    # UI: ControlPanel, PopulationView, ScenarioCard, StatsPanel, TimelineControls
  sim/           # Pure simulation: engine.ts, diseases.ts, presets.ts, controlSchema.ts, types.ts
```

The simulation engine (`src/sim/engine.ts`) is pure TypeScript with unit tests (`engine.test.ts`, `mutation.test.ts`, `stress.test.ts`, `diseaseProfiles.test.ts`) — safe to import and reason about independently of the UI.

### Deployment

Pushes to `main` auto-deploy to GitHub Pages via [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). The Vite `base` is set to `/recessive-gene-simulation/` in [vite.config.ts](vite.config.ts) to match the Pages URL.
