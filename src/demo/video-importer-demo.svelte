<script>
    import MediaCard from '../lib/components/media/media-card.svelte'
    import VideoImporter from '../lib/components/media/video-importer.svelte'

    /** @type {File | undefined} */
    let file = $state()
</script>

<div class="demo">
    <MediaCard>
        {#snippet media()}
            <VideoImporter bind:file />
        {/snippet}
        {#if file}
            <p>Vidéo : {file.name} ({file.type}, {Math.round(file.size / 1024)} Ko)</p>
        {:else}
            <p>Aucune vidéo</p>
        {/if}
    </MediaCard>
</div>

<style>
    .demo {
        padding: 2rem;
    }
</style>
