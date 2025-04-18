<script>
    import VideoOverlay from './video-overlay.svelte'
    import NotFoundIcon from '../icons/not-found-icon.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'

    import {onMount} from 'svelte'
    import {error_store} from '../../stores/error-store.js'

    /**
     * @import { Snippet } from 'svelte'
     * @typedef {Object} WebcamProps
     * @property {boolean} [fluid=false] - If true, fill the parent container.
     * @property {Snippet} [overlay_icon] - Optional snippet to render an icon in the webcam overlay.
     * @property {Snippet} [overlay_content] - Optional snippet with HTML content in the webcam overlay.
     * @property {MediaStream | null} [stream=null] - Bindable prop for the webcam's MediaStream. The component assigns
     * the active stream to this prop once loaded. The parent component should use `bind:stream`.
     */

    /** @type {WebcamProps} */
    let {fluid = false, overlay_icon, overlay_content, stream = $bindable(null)} = $props()
    /** @type {HTMLVideoElement} */
    let video_elem
    /** @type {string} */
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

    function stop_webcam_stream() {
        if (!stream) {
            return
        }
        stream.getTracks().forEach(track => track.stop())
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
                stop_webcam_stream()
                media_state = 'error'
                error_store.set({code: 2, message: 'Unable to load webcam.'})
            })
        return () => {
            stop_webcam_stream()
        }
    })

</script>

<div class="video-container" class:fluid>
    <video class="video-js vjs-fill" muted playsinline preload="metadata"
           bind:this={video_elem}></video>

    {#if media_state === 'loading'}
        <VideoOverlay>
            {#snippet icon()}
                <LoadingIcon/>
            {/snippet}
            {#snippet content()}
                <h3>Chargement de la webcam...</h3>
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
    {:else}
        {#if overlay_icon || overlay_content}
            <VideoOverlay>
                {#snippet icon()}
                    {@render overlay_icon?.()}
                {/snippet}
                {#snippet content()}
                    {@render overlay_content?.()}
                {/snippet}
            </VideoOverlay>
        {/if}
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

    .video-container.fluid {
        max-width: 100%;
        min-width: 100%;
        max-height: 100%;
        min-height: 100%;
    }

    .video-container video {
        object-fit: contain;
        object-position: center;
        width: 100%;
        height: 100%;
    }
</style>