<script>
    /**
     * import type { Snippet } from 'svelte'
     *
     * @property {Snippet | undefined} [children] - Represents the content passed into the default slot.
     */
    let {children} = $props()
</script>

<div class="video-actions">
    {@render children?.()}
</div>


<style>
    .video-actions {
        position: absolute;
        top: .4rem;
        right: .4rem;
        color: white;
        display: flex;
        flex-direction: row-reverse;
        gap: .4rem;
    }

    .video-actions:empty {
        display: none;
    }
</style>

