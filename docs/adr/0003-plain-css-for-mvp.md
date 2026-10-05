# ADR 0003: Plain CSS for the MVP frontend (Tailwind deferred)

- Status: Accepted
- Date: 2026-10-05

## Context

`.kiro/steering/tech.md` lists Tailwind CSS as the UI technology. The MVP's goal
is a reliable, dependency-light starting point the team can run on day one with no
build-config friction. Tailwind adds a PostCSS/config step that is easy to
misconfigure and offers little value for the handful of screens the MVP needs.

## Decision

Ship the MVP with a single hand-written stylesheet (`web/src/index.css`) and no
Tailwind. Keep the component markup plain so adopting Tailwind later is a
mechanical change (swap class names, add the Tailwind toolchain) rather than a
rewrite.

## Consequences

- MVP installs and runs with fewer moving parts; no PostCSS/Tailwind config to break.
- This is a deliberate, documented deviation from `tech.md`, not an oversight.
- If the team wants Tailwind (consistency, utility classes, speed on more
  screens), add it as a follow-up: install Tailwind + PostCSS, generate the
  config, and replace the styles in `index.css`. The UI structure already
  supports this.
