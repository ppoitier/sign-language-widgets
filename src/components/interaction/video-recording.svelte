<script>
    import Webcam from '../media/webcam.svelte'
    import Video from '../media/video.svelte'
    import VideoProgressBar from '../media/video-progress-bar.svelte'
    import Timer from './timer.svelte'

    import {Recorder} from '../../services/recording.service.js'
    import {ERROR_CODES, error_store} from '../../stores/error-store.js'

    /**
     * Callback function triggered when recording is finished and processed.
     * @callback OnRecordedCallback
     * @param {{url: string, mime_type: string}} recorded_video - Object containing the URL and MIME type of the recorded video blob.
     * @returns {void}
     */

    /**
     * @typedef {Object} SignRecordingProps
     * @property {'waiting' | 'timer' | 'recording' | 'finished'} [current_state='waiting'] - Bindable current state of the recording.
     * @property {OnRecordedCallback} on_recorded - Callback function that is called when a sign is recorded.
     * @property {number} [waiting_duration=3] - Duration (in seconds) of the timer before recording.
     * @property {number} [recording_duration=5] - Duration (in seconds) of the recording.
     */

    /** @type {SignRecordingProps} */
    let {current_state = $bindable('waiting'), waiting_duration = 3, recording_duration = 5, on_recorded} = $props()

    /** @type {MediaStream | null} */
    let webcam_stream = $state(null)
    /**
     * @type {{
     *     url: string,
     *     mime_type: string,
     * } | null}
     */
    let recorded_video = $state(null)

    $effect(() => {
        if (current_state === 'recording') {
            if (webcam_stream === null) {
                error_store.set({
                    code: ERROR_CODES.webcam_error,
                    message: 'Unable to record webcam. Webcam stream is not properly initialized.',
                })
                return
            }
            const recorder = new Recorder({stream: webcam_stream})
            recorder.addEventListener('recorded', (event) => {
                /** @type {Blob} */
                const blob = event.detail.blob
                recorded_video = {
                    url: URL.createObjectURL(blob),
                    mime_type: blob.type,
                }
                on_recorded(recorded_video)
                current_state = 'finished'
            })
            recorder.start()
            return () => {
                recorder.stop()
            }
        }
    })
</script>

{#snippet overlay_content()}
    {#if current_state === 'waiting'}
        <button class="video-recording_start-button" onclick={() => (current_state = 'timer')}>Commencer
            l'enregistrement
        </button>
        <p class="video-recording_info">
            Une fois l'enregistrement commencé, vous aurez {recording_duration} secondes pour enregistrer votre signe.
            Ensuite, vous pourrez soit le valider, soit recommencer, ou même annuler.
        </p>
    {:else if current_state === 'timer'}
        <Timer duration={waiting_duration} onFinished={() => (current_state = 'recording')}/>
    {/if}
{/snippet}

<div class="video-recording">
    {#if current_state !== 'finished'}
        <Webcam fluid={true}
                overlay_content={current_state === 'waiting' || current_state === 'timer' ? overlay_content : undefined}
                bind:stream={webcam_stream}
        />
    {:else if (recorded_video !== null)}
        <Video fluid={true} url={recorded_video.url} mime_type={recorded_video.mime_type}/>
    {/if}
    {#if current_state === 'recording'}
        <VideoProgressBar duration={recording_duration}/>
    {/if}
</div>

<style>
    .video-recording {
        max-width: 100rem;
        aspect-ratio: 16/9;
        position: relative;
    }

    .video-recording_start-button {
        all: unset;
        padding: 1rem .5rem;
        font-size: 1.8rem;
        color: white;
        border: .2rem solid white;
        border-radius: 0.8rem;
        background: transparent;
        transition: background .2s, scale .1s;
        text-shadow: 1px 1px 2px black;
    }

    .video-recording_start-button:focus,
    .video-recording_start-button:hover {
        background: black;
        scale: 1.05;
    }

    .video-recording_start-button:focus-visible {
        outline: .2rem solid red;
    }

    .video-recording_info {
        margin: auto;
        padding-top: 1rem;
        text-align: justify;
        font-size: 1.2rem;
        max-width: 50%;
        text-shadow: 1px 1px 2px black;
    }
</style>

