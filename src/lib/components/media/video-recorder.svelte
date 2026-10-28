<!--
@component
Records a short video from the webcam, in steps (`status`):
`idle` (start button) → `countdown` → `recording` (stops by itself after `max_duration`, or with the stop button)
→ `recorded` (playback of the recording, with a restart button in the top-right corner).
The video is given to `on_recorded` as a `Blob` (MP4 when the browser can record it, WebM otherwise).
Set `status` back to `'idle'` to record again; leaving the `recording` step early discards the video.
If the recording fails, a message is shown, `status` goes back to `'idle'` and `on_error` is called
(it is also called when the webcam cannot be loaded).

```svelte
<VideoRecorder bind:status on_recorded={(blob) => upload(blob)} />
```

Camera constraints apply to the preview and the recording; recording constraints to the recorded video only:
```svelte
<VideoRecorder constraints={{ video: { width: 1280, height: 720 } }} recording_constraints={{ frameRate: 15 }} />
```
-->

<script>
    import { untrack } from 'svelte'
    import WebcamPreview from './webcam-preview.svelte'
    import VideoPlayer from './video-player.svelte'
    import VideoAction from './video-action.svelte'
    import { start_recording } from '../../services/recording.service.js'

    /**
     * @typedef {Object} Props
     * @property {'idle' | 'countdown' | 'recording' | 'recorded'} [status='idle'] - Bindable. Current step of the recording.
     * @property {(blob: Blob) => void} [on_recorded] - Called with the video once it is recorded.
     * @property {(error: unknown) => void} [on_error] - Called when the webcam cannot be loaded or the recording fails.
     * @property {number} [countdown_duration=3] - Countdown before recording, in seconds.
     * @property {number} [max_duration=5] - Maximum length of the recording, in seconds.
     * @property {MediaStreamConstraints | undefined} [constraints] - Camera constraints given to `getUserMedia` (see `WebcamPreview`): they apply to the preview and the recording.
     * @property {MediaTrackConstraints | undefined} [recording_constraints] - Constraints of the recorded video only, e.g. `{ frameRate: 15 }`: the preview is not affected. They can only lower what the camera delivers.
     * @property {number} [bit_rate=1_500_000] - Targeted video bitrate, in bits per second.
     */

    /** @type {Props} */
    let {
        status = $bindable('idle'),
        on_recorded,
        on_error,
        countdown_duration = 3,
        max_duration = 5,
        constraints,
        recording_constraints,
        bit_rate = 1_500_000,
    } = $props()

    /** @type {HTMLDivElement | undefined} */
    let container = $state()
    /** @type {MediaStream | null} */
    let stream = $state(null)
    let remaining_time = $state(0)
    let error_message = $state('')
    /** @type {import('../../services/recording.service.js').Recording | undefined} */
    let recording
    /** @type {string | undefined} */
    let video_url = $state()
    /** Measured length of the recording, in seconds. */
    let video_duration = $state(0)

    function start() {
        error_message = ''
        status = countdown_duration > 0 ? 'countdown' : 'recording'
    }

    /**
     * @param {unknown} error - Error raised while recording.
     * @returns {string} Message shown to the user.
     */
    function get_error_message(error) {
        const name = error instanceof DOMException ? error.name : ''
        switch (name) {
            case 'NotSupportedError':
                return "Ce navigateur ne permet pas d'enregistrer la vidéo."
            case 'OverconstrainedError':
                return "La webcam ne permet pas d'enregistrer avec ces réglages."
            default:
                return "L'enregistrement a échoué."
        }
    }

    $effect(() => {
        if (status !== 'countdown') return
        remaining_time = countdown_duration
        const interval = setInterval(() => {
            remaining_time -= 1
            if (remaining_time <= 0) status = 'recording'
        }, 1000)
        return () => clearInterval(interval)
    })

    // Records during the `recording` step. Leaving it (or destroying the component) before the recording stops
    // discards the video.
    $effect(() => {
        if (status !== 'recording') return

        let cancelled = false

        async function record() {
            if (!stream) throw new Error('Webcam stream not available.')
            const new_recording = await start_recording(stream, {
                max_duration,
                video_constraints: recording_constraints,
                bit_rate,
            })
            if (cancelled) {
                new_recording.stop()
                return
            }
            recording = new_recording

            const { blob, duration } = await new_recording.done
            if (cancelled) return
            video_url = URL.createObjectURL(blob)
            video_duration = duration
            status = 'recorded'
            on_recorded?.(blob)
        }

        // Untracked: only `status` drives this effect, changing other props doesn't restart a recording.
        untrack(record).catch(error => {
            if (cancelled) return
            error_message = get_error_message(error)
            status = 'idle'
            on_error?.(error)
        })

        return () => {
            cancelled = true
            recording?.stop()
            recording = undefined
        }
    })

    // Release the previous recording when a new one replaces it, or on destroy.
    $effect(() => {
        const url = video_url
        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    })
</script>

<!-- The webcam and the player are swapped inside this container: putting it in fullscreen (instead of them)
     keeps the fullscreen from the recording to the playback, and back. -->
<div class="video-recorder" bind:this={container}>
    {#if status === 'recorded' && video_url}
        <!-- Recorded WebM files have no duration (Chrome reports Infinity): give the measured one. -->
        <VideoPlayer src={video_url} end_time={video_duration} fullscreen_element={container}>
            {#snippet video_actions_right()}
                <VideoAction onclick={() => status = 'idle'}>Recommencer</VideoAction>
            {/snippet}
        </VideoPlayer>
    {:else}
        <WebcamPreview bind:stream {constraints} {on_error} fullscreen_element={container}>
            {#snippet overlay()}
                {#if status === 'idle' && stream}
                    <div class="center backdrop">
                        {#if error_message}
                            <p class="error" role="alert">{error_message}</p>
                        {/if}
                        <VideoAction onclick={start}>Commencer l'enregistrement</VideoAction>
                        <p>Vous aurez {max_duration} secondes pour enregistrer votre signe.</p>
                    </div>
                {:else if status === 'countdown'}
                    <div class="center">
                        <span class="countdown">{remaining_time}</span>
                    </div>
                {:else if status === 'recording'}
                    <span class="recording-indicator">Enregistrement</span>
                    <div class="stop-button">
                        <VideoAction onclick={() => recording?.stop()}>Arrêter</VideoAction>
                    </div>
                    <div class="progress" style:animation-duration="{max_duration}s"></div>
                {/if}
            {/snippet}
        </WebcamPreview>
    {/if}
</div>

<style>
    /* In fullscreen, center the 16:9 media and keep it fully visible on wider screens. */
    .video-recorder:fullscreen {
        display: grid;
        place-items: center;
        background: black;
    }

    .video-recorder:fullscreen > :global(*) {
        width: min(100%, 100dvh * 16 / 9);
    }

    .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        text-align: center;
        font-size: 1.4rem;
        text-shadow: 0.1rem 0.1rem 0.2rem black;
    }

    .backdrop {
        background-color: rgb(0 0 0 / 0.4);
    }

    .error {
        font-weight: 600;
        color: #ff8787;
    }

    .countdown {
        font-size: 8rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }

    .recording-indicator {
        position: absolute;
        top: 0.8rem;
        left: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 1.4rem;
        text-shadow: 0.1rem 0.1rem 0.2rem black;
    }

    .recording-indicator::before {
        content: '';
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background: red;
    }

    .stop-button {
        position: absolute;
        bottom: 4rem;
        left: 50%;
        translate: -50% 0;
    }

    .progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 0.4rem;
        background-color: var(--progress-bar-color, red);
        animation: progress linear forwards;
    }

    @keyframes progress {
        from {
            width: 0;
        }
        to {
            width: 100%;
        }
    }
</style>
