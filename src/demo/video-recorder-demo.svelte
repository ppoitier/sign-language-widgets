<script>
    import MediaCard from '../lib/components/media/media-card.svelte'
    import VideoRecorder from '../lib/components/media/video-recorder.svelte'

    /** @type {'idle' | 'countdown' | 'recording' | 'recorded'} */
    let status = $state('idle')
    /** @type {Blob | undefined} */
    let recording = $state()
</script>

<div class="demo">
    <MediaCard highlighted={status === 'recording'}>
        {#snippet media()}
            <VideoRecorder bind:status
                           recording_constraints={{ frameRate: 25 }}
                           on_recorded={blob => recording = blob}
                           on_error={error => console.error(error)} />
        {/snippet}
        <p>Étape : {status} (enregistrement à 15 i/s)</p>
        {#if recording}
            <p>Vidéo : {recording.type}, {Math.round(recording.size / 1024)} Ko</p>
        {/if}
    </MediaCard>
</div>

<style>
    .demo {
        padding: 2rem;
    }
</style>
