<script>
    /**
     * import type { Snippet } from 'svelte'
     *
     * @property {Snippet | undefined} [children] - Represents the content passed into the default slot.
     */
    let {children, location='top-right'} = $props()
</script>

<div class="video-actions {location}">
    {@render children?.()}
</div>


<style>
    .video-actions {
        --action-margin: .4rem;
        position: absolute;
        color: white;
        display: flex;
        gap: var(--action-margin);
    }

    .video-actions.top-right {
        flex-direction: row-reverse;
        top: var(--action-margin);
        right: var(--action-margin);
    }

    .video-actions.top-left {
        flex-direction: row;
        top: var(--action-margin);
        left: var(--action-margin);
    }

    .video-actions:empty {
        display: none;
    }
</style>

