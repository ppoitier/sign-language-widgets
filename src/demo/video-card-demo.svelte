<script>
    import VideoCard from '../lib/components/media/video-card.svelte'

    const video_url = `${import.meta.env.BASE_URL}continuous-sample/CLSFBI0110A_S002_B.mp4`

    let highlighted = $state(false)
    let current_time = $state(0)
</script>

<div class="demo">
    <VideoCard src={video_url} {highlighted} bind:current_time>
        {#snippet video_actions_right()}
            <button onclick={() => highlighted = !highlighted}>Surligner</button>
        {/snippet}
        <p>Position : {current_time.toFixed(2)} s</p>
        <button onclick={() => current_time = 10}>Aller à 10 s</button>
    </VideoCard>

    <VideoCard src={`${import.meta.env.BASE_URL}missing.mp4`}>
        {#snippet error()}
            <h3>Fichier introuvable</h3>
        {/snippet}
        <p>Carte avec une vidéo manquante</p>
    </VideoCard>
</div>

<style>
    .demo {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        padding: 2rem;
    }
</style>
