<script>
    /**
     * @import { Snippet } from 'svelte'
     * @typedef {Object} OverlayProps
     * @property {Snippet} [icon] - Optional snippet to render an icon in the overlay.
     * @property {Snippet} [content] - Optional snippet with HTML content.
     */

    /**
     * @type {OverlayProps}
     */
    let {icon, content} = $props()
</script>

<div class="video-overlay">
    {#if icon || content}
        <div class="video-overlay_content">
            {#if icon}
                <div class="video-overlay_icon">
                    {@render icon()}
                </div>
            {/if}
            {#if content}
                {@render content()}
            {/if}
        </div>
    {/if}
</div>

<style>
    .video-overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        pointer-events: none;
        user-select: none;
        z-index: 100;
    }

    .video-overlay:empty {
        display: none;
    }

    .video-overlay_content {
        text-align: center;
        color: white;
    }

    .video-overlay_icon {
        font-size: 5rem;
        color: white;
    }
</style>