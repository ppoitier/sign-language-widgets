<!--
@component
Live webcam preview in a 16:9 container (mirrored by default, like a mirror), with the elapsed time
since the stream started and a fullscreen button.
Asks for the camera on mount and releases it on destroy, or when `constraints` change.
Shows a loading overlay, then an error overlay if the camera is unavailable (permission denied, no camera...).

The stream and the video element are exposed for recording (`MediaRecorder`) or processing (e.g. MediaPipe).
Children are rendered over the video and mirrored with it, so a canvas drawn in video coordinates
(e.g. landmarks) stays aligned with the image. The `overlay` snippet is rendered over the video too, but not
mirrored (for text or buttons); unlike content around the component, it stays visible in fullscreen.

```svelte
<WebcamPreview bind:stream bind:video_element>
    {#snippet video_actions_right()}
        <IconButton onclick={start_recording}><AddVideoIcon /></IconButton>
    {/snippet}
    <canvas bind:this={landmarks_canvas}></canvas>
</WebcamPreview>
```
-->

<script>
    import '@videojs/html/icons/element/default'

    import VideoOverlay from './video-overlay.svelte'
    import { format_time } from './format-time.js'
    import { get_fullscreen_element, toggle_fullscreen } from './fullscreen.js'
    import NotFoundIcon from '../icons/not-found-icon.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'

    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {MediaStreamConstraints} [constraints={ video: { facingMode: 'user' }, audio: false }] - Constraints given to `getUserMedia` (camera, resolution, audio...).
     * @property {boolean} [mirrored=true] - If true, the preview (and the children) are flipped horizontally. The stream itself is not.
     * @property {MediaStream | null} [stream=null] - Bindable. The webcam stream once available, `null` otherwise.
     * @property {HTMLVideoElement | undefined} [video_element] - Bindable. The `<video>` element showing the stream.
     * @property {(error: unknown) => void} [on_error] - Called when the webcam cannot be loaded.
     * @property {Snippet | undefined} [video_actions_left] - Actions added to the top-left corner of the video.
     * @property {Snippet | undefined} [video_actions_right] - Actions added to the top-right corner of the video.
     * @property {Snippet | undefined} [children] - Content rendered over the video (e.g. a canvas), mirrored with it.
     * @property {Snippet | undefined} [overlay] - Content rendered over the video, not mirrored (e.g. text or buttons).
     * @property {HTMLElement | undefined} [fullscreen_element] - Element put in fullscreen by the fullscreen button. Defaults to the preview itself; give a parent to keep fullscreen when the preview is swapped with something else.
     */

    /** @type {Props} */
    let {
        constraints = { video: { facingMode: 'user' }, audio: false },
        mirrored = true,
        stream = $bindable(null),
        video_element = $bindable(),
        on_error,
        video_actions_left,
        video_actions_right,
        children,
        overlay,
        fullscreen_element,
    } = $props()

    /** @type {'loading' | 'ready' | 'error'} */
    let status = $state('loading')
    let error_message = $state('')

    /** Seconds since the stream started (live video time). */
    let elapsed_time = $state(0)

    /** @type {HTMLDivElement | undefined} */
    let container = $state()
    let fullscreen_target = $derived(fullscreen_element ?? container)
    let is_fullscreen = $derived(fullscreen_target !== undefined && get_fullscreen_element() === fullscreen_target)

    /**
     * @param {unknown} error - Error thrown by `getUserMedia`.
     * @returns {string} Message shown to the user.
     */
    function get_error_message(error) {
        const name = error instanceof DOMException ? error.name : ''
        switch (name) {
            case 'NotAllowedError':
                return "L'accès à la webcam a été refusé."
            case 'NotFoundError':
            case 'OverconstrainedError':
                return 'Aucune webcam compatible trouvée.'
            case 'NotReadableError':
                return 'La webcam est déjà utilisée par une autre application.'
            default:
                return 'Webcam non disponible !'
        }
    }

    // Opening the camera is a side effect: request it, and release it on cleanup.
    $effect(() => {
        const video = video_element
        if (!video) return

        let cancelled = false
        /** @type {MediaStream | null} */
        let opened_stream = null
        status = 'loading'

        navigator.mediaDevices.getUserMedia(constraints)
            .then(new_stream => {
                if (cancelled) {
                    // Destroyed (or constraints changed) while waiting for the permission.
                    new_stream.getTracks().forEach(track => track.stop())
                    return
                }
                opened_stream = new_stream
                video.srcObject = new_stream
                stream = new_stream
            })
            .catch(error => {
                if (cancelled) return
                status = 'error'
                error_message = get_error_message(error)
                on_error?.(error)
            })

        return () => {
            cancelled = true
            opened_stream?.getTracks().forEach(track => track.stop())
            video.srcObject = null
            stream = null
        }
    })
</script>

<div class="webcam-preview" bind:this={container}>
    <div class={['webcam-preview_view', { mirrored }]}>
        <video bind:this={video_element}
               bind:currentTime={elapsed_time}
               autoplay muted playsinline
               onloadeddata={() => status = 'ready'}></video>
        {#if children}
            <div class="webcam-preview_layer">
                {@render children()}
            </div>
        {/if}
    </div>

    {#if overlay}
        <div class="webcam-preview_overlay">
            {@render overlay()}
        </div>
    {/if}

    {#if status === 'ready'}
        <div class="controls">
            <span class="time">{format_time(elapsed_time)}</span>
            <button type="button"
                    class="control fullscreen-button"
                    aria-label={is_fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                    onclick={() => fullscreen_target && toggle_fullscreen(fullscreen_target)}>
                <media-icon name={is_fullscreen ? 'fullscreen-exit' : 'fullscreen-enter'}></media-icon>
            </button>
        </div>
    {/if}

    {#if status === 'loading'}
        <VideoOverlay>
            {#snippet icon()}
                <LoadingIcon />
            {/snippet}
            {#snippet content()}
                <h3>Chargement de la webcam...</h3>
            {/snippet}
        </VideoOverlay>
    {:else if status === 'error'}
        <VideoOverlay>
            {#snippet icon()}
                <NotFoundIcon />
            {/snippet}
            {#snippet content()}
                <h3>{error_message}</h3>
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
</div>

<style>
    .webcam-preview {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background-color: black;
        color: white;
    }

    .webcam-preview_view {
        position: absolute;
        inset: 0;
    }

    .webcam-preview_view.mirrored {
        transform: scaleX(-1);
    }

    video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .webcam-preview_layer {
        position: absolute;
        inset: 0;
    }

    /* Let a canvas (or any child) fill the layer by default. */
    .webcam-preview_layer > :global(*) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }

    .webcam-preview_overlay {
        position: absolute;
        inset: 0;
    }

    /* ---- Controls (same look as VideoPlayer) ---- */

    .controls {
        position: absolute;
        inset: auto 0 0;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0 0.8rem 0.4rem;
        /* No backdrop: keep the controls readable over bright frames. */
        filter: drop-shadow(0 0 0.2rem rgb(0 0 0 / 0.8));
        transition: opacity 0.2s ease-in-out;
    }

    .time {
        font-size: 1.2rem;
        font-variant-numeric: tabular-nums;
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
        cursor: pointer;
    }

    .control:focus-visible {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }

    .fullscreen-button {
        margin-left: auto;
    }

    /* ---- Corner actions (same as VideoPlayer) ---- */

    .actions {
        --action-margin: 0.4rem;
        position: absolute;
        top: var(--action-margin);
        /* Above the overlays (z-index 100), so actions stay usable while loading or on error. */
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
        .actions,
        .controls {
            opacity: 0;
        }

        .webcam-preview:hover > .actions,
        .webcam-preview:hover > .controls,
        .actions:focus-within,
        .controls:focus-within {
            opacity: 1;
        }
    }
</style>
