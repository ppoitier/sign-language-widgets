# sign-language-widgets

Svelte 5 component library (sign language widgets: annotation timeline, video recording, etc.), packaged with `svelte-package`. Package manager: pnpm.

## Commands

- `pnpm dev` — run the demo app (Vite) from `src/app.svelte`
- `pnpm build` — package the library from `src/lib` into `dist` (`svelte-package`, also generates the `.d.ts` files)

## Layout

- `src/lib/` — the published library (only `dist`, built from it, is shipped). Entry point: `src/lib/index.js`; also `global.css`.
- `src/lib/components/` — library components (e.g. `annotations/AnnotationTimeline.svelte`, `timeline-utils.js` holds shared typedefs)
- `src/demo/`, `src/app.svelte`, `src/app.js` — demo app, NOT part of the package. Demos import from `../lib/...`.
- `public/` — demo-only static assets (sample video, annotations JSON)
- New public components must be exported from `src/lib/index.js`.

## Conventions

- **Svelte 5 only**: runes (`$state`, `$derived`, `$props`, `$bindable`, `$effect`), no legacy `export let` / stores / `$:`.
- **Use the Svelte MCP server** when writing or editing Svelte code: look up docs with `get-documentation` / `list-sections`, and run `svelte-autofixer` on every component before finishing (re-run after fixes).
- **Keep code simple.** No speculative abstractions. Use `async/await` when it makes the code clearer.
- **JavaScript + JSDoc, no TypeScript files.** `jsconfig.json` has `checkJs: true`, so annotate props, state, functions and fetched data with JSDoc (`@typedef`, `@type`, `@param`, `@returns`) to avoid IDE type errors. Reuse typedefs via `import('...').Type`.
- Naming in existing code: `snake_case` for functions in demos, `camelCase` for props and component state.
- Indentation: 4 spaces in `.svelte` files, no semicolons.

## Static assets in demos

- Never `import` from `public/`. Fetch at runtime: `` `${import.meta.env.BASE_URL}path/in/public` `` (keeps working under a sub-path deployment).
- Cancel in-flight requests with an `AbortController` inside `$effect` cleanup.
- `$effect` is fine for fetching (a side effect); don't use it to derive state, use `$derived`.

## Packaging notes

- `package.json` publishes `dist` only; `exports` point at `dist` (`svelte` + `types` conditions). Consumers: `import { Video } from 'sign-language-widgets'` and `import 'sign-language-widgets/global.css'`.
- Sample data in `public/continuous-sample/`: `annotations.json` has tiers `right_hand`, `left_hand`, `both_hands`, `signer`; each annotation has `start_ms`, `end_ms`, `gloss` (+ frame info, lemma, sign_type...). Times are in milliseconds; the timeline expects seconds.
