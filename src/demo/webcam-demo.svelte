<script>
    import MediaCard from '../lib/components/media/media-card.svelte'
    import WebcamPreview from '../lib/components/media/webcam-preview.svelte'
    import VideoAction from '../lib/components/media/video-action.svelte'

    /** @type {MediaStream | null} */
    let stream = $state(null)
    /** @type {HTMLVideoElement | undefined} */
    let video_element = $state()
    let mirrored = $state(true)

    let settings = $derived(stream?.getVideoTracks()[0]?.getSettings())
</script>

<div class="demo">
    <MediaCard>
        {#snippet media()}
            <WebcamPreview bind:stream bind:video_element {mirrored}>
                {#snippet video_actions_right()}
                    <VideoAction onclick={() => mirrored = !mirrored}>Miroir</VideoAction>
                {/snippet}
            </WebcamPreview>
        {/snippet}
        <p>
            {#if settings}
                Flux : {settings.width} × {settings.height} à {settings.frameRate} i/s
            {:else}
                Pas de flux
            {/if}
        </p>
    </MediaCard>
</div>

<style>
    .demo {
        padding: 2rem;
    }
</style>
