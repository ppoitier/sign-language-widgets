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
- **Naming: use `snake_case` whenever possible** (props, callbacks like `on_new_word`, state, functions, new file names in kebab-case). Existing code is inconsistent (the annotation components use PascalCase file names and `camelCase` props such as `onFinished`, `currentTime`); unify it to `snake_case` when reworking a component, and update its usages (demos, `index.js`).
- Indentation: 4 spaces in `.svelte` files, no semicolons.
- UI strings are in French.

## Documentation

- Every exported component starts with an `<!-- @component -->` header: a short description plus a usage example in a `svelte` code block.
- Props get a `@typedef` with one `@property` per prop (`[name=default]` for optional ones), applied with `/** @type {Props} */` on the `$props()` destructuring.
- Keep docs in sync when props change.

## Verification

- No tests or linter. After changes run `pnpm build` (packages `src/lib`) and check the demo compiles: `npx vite build --outDir "$TEMP/slw-demo-check"`.

## Known issues to fix when reworking components

- `editable-tag`: `$state(text)` only captures the initial value of `text`.
- `tag-list`, `multi-select-field`: `{#each}` blocks have no keys.
- `sign-group`: reassigns the `mode` prop; it should be `$bindable`.
- `multi-select-field`: the toggle button can submit a parent form (TODO in code); `class:opened` could use a `class` array.

## Static assets in demos

- Never `import` from `public/`. Fetch at runtime: `` `${import.meta.env.BASE_URL}path/in/public` `` (keeps working under a sub-path deployment).
- Cancel in-flight requests with an `AbortController` inside `$effect` cleanup.
- `$effect` is fine for fetching (a side effect); don't use it to derive state, use `$derived`.

## Packaging notes

- Keep `typescript` below 7: `svelte-package` (via `svelte2tsx`) refuses TypeScript 7.
- Video player: Video.js 10 through `@videojs/html`, with our own skin in `media/video-player.svelte` (unstyled `media-*` UI elements, French labels via `<media-i18n lang="fr">`). Don't use the packaged `<video-skin>`: its shadow DOM can't be restyled (e.g. the controls gradient). In component CSS, wrap runtime `data-*` selectors in `:global(...)`. Playback rates aren't configurable in Video.js yet, hence the custom speed button. The timeline (native range input) and the time display are ours too, so they can cover only the `start_time`/`end_time` range; playback state goes through Svelte media bindings (`bind:currentTime`, `bind:duration`, `bind:paused`...) on the `<video>`. `video.svelte` still uses the Video.js 8 API and is broken until it is remade. `webcam.svelte` is a plain `<video>` (live `MediaStream`, no Video.js needed); its `video-js vjs-fill` classes are leftovers.
- `package.json` publishes `dist` only; `exports` point at `dist` (`svelte` + `types` conditions). Consumers: `import { Video } from 'sign-language-widgets'` and `import 'sign-language-widgets/global.css'`.
- Sample data in `public/continuous-sample/`: `annotations.json` has tiers `right_hand`, `left_hand`, `both_hands`, `signer`; each annotation has `start_ms`, `end_ms`, `gloss` (+ frame info, lemma, sign_type...). Times are in milliseconds; the timeline expects seconds.
