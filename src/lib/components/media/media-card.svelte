<!--
@component
Card with a media on top (e.g. `VideoPlayer` or `WebcamPreview`) and free content below.

```svelte
<MediaCard highlighted={is_recording}>
    {#snippet media()}
        <WebcamPreview bind:stream />
    {/snippet}
    <p>Enregistrement...</p>
</MediaCard>
```
-->

<script>
    /**
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} Props
     * @property {Snippet} media - Media shown at the top of the card.
     * @property {boolean} [fluid=false] - If true, the card doesn't have a maximum width anymore.
     * @property {boolean} [highlighted=false] - If true, the card is outlined.
     * @property {Snippet | undefined} [children] - Content of the card, below the media.
     */

    /** @type {Props} */
    let { media, fluid = false, highlighted = false, children } = $props()
</script>

<div class={['media-card', { fluid, highlighted }]}>
    {@render media()}

    {#if children}
        <div class="media-card_content">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .media-card {
        width: 100%;
        min-width: var(--card-min-width);
        max-width: var(--card-max-width);
        overflow: hidden;
        border-radius: 0.8rem;
        border: 0.1rem solid var(--card-border);
        background-color: var(--card-background);
    }

    .media-card.fluid {
        max-width: 100%;
    }

    .media-card.highlighted {
        outline: 0.3rem solid red;
    }

    .media-card_content {
        padding: 0.5rem;
        font-size: 1.2rem;
    }
</style>
