<script>
    import MediaCard from '../lib/components/media/media-card.svelte'
    import WebcamPreview from '../lib/components/media/webcam-preview.svelte'
    import ModelLoadingOverlay from '../lib/components/media/model-loading-overlay.svelte'
    import { start_holistic_landmarker } from '../lib/services/holistic-landmarker.service.js'
    import { draw_holistic_landmarks } from './draw-holistic-landmarks.js'

    /** @type {HTMLVideoElement | undefined} */
    let video_element = $state()
    /** @type {HTMLCanvasElement | undefined} */
    let canvas = $state()
    /** @type {MediaStream | null} */
    let stream = $state(null)

    /** @type {'loading' | 'ready' | 'error'} */
    let status = $state('loading')
    /** @type {import('../lib/services/holistic-landmarker.service.js').ModelLoading | undefined} */
    let loading = $state()
    /** @type {'GPU' | 'CPU' | undefined} */
    let delegate = $state()
    let inference_ms = $state(0)
    let error_message = $state('')

    // Load the model once the video exists, release it on destroy.
    $effect(() => {
        if (!video_element) return
        const video = video_element
        status = 'loading'
        loading = undefined
        const landmarking = start_holistic_landmarker(video, {
            on_loading: progress => loading = progress,
            on_result: (result, info) => {
                inference_ms = info.inference_ms
                if (canvas) draw_holistic_landmarks(canvas, video, result)
            },
            on_error: error => console.error(error),
        })
        landmarking.ready
            .then(info => {
                status = 'ready'
                delegate = info.delegate
            })
            .catch(error => {
                console.error(error)
                status = 'error'
                error_message = error instanceof Error ? error.message : String(error)
            })
        return () => landmarking.stop()
    })
</script>

<div class="demo">
    <MediaCard>
        {#snippet media()}
            <WebcamPreview bind:video_element bind:stream>
                <canvas bind:this={canvas}></canvas>
                {#snippet overlay()}
                    <!-- The model loads in parallel, but its overlay waits for the webcam's own one to go. -->
                    {#if stream && status === 'loading'}
                        <ModelLoadingOverlay {loading} />
                    {/if}
                {/snippet}
            </WebcamPreview>
        {/snippet}
        <p>
            {#if status === 'loading'}
                Chargement du modèle...
            {:else if status === 'ready'}
                Modèle prêt ({delegate}) — inférence : {Math.round(inference_ms)} ms
            {:else}
                Erreur de chargement du modèle : {error_message}
            {/if}
        </p>
    </MediaCard>
</div>

<style>
    .demo {
        padding: 2rem;
    }

    /* Letterboxed like the video, so the landmarks stay aligned with the image. */
    canvas {
        object-fit: contain;
    }
</style>
