<script>
    import CardGrid from '../lib/components/layout/card-grid.svelte'
    import VideoCard from '../lib/components/media/video-card.svelte'

    const video_url = `${import.meta.env.BASE_URL}continuous-sample/CLSFBI0110A_S002_B.mp4`

    const cards = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        title: `Signe ${i + 1}`,
        start_time: i * 5,
        // Some cards have a much longer content: the other cards of their row keep their minimum height.
        description: i % 5 === 0 ? 'Une description bien plus longue que les autres. '.repeat(8) : '',
    }))
</script>

<div class="demo">
    <CardGrid>
        {#each cards as card (card.id)}
            <VideoCard src={video_url} autoplay={false} start_time={card.start_time} end_time={card.start_time + 5}>
                <div class="content">
                    <h3>{card.title}</h3>
                    {#if card.description}
                        <p>{card.description}</p>
                    {/if}
                </div>
            </VideoCard>
        {/each}
    </CardGrid>
</div>

<style>
    .demo {
        padding: 2rem;
    }

    .content {
        min-height: 8rem;
    }
</style>
