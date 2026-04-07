# Product Design

This file is the authoritative source for UI and visual design direction.
Use it with `requirements.md` and `security.md`.
This file guides style, tone, layout, and interaction design. It does not override privacy or security rules.

## Design Intent
- The product should feel warm, calm, credible, and safe.
- Visual inspiration comes from Costa Rica: sand, ocean, sun, natural light, shelter, and open air.
- Emotional outcome: hope, peace, dignity, protection, and trust.
- Public pages should invite generosity and confidence.
- Authenticated pages should reduce stress and support careful operational work.

## Location Context
- Use Costa Rica as the visual and brand context.
- If another doc references a different country, do not use that for visual language.
- Draw from coastal and natural cues, not tourism clichés.
- Avoid tropical neon, loud festival color, or generic nonprofit purple.

## Brand Attributes
- Warm, not sugary
- Peaceful, not sleepy
- Safe, not sterile
- Hopeful, not sentimental
- Professional, not corporate
- Human, not playful

## Design Tokens
Use clear, color-based token names in `frontend/src/styles/index.css`.

- `--blue*`: primary brand blue family. Use for major CTAs, navigation, structure, and trust.
- `--sand*`: warm accent family. Use for invitation, highlights, dividers, and small moments of emphasis.
- `--teal*`: secondary blue-green accent family. Use for supporting accents, secondary UI, and restrained data emphasis.
- `--cream*`: default page backgrounds and soft section fills.
- `--text-dark`, `--text-mid`, `--text-light`: text hierarchy.
- `--white`: cards, overlays, and contrast surfaces.

### Token Rules
- Prefer descriptive token names that match the visible color family.
- Prefer cream and white as base surfaces.
- Use saturated color for emphasis, not as the default everywhere.
- Sand is an accent, not the primary background color.
- Avoid pure black, neon, harsh gradients, and rainbow UI.
- Keep contrast accessible.

## Typography
- Display and headings: `Fraunces`
- Body, UI, forms, labels, and tables: `DM Sans`

### Typography Rules
- Prefer sentence case.
- Headings should feel editorial, composed, and human.
- Use small uppercase labels for section markers and utility text only.
- Avoid oversized all-caps headlines and aggressive marketing language.
- Keep body copy readable, airy, and calm.

## Imagery
- Use sunlit, natural, human photography.
- Favor coast, sky, greenery, homes, hands, community, and quiet care.
- Images should imply refuge, recovery, dignity, and stability.
- Use soft overlays to preserve legibility and emotional calm.

### Avoid
- Distress imagery
- Rescue tropes
- Police or crime imagery
- Photos that expose pain for emotional leverage
- Generic business-office stock photography

## Layout
- Use a centered content container with `max-width: 1200px`.
- Maintain generous horizontal padding and strong vertical rhythm.
- Prefer clean section blocks over cramped multi-purpose layouts.
- Use simple geometry: flat planes, thin borders, soft shadows, and small radii.
- Public pages may be more cinematic.
- Authenticated pages should be quieter, denser, and more utilitarian.

## Motion
- Motion should feel soft, slow, and intentional.
- Use subtle reveal transitions, hover lift, and gentle scroll cues.
- Animation should support calm and polish, not excitement.
- Avoid aggressive parallax, bounce-heavy UI, or constant decorative motion.

## Component Direction
### Buttons
- Primary CTA: primary blue family.
- Warm conversion CTA: sand family.
- On dark imagery: use white outline or white text treatment.

### Cards
- Use cream or white surfaces.
- Keep shadows soft and borders light.
- Small radii are preferred over pill or bubbly shapes.

### Navigation
- Refined and minimal.
- Transparent over immersive hero sections.
- Solid cream on scroll and on interior pages.

### Forms
- High trust, low friction.
- Calm styling with clear labels and obvious validation.
- Prioritize clarity over decoration.

### Data Displays
- Public analytics must be aggregated and anonymized.
- Favor restrained charts and summary blocks over noisy dashboards.
- Use palette discipline; do not default to rainbow chart colors.

## Product Surface Rules
### Public
- Emotion-first, story-led, trust-building.
- Use large imagery, clear headlines, and one or two strong CTAs.
- Reinforce stewardship, safety, and concrete impact.

### Authenticated
- Function-first, privacy-aware, low cognitive load.
- Use more cream and white, less full-bleed imagery.
- Prioritize scanability: summaries, filters, timelines, status, and recent activity.
- Sensitive information should feel controlled and discreet, never dramatic.

## Screen Patterns
- Landing page: immersive hero, mission, impact stats, core services, need, donation CTA.
- About page: story, values, approach, and place-based credibility.
- Donate page: amount-first flow, trust signals, clear impact explanation, minimal distractions.
- Admin dashboard: summary cards, recent changes, upcoming actions, risk and progress signals.
- Donors and contributions: list-detail workflow with clear allocation visibility.
- Case management pages: timeline-oriented records, structured forms, and calm information density.
- Reports and analytics: comparative summaries, trend views, and decision-support framing.

## Copy Tone
- Calm, respectful, grounded, hopeful.
- Speak in terms of safety, healing, dignity, stewardship, and long-term care.
- Prefer concrete impact over inspirational vagueness.
- Avoid pity-driven language, savior framing, and exaggerated urgency.

## Accessibility And Safety
- Meet or exceed the accessibility targets in `requirements.md`.
- Never use color alone to communicate critical meaning.
- Keyboard, focus, and screen-reader flows must remain clean.
- Public surfaces must never expose sensitive resident information.
- Design should reduce anxiety for staff who work with traumatic subject matter.

## Agent Rules
- Reuse existing CSS tokens and patterns before adding new ones.
- Prefer `frontend/src/styles/index.css` as the design token source of truth.
- Match the current visual language: coastal warmth, editorial typography, restrained UI, soft motion.
- Do not introduce a new brand palette unless explicitly requested.
- If a design choice feels flashy, corporate-SaaS, emotionally harsh, or trend-driven, it is probably wrong.
- When in doubt, choose the calmer, warmer, more trustworthy option.
