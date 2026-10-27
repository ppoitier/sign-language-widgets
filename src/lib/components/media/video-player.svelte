<!--
@component
Video.js 10 player (muted) in a 16:9 container, with its own skin: play/pause, timeline, time,
playback speed (0.25x to 2x) and fullscreen. Click the video to play/pause.
Optional actions are overlaid in the top corners; they are shown on hover for fine pointers.
If the video cannot be played (e.g. missing file), an error overlay is shown instead.

```svelte
<VideoPlayer src={video.url}>
    {#snippet video_actions_right()}
        <IconButton onclick={download}><DownloadIcon /></IconButton>
    {/snippet}
    {#snippet error()}
        <h3>Fichier introuvable</h3>
    {/snippet}
</VideoPlayer>
```

Follow or change the playback position (in seconds) from outside:
```svelte
<VideoPlayer src={video.url} bind:current_time />
<button onclick={() => current_time = 2.5}>Aller à 2,5 s</button>
```
-->

<script>
    import '@videojs/html/i18n'
    import '@videojs/html/i18n/locales/fr/register'
    import '@videojs/html/icons/element/default'
    import '@videojs/html/video/player'
    import '@videojs/html/ui/container'
    import '@videojs/html/ui/controls'
    import '@videojs/html/ui/controls-content'
    import '@videojs/html/ui/controls-group'
    import '@videojs/html/ui/play-button'
    import '@videojs/html/ui/time-slider'
    import '@videojs/html/ui/slider-track'
    import '@videojs/html/ui/slider-buffer'
    import '@videojs/html/ui/slider-fill'
    import '@videojs/html/ui/slider-thumb'
    import '@videojs/html/ui/time'
    import '@videojs/html/ui/time-group'
    import '@videojs/html/ui/time-separator'
    import '@videojs/html/ui/fullscreen-button'
    import '@videojs/html/ui/buffering-indicator'
    import '@videojs/html/ui/gesture'
    import '@videojs/html/ui/hotkey'
    import '@videojs/html/ui/status-announcer'

    import VideoOverlay from './video-overlay.svelte'
    import NotFoundIcon from '../icons/not-found-icon.svelte'

    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {string} src - URL of the video.
     * @property {string | undefined} [poster] - URL of an image displayed before the video plays.
     * @property {boolean} [autoplay=true] - If true, play the video when loading.
     * @property {boolean} [loop=true] - If true, loop the playback of the video.
     * @property {Snippet | undefined} [video_actions_left] - Actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [video_actions_right] - Actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [error] - Message shown when the video cannot be played. Defaults to "Vidéo non disponible !".
     * @property {number} [current_time=0] - Playback position in seconds. Bindable: follows the playback, and setting it jumps to that time.
     */

    /** @type {Props} */
    let {
        src,
        poster,
        autoplay = true,
        loop = true,
        video_actions_left,
        video_actions_right,
        error,
        current_time = $bindable(0),
    } = $props()

    /** @type {string | undefined} */
    let failed_src = $state()
    // Resets by itself when another video is loaded.
    let has_error = $derived(failed_src === src)

    // Video.js 10 doesn't allow custom rates on its playback rate button yet.
    const PLAYBACK_RATES = [0.25, 0.5, 1, 2]

    let playback_rate = $state(1)

    function next_playback_rate() {
        const index = PLAYBACK_RATES.indexOf(playback_rate)
        playback_rate = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]
    }
</script>

<media-i18n lang="fr">
    <video-player>
        <media-container class="video-player">
            <video {src} {poster} {autoplay} {loop} muted playsinline preload="metadata"
                   bind:currentTime={current_time}
                   bind:playbackRate={playback_rate}
                   onerror={() => failed_src = src}></video>

            <media-buffering-indicator class="buffering">
                <media-icon name="spinner" class="buffering_icon"></media-icon>
            </media-buffering-indicator>

            <media-controls>
                <media-controls-content class="controls">
                    <media-time-slider class="time-slider">
                        <media-slider-track class="time-slider_track">
                            <media-slider-buffer class="time-slider_buffer"></media-slider-buffer>
                            <media-slider-fill class="time-slider_fill"></media-slider-fill>
                        </media-slider-track>
                        <media-slider-thumb class="time-slider_thumb"></media-slider-thumb>
                    </media-time-slider>

                    <media-controls-group class="controls_group" aria-label="Contrôles de lecture">
                        <media-play-button class="control play-button">
                            <media-icon name="restart" class="restart-icon"></media-icon>
                            <media-icon name="play" class="play-icon"></media-icon>
                            <media-icon name="pause" class="pause-icon"></media-icon>
                        </media-play-button>

                        <media-time-group class="time">
                            <media-time type="current"></media-time>
                            <media-time-separator></media-time-separator>
                            <media-time type="duration"></media-time>
                        </media-time-group>

                        <button type="button"
                                class="control playback-rate"
                                aria-label="Vitesse de lecture {playback_rate}×"
                                onclick={next_playback_rate}>
                            {playback_rate}×
                        </button>

                        <media-fullscreen-button class="control fullscreen-button">
                            <media-icon name="fullscreen-enter" class="fullscreen-enter-icon"></media-icon>
                            <media-icon name="fullscreen-exit" class="fullscreen-exit-icon"></media-icon>
                        </media-fullscreen-button>
                    </media-controls-group>
                </media-controls-content>
            </media-controls>

            {#if has_error}
                <VideoOverlay>
                    {#snippet icon()}
                        <NotFoundIcon />
                    {/snippet}
                    {#snippet content()}
                        {#if error}
                            {@render error()}
                        {:else}
                            <h3>Vidéo non disponible !</h3>
                        {/if}
                    {/snippet}
                </VideoOverlay>
            {/if}

            {#if video_actions_left}
                <div class="actions top-left">
                    {@render video_actions_left()}
                </div>
            {/if}
            {#if video_actions_right}
                <div class="actions top-right">
                    {@render video_actions_right()}
                </div>
            {/if}

            <media-gesture type="tap" action="togglePaused"></media-gesture>
            <media-hotkey keys="Space" action="togglePaused"></media-hotkey>
            <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
            <media-hotkey keys="ArrowLeft" action="seekStep" value="-1"></media-hotkey>
            <media-hotkey keys="ArrowRight" action="seekStep" value="1"></media-hotkey>
            <media-status-announcer></media-status-announcer>
        </media-container>
    </video-player>
</media-i18n>

<style>
    media-i18n,
    video-player {
        display: block;
    }

    .video-player {
        --accent-color: var(--active-action-color, white);
        position: relative;
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background-color: black;
        color: white;
    }

    video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    /* ---- Controls ---- */

    .controls {
        position: absolute;
        inset: auto 0 0;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0 0.8rem 0.4rem;
        /* No backdrop: keep the controls readable over bright frames. */
        filter: drop-shadow(0 0 0.2rem rgb(0 0 0 / 0.8));
        transition: opacity 0.2s ease-in-out;
        pointer-events: none;
    }

    .controls:not(:global([data-visible])):not(:has(:focus-visible)) {
        opacity: 0;
    }

    .controls_group {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        pointer-events: auto;
    }

    .control {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.8rem;
        height: 2.8rem;
        padding: 0 0.4rem;
        border: none;
        border-radius: 0.4rem;
        background: none;
        color: inherit;
        font: inherit;
        font-size: 1.3rem;
        font-weight: 600;
        cursor: pointer;
    }

    .control:focus-visible {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }

    .time {
        font-size: 1.2rem;
        font-variant-numeric: tabular-nums;
    }

    .playback-rate {
        margin-left: auto;
    }

    .play-button:not(:global([data-paused])) .play-icon,
    .play-button:global([data-ended]) .play-icon,
    .play-button:global([data-paused]) .pause-icon,
    .play-button:not(:global([data-ended])) .restart-icon,
    .fullscreen-button:global([data-fullscreen]) .fullscreen-enter-icon,
    .fullscreen-button:not(:global([data-fullscreen])) .fullscreen-exit-icon {
        display: none;
    }

    /* ---- Timeline ---- */

    .time-slider {
        position: relative;
        display: flex;
        align-items: center;
        height: 1.6rem;
        cursor: pointer;
        pointer-events: auto;
    }

    .time-slider_track {
        position: relative;
        width: 100%;
        height: 0.4rem;
        border-radius: 9999px;
        background: rgb(255 255 255 / 0.3);
    }

    .time-slider_buffer,
    .time-slider_fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
    }

    .time-slider_buffer {
        width: var(--media-slider-buffer);
        background: rgb(255 255 255 / 0.4);
    }

    .time-slider_fill {
        width: var(--media-slider-fill);
        background: var(--accent-color);
    }

    .time-slider_thumb {
        position: absolute;
        left: var(--media-slider-fill);
        width: 1.2rem;
        height: 1.2rem;
        border-radius: 50%;
        background: white;
        translate: -50% 0;
    }

    /* ---- Buffering ---- */

    .buffering {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .buffering:global([data-visible]) {
        display: flex;
    }

    .buffering_icon {
        display: flex;
        width: 3.6rem;
        height: 3.6rem;
        animation: spin 0.8s linear infinite;
    }

    .buffering_icon :global(svg) {
        width: 100%;
        height: 100%;
    }

    @keyframes spin {
        to {
            rotate: 360deg;
        }
    }

    /* ---- Corner actions ---- */

    .actions {
        --action-margin: 0.4rem;
        position: absolute;
        top: var(--action-margin);
        /* Above the error overlay (z-index 100), so actions stay usable on a missing video. */
        z-index: 101;
        display: flex;
        gap: var(--action-margin);
        transition: opacity 0.2s ease-in-out;
    }

    .actions.top-left {
        left: var(--action-margin);
    }

    .actions.top-right {
        right: var(--action-margin);
        flex-direction: row-reverse;
    }

    @media (pointer: fine) {
        .actions {
            opacity: 0;
        }

        .video-player:hover > .actions,
        .actions:focus-within {
            opacity: 1;
        }
    }
</style>
