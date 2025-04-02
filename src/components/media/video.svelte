<script>
    import {onMount} from 'svelte'

    import 'video.js/dist/video-js.css'
    import videojs from 'video.js'

    import VideoOverlay from './video-overlay.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'
    import NotFoundIcon from '../icons/not-found-icon.svelte'

    let {url, mime_type} = $props()

    let video_elem
    let video_player
    let media_state = $state('loading')

    onMount(() => {
        if (!video_elem) {
            throw new Error('Missing video element.')
        }

        video_player = videojs(video_elem, {
            preload: 'metadata',
            autoplay: false,
            loop: false,
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

<div class="video-container">
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
