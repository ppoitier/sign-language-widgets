<!--
@component
Dark full-size layer displayed over a positioned parent (e.g. a video) with a centered icon and/or content.
Renders nothing visible when neither snippet is given.

```svelte
<VideoOverlay>
    {#snippet icon()}<LoadingIcon />{/snippet}
    {#snippet content()}<h3>Chargement...</h3>{/snippet}
</VideoOverlay>
```
-->

<script>
    /**
     * @import { Snippet } from 'svelte'
     * @typedef {Object} Props
     * @property {Snippet} [icon] - Optional snippet to render an icon in the overlay.
     * @property {Snippet} [content] - Optional snippet with HTML content.
     */

    /** @type {Props} */
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
        background-color: rgba(0, 0, 0, 0.7);
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

    /* The message (e.g. an `<h3>`) is centered: no margin of its own, whatever the app's reset. */
    .video-overlay_content > :global(*) {
        margin: 0;
    }

    .video-overlay_icon {
        font-size: 5rem;
        color: white;
    }
</style>