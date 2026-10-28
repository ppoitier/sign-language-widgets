<!--
@component
Imports a local video: a 16:9 drop zone where a video can be dropped, or clicked (or focused + Enter) to pick one.
Once chosen, the video is played (see `VideoPlayer`), with buttons in the top-right corner to choose another one
or to remove it (cross).
The file is given to `on_imported`; files that are not videos are refused with a message.
`file` is bindable: set it back to `undefined` to show the drop zone again.

```svelte
<VideoImporter bind:file on_imported={(file) => upload(file)} />
```
-->

<script>
    import VideoPlayer from './video-player.svelte'
    import VideoAction from './video-action.svelte'
    import VideoFileIcon from '../icons/video-file-icon.svelte'
    import CloseIcon from '../icons/close-icon.svelte'

    /**
     * @typedef {Object} Props
     * @property {File | undefined} [file] - Bindable. The imported video, `undefined` until one is chosen.
     * @property {(file: File) => void} [on_imported] - Called with the video once it is chosen.
     */

    /** @type {Props} */
    let { file = $bindable(), on_imported } = $props()

    let is_dragging_over = $state(false)
    let error_message = $state('')

    let video_url = $derived(file ? URL.createObjectURL(file) : undefined)

    // Release the previous video when another one replaces it, or on destroy.
    $effect(() => {
        const url = video_url
        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    })

    /** @param {File | undefined} new_file */
    function import_file(new_file) {
        if (!new_file) return
        if (!new_file.type.startsWith('video/')) {
            error_message = `« ${new_file.name} » n'est pas une vidéo.`
            return
        }
        error_message = ''
        file = new_file
        on_imported?.(new_file)
    }

    /** @param {DragEvent} event */
    function handle_drag_over(event) {
        // Needed to allow dropping.
        event.preventDefault()
        is_dragging_over = true
    }

    /** @param {DragEvent & { currentTarget: HTMLElement }} event */
    function handle_drag_leave(event) {
        // Moving over a child also fires `dragleave` on the zone: ignore it.
        if (!event.currentTarget.contains(/** @type {Node | null} */ (event.relatedTarget))) {
            is_dragging_over = false
        }
    }

    /** @param {DragEvent} event */
    function handle_drop(event) {
        event.preventDefault()
        is_dragging_over = false
        import_file(event.dataTransfer?.files[0])
    }
</script>

<!-- Visually hidden: its parent <label> opens the file picker when clicked. -->
{#snippet file_input()}
    <input type="file"
           accept="video/*"
           onchange={event => import_file(event.currentTarget.files?.[0])}>
{/snippet}

{#if video_url}
    <VideoPlayer src={video_url}>
        {#snippet video_actions_right()}
            <!-- First in the right corner, so the cross is the rightmost action. -->
            <VideoAction label="Retirer la vidéo" onclick={() => file = undefined}>
                <CloseIcon />
            </VideoAction>
            <!-- A label (not a `VideoAction`) to open the file picker; same style as `VideoAction`. -->
            <label class="button">
                {@render file_input()}
                Changer de vidéo
            </label>
        {/snippet}
        {#snippet error()}
            <h3>Ce format de vidéo n'est pas pris en charge.</h3>
        {/snippet}
    </VideoPlayer>
{:else}
    <label class={['drop-zone', { dragging: is_dragging_over }]}
           ondragenter={handle_drag_over}
           ondragover={handle_drag_over}
           ondragleave={handle_drag_leave}
           ondrop={handle_drop}>
        {@render file_input()}
        <span class="icon"><VideoFileIcon /></span>
        <span>Glissez-déposez une vidéo, ou cliquez pour en choisir une.</span>
        {#if error_message}
            <span class="error" role="alert">{error_message}</span>
        {/if}
    </label>
{/if}

<style>
    .drop-zone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        aspect-ratio: 16 / 9;
        padding: 2rem;
        background: #ececec;
        color: #6f6f6f;
        text-align: center;
        font-size: 1.4rem;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
    }

    .drop-zone:hover,
    .drop-zone.dragging {
        background: #d8d8d8;
        color: black;
    }

    .drop-zone:has(input:focus-visible) {
        outline: 0.2rem solid var(--focus-visible-color, black);
        outline-offset: -0.2rem;
    }

    /* Visually hidden but focusable, so the picker can be opened with the keyboard. */
    input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    .icon {
        font-size: 6rem;
        line-height: 1;
    }

    .error {
        color: #c92a2a;
    }

    .button {
        padding: 0.6rem 1.2rem;
        border: 0.2rem solid white;
        border-radius: 0.8rem;
        background: rgb(0 0 0 / 0.4);
        color: white;
        font: inherit;
        font-size: 1.4rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .button:hover {
        background: black;
    }

    .button:focus-visible,
    .button:has(input:focus-visible) {
        outline: 0.2rem solid var(--focus-visible-color, white);
    }
</style>
