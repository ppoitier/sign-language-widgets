<!--
@component
Card with a 16:9 video (see `VideoPlayer`) on top and free content below.

```svelte
<VideoCard src={video.url} highlighted={is_selected}>
    {#snippet video_actions_right()}
        <IconButton onclick={download}><DownloadIcon /></IconButton>
    {/snippet}
    <h3>{video.title}</h3>
</VideoCard>
```
-->

<script>
    import VideoPlayer from './video-player.svelte'

    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {string} src - URL of the video.
     * @property {string | undefined} [poster] - URL of an image displayed before the video plays.
     * @property {boolean} [autoplay=true] - If true, play the video when loading.
     * @property {boolean} [loop=true] - If true, loop the playback of the video.
     * @property {boolean} [fluid=false] - If true, the card doesn't have a maximum width anymore.
     * @property {boolean} [highlighted=false] - If true, the card is outlined.
     * @property {Snippet | undefined} [video_actions_left] - Actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [video_actions_right] - Actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [error] - Message shown when the video cannot be played. Defaults to "Vidéo non disponible !".
     * @property {number} [current_time=0] - Playback position in seconds. Bindable: follows the playback, and setting it jumps to that time.
     * @property {Snippet | undefined} [children] - Content of the card, below the video.
     */

    /** @type {Props} */
    let {
        src,
        poster,
        autoplay = true,
        loop = true,
        fluid = false,
        highlighted = false,
        video_actions_left,
        video_actions_right,
        error,
        current_time = $bindable(0),
        children,
    } = $props()
</script>

<div class={['video-card', { fluid, highlighted }]}>
    <VideoPlayer {src} {poster} {autoplay} {loop} {video_actions_left} {video_actions_right} {error} bind:current_time />

    {#if children}
        <div class="video-card_content">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .video-card {
        width: 100%;
        min-width: var(--card-min-width);
        max-width: var(--card-max-width);
        overflow: hidden;
        border-radius: 0.8rem;
        border: 0.1rem solid var(--card-border);
        background-color: var(--card-background);
    }

    .video-card.fluid {
        max-width: 100%;
    }

    .video-card.highlighted {
        outline: 0.3rem solid red;
    }

    .video-card_content {
        padding: 0.5rem;
        font-size: 1.2rem;
    }
</style>
