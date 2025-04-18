<script>
    import {onMount} from 'svelte'

    import 'video.js/dist/video-js.css'
    import videojs from 'video.js'

    import VideoOverlay from './video-overlay.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'
    import NotFoundIcon from '../icons/not-found-icon.svelte'

    /**
     * @typedef {Object} VideoProps
     * @property {string} url - The URL of the video.
     * @property {string} mime_type - MIME type of the video.
     * @property {boolean} [fluid=false] - If true, fill the parent container.
     * @property {boolean} [autoplay=true] - If true, play the video when loading.
     * @property {boolean} [loop=true] - If true, loop the playback of the video.
     */

    /** @type{VideoProps} */
    let {url, mime_type, fluid=false, autoplay=true, loop=true} = $props()

    /** @type {HTMLVideoElement} */
    let video_elem
    let video_player
    /** @type {string} */
    let media_state = $state('loading')

    onMount(() => {
        if (!video_elem) {
            throw new Error('Missing video element.')
        }

        video_player = videojs(video_elem, {
            preload: 'metadata',
            autoplay: autoplay,
            loop: loop,
            controls: true,
            playbackRates: [0.25, 0.5, 1, 2],
            fluid: false,
            fill: true,
            errorDisplay: false,
            enableSmoothSeeking: true,
            controlBar: {
                volumePanel: false,
            },
        }, function () {
            media_state = 'ok'
        })
        video_player.on('error', () => {
            media_state = 'error'
            return false
        })
    })
</script>

<div class="video-container" class:fluid>
    <video src={url} class="video-js vjs-fill" muted playsinline preload="metadata" controls
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
        max-width: var(--card-max-width);
        min-width: var(--card-min-width);
        min-height: var(--video-min-height);
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

    .video-js :global(.vjs-control-bar) {
        /* Hide the control bar by default */
        opacity: 0;
        visibility: hidden;

        /* Keep the smooth transition effect */
        transition: visibility 0.1s, opacity 0.1s;
    }

    .video-js:hover :global(.vjs-control-bar) {
        opacity: 1;
        visibility: visible;
    }
</style>
