<!--
@component
Modal dialog to choose the format of a video to download (animated image: gif, webp; video file: mp4, webm).
Opened with `open` (bindable: back to false when closed); `on_download` gets the chosen format.
Closed with its button, Escape, or a click outside.

With `let download_open = $state(false)` and `let download_sign = $state()`:
```svelte
<VideoAction label="Télécharger" onclick={() => { download_sign = sign; download_open = true }}>
    <DownloadIcon />
</VideoAction>

<VideoDownloadDialog bind:open={download_open} on_download={(format) => download(download_sign, format)} />
```
-->

<script>
    /**
     * @typedef {Object} Props
     * @property {boolean} [open=false] - Bindable. If true, the dialog is shown.
     * @property {(format: string) => void} on_download - Called with the chosen format (`'gif'`, `'webp'`, `'mp4'` or `'webm'`); the dialog closes.
     */

    /** @type {Props} */
    let { open = $bindable(false), on_download } = $props()

    const format_groups = [
        { title: 'Image animée', formats: ['gif', 'webp'] },
        { title: 'Fichier vidéo', formats: ['mp4', 'webm'] },
    ]

    /** @param {HTMLDialogElement} dialog */
    function sync_open(dialog) {
        // Re-run when `open` changes.
        if (open && !dialog.open) dialog.showModal()
        else if (!open && dialog.open) dialog.close()
    }

    /** @param {string} format */
    function download(format) {
        open = false
        on_download(format)
    }

    /** @param {MouseEvent} event */
    function handle_click(event) {
        // The dialog itself is only hit outside its content: on the backdrop.
        if (event.target === event.currentTarget) open = false
    }
</script>

<dialog class="video-download-dialog" onclose={() => open = false} onclick={handle_click} {@attach sync_open}>
    <div class="content">
        <h2>Télécharger la vidéo</h2>

        <div class="format-groups">
            {#each format_groups as group (group.title)}
                <section class="format-group">
                    <h3>{group.title}</h3>
                    {#each group.formats as format (format)}
                        <button type="button" class="format-button" onclick={() => download(format)}>{format}</button>
                    {/each}
                </section>
            {/each}
        </div>

        <!-- Not a `<form method="dialog">`: the dialog may be placed inside a form of the app. -->
        <div class="footer">
            <button type="button" class="close-button" onclick={() => open = false}>Fermer</button>
        </div>
    </div>
</dialog>

<style>
    .video-download-dialog {
        margin: auto;
        padding: 0;
        border: 0.1rem solid var(--card-border);
        border-radius: 0.8rem;
        box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 0.2);
        max-width: 90vw;
    }

    .video-download-dialog::backdrop {
        background-color: rgb(0 0 0 / 0.5);
        backdrop-filter: blur(2px);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 2rem;
    }

    h2 {
        margin: 0;
        font-size: 1.8rem;
        text-align: center;
    }

    h3 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;
    }

    .format-groups {
        display: flex;
        justify-content: center;
        gap: 3rem;
    }

    .format-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .format-button {
        width: 6rem;
        height: 6rem;
        border: 0.1rem solid var(--button-color);
        border-radius: 0.5rem;
        background-color: var(--card-background);
        color: var(--button-color);
        font: inherit;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.1s, color 0.1s;
    }

    .format-button:hover {
        background-color: var(--button-color);
        color: white;
    }

    .format-button:focus-visible,
    .close-button:focus-visible {
        outline: 0.2rem solid var(--focus-visible-color);
    }

    .footer {
        display: flex;
        justify-content: flex-end;
    }

    .close-button {
        padding: 0.5em 1em;
        border: 0.1rem solid #ccc;
        border-radius: 0.4rem;
        background-color: #f0f0f0;
        font: inherit;
        cursor: pointer;
    }

    .close-button:hover {
        background-color: #e0e0e0;
    }
</style>
