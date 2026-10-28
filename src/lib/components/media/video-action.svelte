<!--
@component
Button shown over a video, e.g. in its corner actions (`video_actions_left` / `video_actions_right` of
`VideoPlayer`, `VideoCard`, `SignCard`...) or an overlay: white on a translucent dark background, readable on any video.
Holds a text, or an icon when `label` is given.

```svelte
<VideoCard src={video.url}>
    {#snippet video_actions_right()}
        <VideoAction label="Télécharger" onclick={download}><DownloadIcon /></VideoAction>
        <VideoAction onclick={restart}>Recommencer</VideoAction>
    {/snippet}
</VideoCard>
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} children - Content of the button: a text, or an icon (with `label`).
     * @property {string | undefined} [label] - For an icon button: accessible name and tooltip of the button.
     * @property {(event: MouseEvent) => void} [onclick] - Called when the button is clicked.
     */

    /** @type {Props} */
    let { children, label, onclick } = $props()
</script>

<button type="button" class={['video-action', { icon: label }]} aria-label={label} title={label} {onclick}>
    {@render children()}
</button>

<style>
    .video-action {
        padding: 0.6rem 1.2rem;
        border: 0.2rem solid white;
        border-radius: 0.8rem;
        background: rgb(0 0 0 / 0.4);
        color: white;
        font: inherit;
        font-size: 1.4rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .video-action:hover {
        background: black;
    }

    .video-action:focus-visible {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }

    .video-action.icon {
        padding-inline: 0.6rem;
        font-size: 1.8rem;
        line-height: 1;
    }
</style>
