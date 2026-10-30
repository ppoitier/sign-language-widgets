<script>
    import MediaCard from '../lib/components/media/media-card.svelte'
    import VideoPlayer from '../lib/components/media/video-player.svelte'
    import ModelLoadingOverlay from '../lib/components/media/model-loading-overlay.svelte'
    import { start_holistic_landmarker } from '../lib/services/holistic-landmarker.service.js'
    import { draw_holistic_landmarks } from './draw-holistic-landmarks.js'

    const VIDEO_URL = `${import.meta.env.BASE_URL}continuous-sample/CLSFBI0110A_S002_B.mp4`

    /** @type {HTMLVideoElement | undefined} */
    let video_element = $state()
    /** @type {HTMLCanvasElement | undefined} */
    let canvas = $state()
    let current_time = $state(0)

    /** @type {'loading' | 'ready' | 'error'} */
    let status = $state('loading')
    /** @type {import('../lib/services/holistic-landmarker.service.js').ModelLoading | undefined} */
    let loading = $state()
    /** @type {'GPU' | 'CPU' | undefined} */
    let delegate = $state()
    let error_message = $state('')

    let extracted = $state(0)
    let pending = $state(0)
    let inference_ms = $state(0)
    /** Video time of the last processed frame, in seconds. */
    let last_frame_time = $state(0)
    let lag = $derived(Math.max(0, current_time - last_frame_time))

    // Every frame is queued: the video waits for the model, then plays while the frames are extracted.
    $effect(() => {
        if (!video_element) return
        const video = video_element
        status = 'loading'
        loading = undefined
        extracted = 0
        const landmarking = start_holistic_landmarker(video, {
            every_frame: true,
            on_loading: progress => loading = progress,
            on_result: (result, info) => {
                extracted++
                pending = info.pending
                inference_ms = info.inference_ms
                last_frame_time = info.frame_time
                // Results lag behind the playback when the model is slower than the video.
                if (canvas) draw_holistic_landmarks(canvas, video, result)
            },
            on_error: error => console.error(error),
        })
        landmarking.ready
            .then(info => {
                status = 'ready'
                delegate = info.delegate
                video.currentTime = 0
                video.play().catch(error => console.error(error))
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
            <VideoPlayer src={VIDEO_URL} autoplay={false} loop={false} bind:video_element bind:current_time>
                <canvas bind:this={canvas}></canvas>
                {#if status === 'loading'}
                    <ModelLoadingOverlay {loading} />
                {/if}
            </VideoPlayer>
        {/snippet}
        {#if status === 'ready'}
            <p>Modèle prêt ({delegate}) — inférence : {Math.round(inference_ms)} ms</p>
            <p>Images extraites : {extracted} — en attente : {pending} — retard : {lag.toFixed(1)} s</p>
        {:else if status === 'error'}
            <p>Erreur de chargement du modèle : {error_message}</p>
        {:else}
            <p>Chargement du modèle...</p>
        {/if}
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
