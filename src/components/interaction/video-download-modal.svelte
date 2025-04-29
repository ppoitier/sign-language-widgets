<script>
    import Modal from "./modal.svelte";

    let {on_download} = $props()
    let video_id = $state()
    let modal = $state()

    /**
     * @param {String} selected_video_id
     */
    function open_modal(selected_video_id) {
        if (!modal) {
            return
        }
        video_id = selected_video_id
        modal.open_modal()
    }

    /**
     * @param {String} extension
     */
    function handle_download_pressed(extension) {
        if (modal) {
            modal.close_modal()
        }
        if (video_id) {
            on_download(video_id, extension)
        }
    }

    export {open_modal}
</script>

<Modal bind:this={modal}>
    <h4>Télécharger la vidéo</h4>

    <div class="download-options">
        <div class="download-options_column">
            <h6>Image animée</h6>
            <button class="download-option" onclick={() => handle_download_pressed('gif')}>gif</button>
            <button class="download-option" onclick={() => handle_download_pressed('webp')}>webp</button>
        </div>
        <hr>
        <div class="download-options_column">
            <h6>Fichier vidéo</h6>
            <button class="download-option" onclick={() => handle_download_pressed('mp4')}>mp4</button>
            <button class="download-option" onclick={() => handle_download_pressed('webm')}>webm</button>
        </div>
    </div>

</Modal>


<style>
    h4 {
        text-align: center;
    }

    .download-options {
        margin: 1rem;
        display: flex;
        flex-direction: row;
        justify-items: center;
        gap: 2rem;
    }

    .download-options_column {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: .5rem;
    }

    .download-options_column:first-child {
        align-items: end;
    }

    .download-option {
        all: unset;
        width: 6rem;
        height: 6rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        text-transform: uppercase;
        user-select: none;

        border: 1px solid var(--button-color);
        border-radius: .5rem;
        color: var(--button-color);
        background-color: var(--card-background);

        transition: background-color .1s, color .1s;
    }

    .download-option:hover, .download-option:active {
        background-color: var(--button-color);
        color: white;
    }

    .download-option:focus-visible {
        outline: 2px solid var(--focus-visible-color);
    }
</style>

