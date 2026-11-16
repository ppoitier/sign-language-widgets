# sign-language-widgets

Svelte 5 component library (sign language widgets: annotation timeline, video recording, etc.), packaged with `svelte-package`. Package manager: pnpm.

## Commands

- `pnpm dev` — run the demo app (Vite) from `src/app.svelte`
- `pnpm build` — package the library from `src/lib` into `dist` (`svelte-package`, also generates the `.d.ts` files)

## Layout

- `src/lib/` — the published library (only `dist`, built from it, is shipped). Entry point: `src/lib/index.js`; also `global.css` and `base.css` (see Styles for apps).
- `src/lib/components/` — library components (e.g. `annotations/annotation-timeline.svelte`, `timeline-utils.js` holds shared typedefs)
- `src/lib/services/` — non-UI logic used by the components (see Architecture)
- `src/demo/`, `src/app.svelte`, `src/app.js` — demo app, NOT part of the package. Demos import from `../lib/...`.
- `public/` — demo-only static assets (sample video, annotations JSON)
- New public components must be exported from `src/lib/index.js`.

## Conventions

- **Svelte 5 only**: runes (`$state`, `$derived`, `$props`, `$bindable`, `$effect`), no legacy `export let` / stores / `$:`.
- **Use the Svelte MCP server** when writing or editing Svelte code: look up docs with `get-documentation` / `list-sections`, and run `svelte-autofixer` on every component before finishing (re-run after fixes).
- **Keep code simple.** No speculative abstractions. Use `async/await` when it makes the code clearer.
- **JavaScript + JSDoc, no TypeScript files.** `jsconfig.json` has `checkJs: true`, so annotate props, state, functions and fetched data with JSDoc (`@typedef`, `@type`, `@param`, `@returns`) to avoid IDE type errors. Reuse typedefs via `import('...').Type`.
- **Naming: use `snake_case` whenever possible** (props, callbacks like `on_new_word`, state, functions, new file names in kebab-case). When renaming a prop or file, update its usages (demos, `index.js`).
- Indentation: 4 spaces in `.svelte` files, no semicolons.
- UI strings are in French.

## Architecture: simple components

- **Components stay simple: UI only.** What to show (layout, steps/screens of a flow, overlays), user interactions, and presentation (French messages, styles). No business logic in components.
- **Services** (`src/lib/services/*.service.js`, plain JS + JSDoc): logic that manages a resource over time or enforces a rule (e.g. recording, its constraints and limits). A service is usable without any component, and exported from `index.js` when apps can use it directly. Components call services and tie them to their lifecycle (start in `$effect`, stop in its cleanup).
- **Helpers**: small pure functions (formatting, fullscreen...), kept next to the components that use them (e.g. `media/format-time.js`); move them to a shared folder only once used elsewhere.
- **Errors**: no global error store. Each component shows its own errors (French message in its overlay) and reports them through an `on_error(error)` callback; apps decide what to do (toast, logging...). `<svelte:boundary>` is the app-level safety net for unexpected errors.
- When writing or reworking a component, move non-UI logic to a service. But don't extract further speculatively: e.g. a headless `.svelte.js` controller holding a component's flow is only worth it once a second UI needs the same flow.

## Documentation

- Every exported component starts with an `<!-- @component -->` header: a short description plus a usage example in a `svelte` code block.
- Props get a `@typedef` with one `@property` per prop (`[name=default]` for optional ones), applied with `/** @type {Props} */` on the `$props()` destructuring.
- Keep docs in sync when props change.

## Verification

- No tests or linter. After changes run `pnpm build` (packages `src/lib`) and check the demo compiles: `npx vite build --outDir "$TEMP/slw-demo-check"`.

## Styles for apps

- Components must not style anything outside themselves: no `:global(...)` selector on bare elements or attributes (only `:global` around runtime `data-*` attributes of their own elements, or on their own children).
- `global.css` (required by the components): `:root { font-size: 62.5% }` (all sizes are in rem, 1rem = 10px), `box-sizing: border-box`, CSS variables. `base.css` (optional): Google Fonts + margin/padding reset. Components must not rely on `base.css`: set `margin: 0` / `padding: 0` where needed (`<ul>`, headings, paragraphs).
- Buttons always get `type="button"` (apps may place components inside a form); no `<form method="dialog">` for the same reason.
- Icons are decorative (`aria-hidden="true"`, `fill="currentColor"`, 1em): the button holding one gets a label.

## Demos

- `src/app.svelte` shows one demo at a time, chosen by the URL hash (`#card-grid`, `#video-recorder`...), with a navigation bar; the default is `card-grid`. Add a new demo to its `demos` object (one import + one entry).

## Static assets in demos

- Never `import` from `public/`. Fetch at runtime: `` `${import.meta.env.BASE_URL}path/in/public` `` (keeps working under a sub-path deployment).
- Cancel in-flight requests with an `AbortController` inside `$effect` cleanup.
- `$effect` is fine for fetching (a side effect); don't use it to derive state, use `$derived`.

## Media components (`src/lib/components/media/`)

- Components:
  - `video-player.svelte` (`VideoPlayer`): Video.js 10 player with our own skin; props `current_time` (bindable), `markers`, `start_time`/`end_time`, `error` snippet, corner actions, `bind:video_element` (frame processing); children are a layer over the video, under the controls, with `pointer-events: none` (canvas for landmarks, overlays).
  - `model-loading-overlay.svelte` (`ModelLoadingOverlay`, not exported yet): `VideoOverlay` with a message and a `<progress>` following a `ModelLoading` (`{ step: 'downloading' | 'initializing', loaded, total }` from the holistic landmarker service); indeterminate bar while initializing or when the size is unknown.
  - `webcam-preview.svelte` (`WebcamPreview`): live camera, no Video.js; exposes `bind:stream` (recording) and `bind:video_element` (MediaPipe); children are a layer mirrored with the video (canvas for landmarks). The `overlay` snippet is rendered after its own loading/error `VideoOverlay`s, so an app's `VideoOverlay` there (e.g. `ModelLoadingOverlay`) covers them.
  - `media-card.svelte` (`MediaCard`): generic card with a `media` snippet; `video-card.svelte` (`VideoCard`) is a shortcut for `MediaCard` + `VideoPlayer`.
  - `video-recorder.svelte` (`VideoRecorder`): `WebcamPreview` + `start_recording` (see Services), then `VideoPlayer` for playback. A bindable `status` (`idle` → `countdown` → `recording` → `recorded`) drives everything through `$effect`s (the recording effect runs its body in `untrack`, so only `status` restarts it); `on_recorded` gets the `Blob`. `constraints` go to `getUserMedia` (preview + recording), `recording_constraints` to the recorded video only. On failure: French message on the idle overlay, back to `idle`, `on_error` (also forwarded from `WebcamPreview`). Recorded WebM has no duration (Infinity in Chrome), so the measured duration is passed as `end_time`. Countdown/buttons go in `WebcamPreview`'s `overlay` snippet (not mirrored, visible in fullscreen). The webcam and the player are swapped inside a wrapper `div` passed to both as `fullscreen_element`, so fullscreen survives the swap (it can't be re-requested on the new element: `requestFullscreen` needs a user click, and the recording can stop by itself).
  - `fullscreen.js`: `get_fullscreen_element()` (reactive, via `createSubscriber`) and `toggle_fullscreen(element)`. `WebcamPreview` and `VideoPlayer` take an optional `fullscreen_element`; `VideoPlayer` then swaps Video.js' fullscreen button (which only targets its own `media-container`) and the `f` hotkey for our button. Without it, keep Video.js' button: it also handles the iPhone (video-only fullscreen).
  - `video-importer.svelte` (`VideoImporter`): 16:9 drop zone (a `<label>` around a visually hidden but focusable file input, no JS click), then `VideoPlayer` for playback; its "Changer de vidéo" corner action is another `<label>` around the same input (shared `file_input` snippet), so it opens the picker directly; a cross (`icons/close-icon.svelte`) next to it removes the video. Bindable `file` (`undefined` shows the drop zone); `on_imported` gets the `File`; non-video files are refused (dropping ignores `accept`).
  - `video-action.svelte` (`VideoAction`): button shown over a video (corner actions, overlays), white on translucent black; with `label`, it's an icon button (`aria-label` + tooltip). Used by `VideoRecorder` and `VideoImporter`, whose "Changer de vidéo" `<label>` keeps a copy of the style (`.button`): it can't be a button.
  - Helpers: `format-time.js` (`m:ss`), `video-marker.js` (`Marker` typedef), `fullscreen.js`.
- All media times are in **seconds**.
- Video.js 10 (`@videojs/html`; don't add the `video.js` npm package: it's only a v8 → v10 pointer, no player):
  - Don't use the packaged `<video-skin>`: its shadow DOM can't be restyled (e.g. the controls gradient) and its timeline can't hold markers.
  - Our skin uses unstyled `media-*` elements, French labels via `<media-i18n lang="fr">`. In component CSS, wrap runtime `data-*` selectors in `:global(...)`.
  - Playback rates aren't configurable in Video.js yet, hence the custom speed button. The timeline (native range input) and the time display are ours too, so they can cover only the `start_time`/`end_time` range.
  - Playback state goes through Svelte media bindings on the `<video>` (`bind:currentTime`, `bind:duration`, `bind:paused`, `bind:playbackRate`), not the Video.js store.
  - Errors: use the `<video>` `error` event, not `<media-error-dialog>` (it misses errors raised before it attaches). The loading overlay waits for `loadedmetadata`, not `loadeddata` (iOS may not load frames before play).
- `$effect` is legitimately used to drive media (range clamping in `VideoPlayer`, opening/releasing the camera in `WebcamPreview`): the autofixer's "state assigned in `$effect`" suggestions there are expected.
- Corner actions use `z-index: 101`, above `VideoOverlay` (`z-index: 100`), so they stay usable on loading/error.
- `getUserMedia` needs a secure context (HTTPS or `localhost`).
- Demos: `demo/video-card-demo.svelte`, `demo/webcam-demo.svelte`, `demo/video-recorder-demo.svelte` and `demo/video-importer-demo.svelte` (see Demos).

## Tags and signs (`src/lib/components/tags/`, `signs/`)

- `tag.svelte` (`Tag`), `editable-tag.svelte` (`EditableTag`: bindable `editing`, `on_save` / `on_delete` (empty text) / `on_cancel`, optional `validate(text)` returning a French error: the field is `:invalid` via `setCustomValidity`, Enter shows the browser bubble, blur cancels), `tag-list.svelte` (`TagList`: `tags` are `TagItem`s `{ id, text }` from `tag-item.js`, keyed by `id`; callbacks `on_added(text)`, `on_updated(id, text)`, `on_deleted(id)`; texts are unique, ignoring case). The parent owns the data and updates it in the callbacks.
- `signs/sign-card.svelte` (`SignCard`): `VideoCard` + `TagList` of `words`, flat props (no `Sign` entity), corner action snippets and an `actions` snippet next to the words. Callbacks don't get the sign id: the parent closes over it.
- `signs/sign-list.svelte` (`SignList`, a `<ul>` with children) + `signs/sign-list-item.svelte` (`SignListItem`, an `<li>`): list counterpart of `CardGrid` + `SignCard`, same props as `SignCard`. Each row is a size container: below 56rem wide, the words go under the video (container query, not a media query).
- `signs/sign-group.svelte` (`SignGroup`): `signs` (`SignItem`s `{ id, src, poster?, words, editable?, highlighted? }` from `sign-item.js`) as a `CardGrid` of `SignCard`s or a `SignList`, switched by buttons (bindable `mode`: `'grid'` / `'list'`). The action snippets (`video_actions_left/right`, `actions`) take the sign as parameter, so apps write their buttons in their own scope (no callbacks threaded through the group); the word callbacks get the sign first. Both item components share their props, so the group renders one `{#each}` with `Item = mode === 'grid' ? SignCard : SignListItem`.
- `media/video-download-dialog.svelte` (`VideoDownloadDialog`): modal `<dialog>` to choose a format (gif, webp, mp4, webm), bindable `open`, `on_download(format)`. Not part of `SignGroup`: the app opens it from its download button and remembers the sign.
- Demos `sign-card-demo`, `sign-list-demo` and `sign-group-demo` share their data and word helpers from `demo/sample-signs.js`.
- Layout: `layout/card-grid.svelte` (`CardGrid`): responsive grid, 1 column on phones up to `max_columns`; cards keep their own height (`align-items: start`).

## Annotation timeline (`src/lib/components/annotations/`)

- `annotation-timeline.svelte` (`AnnotationTimeline`, the only exported one): `timeline-overview.svelte` (full duration + `timeline-brush.svelte`) above one `annotation-tier.svelte` per tier (bars are `annotation.svelte`, playhead `playhead.svelte`). Props: `duration`, `tiers`, bindable `current_time`, `follow_playback`, sizing props, callbacks `on_annotation_click`, `on_seek`, `on_selection_change`. Without `width`, it fills its container (`bind:clientWidth`); nothing is drawn while `duration` is 0 (the scales would divide by 0).
- Drags (tier background, brush) listen on `<svelte:window>` (pointermove / pointerup / pointercancel, ignored while no drag is active) and use `touch-action: none`, so they work on touch screens and are cleaned up on destroy.
- `selected_range` (the brushed range) is a writable `$derived`: starts at `[0, default_selection_span ?? max_selection_span]` (clamped to the duration and the max span), reset when `duration` / `max_selection_span` / `default_selection_span` change, reassigned by the brush, tier drags and the `follow_playback` effect (its "state assigned in `$effect`" autofixer suggestion is expected).
- `annotation.svelte` fits its label by measuring in a separate hidden `<text>`: never set `textContent` on an element whose content Svelte renders.
- Typedefs (`Annotation`, `Tier`, `SeekEvent`, `LinearScale`) and helpers in `timeline-utils.js`.
- Demo `demo/annotation-timeline-demo.svelte`: a `VideoPlayer` of the sample video and the timeline share one `current_time` state (both bindable, in seconds), so each follows the other; clicking an annotation seeks to its start. The timeline's `duration` comes from the last annotation's end (`VideoPlayer` doesn't expose the video's duration).

## Services (`src/lib/services/`)

- `recording.service.js` (exported): `start_recording(stream, { max_duration, video_constraints, bit_rate, mime_types })` → `{ done, stop }`. `done` resolves with `{ blob, duration }` when the recording stops (`stop()`, `max_duration` reached, or the stream ends), rejects on failure; `stop()` also releases the tracks (to discard, call it and ignore `done`). It records **clones** of the tracks, so `video_constraints` (`applyConstraints`) never affect the original stream / preview. Formats: MP4 first (Safari only records MP4), then WebM (Firefox).
- `holistic-landmarker.service.js` (not exported yet): `start_holistic_landmarker(video, { on_result, on_loading, on_error, every_frame, model_url, delegate })` → `{ ready, stop }`; `on_result(result, { frame_time, inference_ms, pending })`; `on_loading({ step, loaded, total })` until `ready` (the worker reports the model download, then `initializing`); the worker posts `ready` only after a warm-up `detectForVideo` on a blank `OffscreenCanvas` (timestamp 0): the GPU setup is lazy, on the first detection, so without it `ready` came seconds before the first result (the warm-up is inside the GPU → CPU fallback try); init errors reject `ready` only, later ones go to `on_error`. MediaPipe (`@mediapipe/tasks-vision`) runs in a module worker (`holistic-landmarker.worker.js`, created with `new Worker(new URL(...), { type: 'module' })`); frames are sent as transferred `ImageBitmap`s from `requestVideoFrameCallback`. By default one is in flight at a time (others skipped, results stay live); with `every_frame`, all are queued in the worker (processed in order, results lag and memory grows if the model is slower than the video). Detection timestamps are `performance.now()` (strictly increasing, required by VIDEO mode); `frame_time` is the frame's `mediaTime`, for matching results to video time. GPU delegate with CPU fallback. The model comes from Google Cloud Storage (not Hugging Face), the wasm from jsDelivr (`WASM_URL`, keep its version in sync with the installed package; `forVisionTasks(url, true)` loads the ES module build, required in module workers). `stop()` terminates the worker.
- `model-cache.js`: `fetch_model(url, on_progress)` caches model files with the Cache API (falls back to the network alone); the cache write runs while the body is read (with a reader, not `for await`: Safari can't iterate streams), so progress follows the download. No DOM access (used by workers).
- Demos (drawing shared in `demo/draw-holistic-landmarks.js`, MediaPipe's `DrawingUtils`; canvases use `object-fit: contain` to match the video's letterboxing):
  - `demo/holistic-landmarker-demo.svelte`: live webcam, `WebcamPreview` + a `<canvas>` child (mirrored with the video) and `ModelLoadingOverlay` in its `overlay` snippet (not mirrored). The model loads in parallel with the camera (waiting would add both delays), but its overlay is only shown once `stream` is set, so it doesn't stack on the webcam's loading/error overlay.
  - `demo/holistic-extraction-demo.svelte`: sample video in `VideoPlayer` (`autoplay={false}`, `loop={false}`) with `every_frame`; it plays once the model is ready, and shows extracted frames, the queue and the lag (`current_time - frame_time`).

## Packaging notes

- Keep `typescript` below 7: `svelte-package` (via `svelte2tsx`) refuses TypeScript 7.
- `peerDependencies.svelte` follows a recent Svelte (`^5.57.0`): the apps using the library stay on the latest Svelte, so recent features (e.g. attachments `{@attach}`) are allowed. Raise it when a component needs a newer feature, and keep it in sync with the `svelte` devDependency.
- Shared typedefs live in `.js` files (e.g. `media/video-marker.js`), not in `.svelte` files, so the generated `.d.ts` can import them. Typedefs of data given by apps are re-exported from `index.js` (top-level `@typedef`s become `export type` in `dist/index.d.ts`): add new ones there.
- `package.json` publishes `dist` only; `exports` point at `dist` (`svelte` + `types` conditions). Consumers: `import { VideoPlayer } from 'sign-language-widgets'`, `import 'sign-language-widgets/global.css'` and optionally `'sign-language-widgets/base.css'`. Bump the major version on breaking changes (renamed props, files, exports).
- `README.md` is the documentation for app developers: keep it in sync (CSS imports, components list, exported types).
- Sample data in `public/continuous-sample/`: `annotations.json` has tiers `right_hand`, `left_hand`, `both_hands`, `signer`; each annotation has `start_ms`, `end_ms`, `gloss` (+ frame info, lemma, sign_type...). Times are in milliseconds; the timeline expects seconds.
