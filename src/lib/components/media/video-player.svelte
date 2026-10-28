<!--
@component
Video.js 10 player (muted) in a 16:9 container, with its own skin: play/pause, timeline, time,
playback speed (0.25x to 2x) and fullscreen. Click the video to play/pause.
Optional actions are overlaid in the top corners; they are shown on hover for fine pointers.
A loading overlay is shown until the video metadata is loaded, then a spinner whenever the playback stalls.
If the video cannot be played (e.g. missing file), an error overlay is shown instead.
Markers (points or ranges, in seconds) can be shown on the timeline; their default color is set with `--marker-color`.

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

Only play from 1 s to 80 s (looping inside that range); the timeline and the time then cover this range only:
```svelte
<VideoPlayer src={video.url} start_time={1} end_time={80} />
```

Markers: a point at 10 s and a red range from 15 s to 20 s:
```svelte
<VideoPlayer src={video.url} markers={[{ start: 10 }, { start: 15, end: 20, color: 'red' }]} />
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
    import '@videojs/html/ui/fullscreen-button'
    import '@videojs/html/ui/buffering-indicator'
    import '@videojs/html/ui/gesture'
    import '@videojs/html/ui/hotkey'
    import '@videojs/html/ui/status-announcer'

    import VideoOverlay from './video-overlay.svelte'
    import { format_time } from './format-time.js'
    import { get_fullscreen_element, toggle_fullscreen } from './fullscreen.js'
    import NotFoundIcon from '../icons/not-found-icon.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'

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
     * @property {import('./video-marker.js').Marker[]} [markers=[]] - Markers shown on the timeline.
     * @property {number} [start_time=0] - Start of the playable range, in seconds.
     * @property {number | undefined} [end_time] - End of the playable range, in seconds. Defaults to the end of the video.
     * @property {HTMLElement | undefined} [fullscreen_element] - Element put in fullscreen by the fullscreen button. Defaults to the player itself; give a parent to keep fullscreen when the player is swapped with something else.
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
        markers = [],
        start_time = 0,
        end_time,
        fullscreen_element,
    } = $props()

    let is_fullscreen = $derived(fullscreen_element !== undefined && get_fullscreen_element() === fullscreen_element)

    /** Duration of the video in seconds (NaN until the metadata is loaded). */
    let duration = $state(NaN)
    /** @type {boolean | undefined} */
    let paused = $state()

    // Seeking can land slightly before the requested time: don't seek again for that.
    const RANGE_TOLERANCE = 0.01

    // Keep the playback inside [start_time, end_time]: this drives the media element, it is not derived state.
    $effect(() => {
        if (current_time < start_time - RANGE_TOLERANCE) {
            current_time = start_time
        } else if (end_time !== undefined && current_time >= end_time) {
            if (loop) {
                current_time = start_time
            } else {
                paused = true
                current_time = end_time
            }
        }
    })

    // Play again from the start of the range once its end was reached.
    function restart_at_range_end() {
        if (end_time !== undefined && current_time >= end_time) {
            current_time = start_time
        }
    }

    // The timeline and the time display only cover the playable range.
    // Video.js' time slider always spans the whole video, hence our own slider.
    let range_end = $derived(end_time === undefined ? duration : Math.min(end_time, duration))
    let range_length = $derived(range_end - start_time)

    /**
     * @param {number} time - Time in seconds.
     * @returns {number} Position on the timeline, in percent.
     */
    function to_percent(time) {
        return Math.min(Math.max((time - start_time) / range_length, 0), 1) * 100
    }

    /**
     * @param {import('./video-marker.js').Marker} marker
     * @returns {boolean} True if the marker is (at least partly) inside the playable range.
     */
    function is_in_range(marker) {
        return marker.start <= range_end && (marker.end ?? marker.start) >= start_time
    }

    /** @type {string | undefined} */
    let failed_src = $state()
    /** @type {string | undefined} */
    let loaded_src = $state()
    // Both reset by themselves when another video is loaded.
    let has_error = $derived(failed_src === src)
    let is_loading = $derived(loaded_src !== src && !has_error)

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
                   bind:duration
                   bind:playbackRate={playback_rate}
                   bind:paused
                   onplay={restart_at_range_end}
                   onloadedmetadata={() => loaded_src = src}
                   onerror={() => failed_src = src}></video>

            <!-- Shown when the playback stalls after the initial loading. -->
            <media-buffering-indicator class="buffering">
                <div class="buffering_icon"><LoadingIcon /></div>
            </media-buffering-indicator>

            <media-controls>
                <media-controls-content class="controls">
                    <div class="time-slider">
                        <div class="time-slider_track">
                            {#if range_length > 0}
                                <div class="time-slider_fill" style:width="{to_percent(current_time)}%"></div>
                                {#each markers.filter(is_in_range) as marker (marker)}
                                    {#if marker.end === undefined}
                                        <div class="marker"
                                             style:left="{to_percent(marker.start)}%"
                                             style:background={marker.color}></div>
                                    {:else}
                                        <div class="marker-range"
                                             style:left="{to_percent(marker.start)}%"
                                             style:background={marker.color}
                                             style:width="{to_percent(marker.end) - to_percent(marker.start)}%"></div>
                                    {/if}
                                {/each}
                            {/if}
                        </div>
                        <input type="range"
                               class="time-slider_input"
                               aria-label="Position de lecture"
                               aria-valuetext={format_time(current_time - start_time)}
                               min={start_time}
                               max={range_length > 0 ? range_end : start_time}
                               step="any"
                               disabled={!(range_length > 0)}
                               bind:value={current_time}>
                    </div>

                    <media-controls-group class="controls_group" aria-label="Contrôles de lecture">
                        <media-play-button class="control play-button">
                            <media-icon name="restart" class="restart-icon"></media-icon>
                            <media-icon name="play" class="play-icon"></media-icon>
                            <media-icon name="pause" class="pause-icon"></media-icon>
                        </media-play-button>

                        <span class="time">
                            {format_time(current_time - start_time)} / {format_time(range_length)}
                        </span>

                        <button type="button"
                                class="control playback-rate"
                                aria-label="Vitesse de lecture {playback_rate}×"
                                onclick={next_playback_rate}>
                            {playback_rate}×
                        </button>

                        {#if fullscreen_element}
                            <button type="button"
                                    class="control"
                                    aria-label={is_fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                                    onclick={() => toggle_fullscreen(fullscreen_element)}>
                                <media-icon name={is_fullscreen ? 'fullscreen-exit' : 'fullscreen-enter'}></media-icon>
                            </button>
                        {:else}
                            <media-fullscreen-button class="control fullscreen-button">
                                <media-icon name="fullscreen-enter" class="fullscreen-enter-icon"></media-icon>
                                <media-icon name="fullscreen-exit" class="fullscreen-exit-icon"></media-icon>
                            </media-fullscreen-button>
                        {/if}
                    </media-controls-group>
                </media-controls-content>
            </media-controls>

            {#if is_loading}
                <VideoOverlay>
                    {#snippet icon()}
                        <LoadingIcon />
                    {/snippet}
                </VideoOverlay>
            {:else if has_error}
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
            {#if !fullscreen_element}
                <media-hotkey keys="f" action="toggleFullscreen"></media-hotkey>
            {/if}
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
        --thumb-size: 1.2rem;
        position: relative;
        display: flex;
        align-items: center;
        height: 1.6rem;
        pointer-events: auto;
    }

    /* Inset by half a thumb: the thumb center of a range input never goes further. */
    .time-slider_track {
        position: relative;
        flex: 1;
        height: 0.4rem;
        margin-inline: calc(var(--thumb-size) / 2);
        border-radius: 9999px;
        background: rgb(255 255 255 / 0.3);
    }

    .time-slider_fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
        background: var(--accent-color);
    }

    /* Transparent native range input on top of the track: only its thumb is visible. */
    .time-slider_input {
        position: absolute;
        inset-inline: 0;
        width: 100%;
        height: var(--thumb-size);
        margin: 0;
        appearance: none;
        background: transparent;
        cursor: pointer;
    }

    .time-slider_input:disabled {
        cursor: default;
    }

    .time-slider_input::-webkit-slider-runnable-track {
        height: var(--thumb-size);
        background: transparent;
    }

    .time-slider_input::-moz-range-track {
        background: transparent;
    }

    .time-slider_input::-webkit-slider-thumb {
        appearance: none;
        width: var(--thumb-size);
        height: var(--thumb-size);
        border: none;
        border-radius: 50%;
        background: white;
    }

    .time-slider_input::-moz-range-thumb {
        width: var(--thumb-size);
        height: var(--thumb-size);
        border: none;
        border-radius: 50%;
        background: white;
    }

    .time-slider_input:focus-visible {
        outline: none;
    }

    .time-slider_input:focus-visible::-webkit-slider-thumb {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }

    .time-slider_input:focus-visible::-moz-range-thumb {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }

    .marker,
    .marker-range {
        position: absolute;
        pointer-events: none;
        background: var(--marker-color, #ffd43b);
    }

    .marker {
        top: -0.3rem;
        bottom: -0.3rem;
        width: 0.3rem;
        border-radius: 0.2rem;
        translate: -50% 0;
    }

    .marker-range {
        top: 0;
        bottom: 0;
        border-radius: inherit;
        opacity: 0.7;
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
        font-size: 5rem;
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
