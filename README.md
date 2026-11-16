# sign-language-widgets

Svelte 5 components for sign language apps: video player, webcam preview and recorder, video import,
sign cards and lists with editable words, annotation timeline. The UI texts are in French.

## Install

```sh
pnpm add sign-language-widgets
```

Peer dependency: `svelte` `^5.57.0`.

Import the CSS once, e.g. in the entry point of the app:

```js
import 'sign-language-widgets/global.css' // required
import 'sign-language-widgets/base.css'   // optional
```

- `global.css` (required): sets `:root { font-size: 62.5% }` (the components are sized in rem, 1rem = 10px),
  `box-sizing: border-box` on every element, and the CSS variables of the theme (`--button-color`, `--tag-color`,
  `--card-background`, `--focus-visible-color`...). Override the variables in the app to change the colors.
- `base.css` (optional): the Open Sans font, **loaded from Google Fonts**, and a reset of margins and paddings.
  Leave it out if the app has its own font and reset.

## Usage

```svelte
<script>
    import { SignGroup, VideoAction, DownloadIcon } from 'sign-language-widgets'

    /** @type {import('sign-language-widgets').SignItem[]} */
    let signs = $state([
        { id: 's1', src: '/videos/bonjour.mp4', words: [{ id: 'w1', text: 'bonjour' }], editable: true },
    ])
</script>

<SignGroup {signs}
           on_word_added={(sign, text) => sign.words.push({ id: crypto.randomUUID(), text })}
           on_word_deleted={(sign, word_id) => sign.words = sign.words.filter((w) => w.id !== word_id)}>
    {#snippet video_actions_right(sign)}
        <VideoAction label="Télécharger" onclick={() => download(sign)}><DownloadIcon /></VideoAction>
    {/snippet}
</SignGroup>
```

Every component documents its props and has an example: hover it in the editor, or read the header
of its `.svelte` file.

## Components

| Area        | Components |
|-------------|------------|
| Video       | `VideoPlayer`, `VideoCard`, `MediaCard`, `VideoAction`, `VideoOverlay`, `VideoDownloadDialog` |
| Webcam      | `WebcamPreview`, `VideoRecorder` (+ the `start_recording` service), `VideoImporter` |
| Signs       | `SignCard`, `SignList`, `SignListItem`, `SignGroup`, `CardGrid` |
| Tags        | `Tag`, `EditableTag`, `TagList` |
| Annotations | `AnnotationTimeline` |
| Others      | `IconButton`, `MultiSelectField`, icons (`AddIcon`, `DownloadIcon`, `CloseIcon`...) |

Types of the data, for JSDoc or TypeScript: `import('sign-language-widgets').SignItem`, and also `TagItem`, `Marker`,
`Annotation`, `Tier`, `SeekEvent`, `MultiSelectOption`, `Recording`, `RecordedVideo`, `RecordingOptions`.

## Good to know

- Times are in seconds (video players, markers, annotation timeline).
- The parent owns the data: components report changes through `on_*` callbacks (`on_word_added`, `on_recorded`...)
  and the app updates its state. Some props are bindable (`current_time`, `status`, `file`, `mode`, `open`).
- Errors are shown by each component (French message) and reported to `on_error(error)`: the app decides
  what to do with them (toast, logging...).
- The webcam (`WebcamPreview`, `VideoRecorder`) needs a secure context: HTTPS or `localhost`.
- Recordings are MP4 when the browser can record it (Safari), WebM otherwise (Chrome, Firefox).

## Development

- `pnpm dev`: demo app (`src/app.svelte`), one demo per URL hash (`#video-recorder`, `#annotation-timeline`...).
- `pnpm build`: packages `src/lib` into `dist`.

## License

MIT
