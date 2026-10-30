<!--
@component
Overlay shown over a video while a model (e.g. the holistic landmarker) loads: a message and a progress bar.
The bar follows the download, then becomes indeterminate while the model is prepared (or when the size is unknown).

```svelte
<WebcamPreview bind:video_element>
    {#snippet overlay()}
        {#if status === 'loading'}
            <ModelLoadingOverlay {loading} />
        {/if}
    {/snippet}
</WebcamPreview>
```
-->

<script>
    import VideoOverlay from './video-overlay.svelte'
    import LoadingIcon from '../icons/loading-icon.svelte'

    /**
     * @typedef {Object} Props
     * @property {import('../../services/holistic-landmarker.service.js').ModelLoading | undefined} [loading] - Loading progress, `undefined` before it starts.
     */

    /** @type {Props} */
    let { loading } = $props()

    let downloading = $derived(loading?.step === 'downloading' && loading.total > 0)
    let percent = $derived(downloading && loading ? Math.round(loading.loaded / loading.total * 100) : 0)
</script>

<VideoOverlay>
    {#snippet icon()}
        <LoadingIcon />
    {/snippet}
    {#snippet content()}
        <div class="model-loading">
            <h3>
                {#if loading?.step === 'initializing'}
                    Préparation du modèle...
                {:else if downloading}
                    Chargement du modèle : {percent} %
                {:else}
                    Chargement du modèle...
                {/if}
            </h3>
            <!-- Without `value`, the bar is indeterminate. -->
            {#if downloading}
                <progress max="100" value={percent} aria-label="Chargement du modèle"></progress>
            {:else}
                <progress aria-label="Chargement du modèle"></progress>
            {/if}
        </div>
    {/snippet}
</VideoOverlay>

<style>
    .model-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    h3 {
        margin: 0;
    }

    progress {
        width: 24rem;
        max-width: 80%;
        height: 0.6rem;
        accent-color: white;
    }
</style>
