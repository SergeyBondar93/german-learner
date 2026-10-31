# Project Guidelines

## Product

The user-facing product is a mobile-first German-learning website. `index.html` is generated from `scripts/build-standalone.mjs`; keep the generated page and its source generator in sync. This repository contains only the static website and its content/build tooling.

## Changes

- Keep lesson content, trainer behavior, and generated web output consistent.
- Preserve the app's mobile layout and compatibility with modern browsers.
- Update directly related documentation when behavior changes.
- Do not edit generated `index.html` by hand; run `npm run build:html`.

## Validation

Run the smallest relevant checks, and before completing website changes run:

```sh
npm run build:html
npm test -- --runInBand
npm run typecheck
npm run lint
```
