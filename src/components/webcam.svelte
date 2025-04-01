<script>
    import VideoOverlay from './video-overlay.svelte'
    import NotFoundIcon from './icons/not-found-icon.svelte'
    import LoadingIcon from './icons/loading-icon.svelte'

    import {onMount} from 'svelte'
    import {error_store} from '../stores/error-store.js'

    let video_elem
    let stream
    let media_state = $state('loading')

    /**
     * @return {Promise<MediaStream>}
     */
    async function load_webcam_stream() {
        const media_devices = navigator.mediaDevices
        return await media_devices.getUserMedia({
            video: {
                facingMode: 'user',
            },
            audio: false,
        })
    }

    onMount(() => {
        if (!video_elem) {
            throw new Error('Missing video element.')
        }

        load_webcam_stream()
            .then(loaded_stream => {
                stream = loaded_stream
                video_elem.srcObject = stream
                video_elem.addEventListener('loadedmetadata', () => {
                    media_state = 'ok'
                    video_elem.play()
                })
                video_elem.addEventListener('error', () => {
                    media_state = 'error'
                    error_store.set({code: 1, message: 'Unable to play the webcam video due to unknown error.'})
                })
            })
            .catch(() => {
                media_state = 'error'
                error_store.set({code: 2, message: 'Unable to load webcam.'})
            })
    })

</script>

<div class="video-container">
    <video class="video-js vjs-fill" muted playsinline preload="metadata"
           bind:this={video_elem}></video>

    {#if media_state === 'loading'}
        <VideoOverlay>
            {#snippet icon()}
                <LoadingIcon/>
            {/snippet}
        </VideoOverlay>
    {:else if media_state === 'error'}
        <VideoOverlay>
            {#snippet icon()}
                <NotFoundIcon/>
            {/snippet}
            {#snippet content()}
                <h3>Video non disponible !</h3>
            {/snippet}
        </VideoOverlay>
    {/if}
</div>

<style>
    .video-container {
        position: relative;
        max-width: 48rem;
        min-width: 24rem;
        min-height: 13.5rem;
        aspect-ratio: 16/9;
        width: 100%;
        height: auto;
        background-color: black;
        isolation: isolate;
        z-index: 0;
    }
</style>