<script>
    import SignCard from "./sign-card.svelte"

    const entries = [1, 2, 3, 4, 5, 6, 7, 8]
</script>

<div>
    {#each entries as entry}
        <SignCard />
    {/each}
</div>

<style>
    div {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width), 1fr));
        justify-content: space-evenly;
        align-items: start;
        gap: 2rem;
        min-height: 24rem;
    }
</style>
