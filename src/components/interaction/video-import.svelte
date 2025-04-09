<script>
    import VideoFileIcon from '../icons/video-file-icon.svelte'
    import Video from '../media/video.svelte'

    /**
     * Callback function triggered when a file is imported.
     * @callback OnImportedCallback
     * @param {{url: string, mime_type: string}} imported_video - Object containing the URL and MIME type of the imported video.
     * @returns {void}
     */

    /** @type {{on_imported: OnImportedCallback}} */
    let {on_imported} = $props()

    /** @type {HTMLInputElement} */
    let file_input
    /** @type {boolean} */
    let is_dragging_over = $state(false)

    /** @type {{url: string, mime_type: string} | null} */
    let imported_video = $state(null)

    /**
     * @param {DragEvent} event
     */
    function handle_drag_over(event) {
        event.preventDefault()
        is_dragging_over = true
    }

    /**
     * @param {DragEvent} event
     */
    function handle_drag_enter(event) {
        event.preventDefault()
        is_dragging_over = true
    }

    /**
     * @param {DragEvent} event
     */
    function handle_drag_leave(event) {
        is_dragging_over = false
    }

    /**
     * @param {DragEvent} event
     */
    function handle_drop(event) {
        event.preventDefault()
        is_dragging_over = false
        const files = event.dataTransfer?.files
        if (files && files.length > 0) {
            process_file(files[0])
        }
    }

    /**
     * @param {Event} event
     */
    function handle_file_selected(event) {
        const target = /** @type {HTMLInputElement} */ (event.target)
        const files = target.files
        if (files && files.length > 0) {
            process_file(files[0])
        }
    }

    /**
     * @param {MouseEvent} event
     */
    function on_selector_clicked(event) {
        event.preventDefault()
        file_input?.click()
    }

    /**
     * @param {File} file
     */
    function process_file(file) {
        const video_file = {
            mime_type: file.type,
            url: URL.createObjectURL(file),
        }
        on_imported(video_file)
        imported_video = video_file
    }
</script>


<div class="video-import" role="article"
     class:dragging={is_dragging_over}
     ondragenter={handle_drag_enter}
     ondragleave={handle_drag_leave}
     ondragover={handle_drag_over}
     ondrop={handle_drop}
>
    {#if imported_video !== null}
        <div class="video-import_preview">
            <Video url={imported_video.url} mime_type={imported_video.mime_type} fluid={true} />
        </div>
    {/if}

    <div class="video-import_content">
        <input
                type="file"
                hidden
                bind:this={file_input}
                onchange={handle_file_selected}
                accept="video/*"
        />

        <button class="video-import_icon" onclick={on_selector_clicked}>
            <VideoFileIcon/>
        </button>

        <p class="video-import_info">
            Glissez-déposez une vidéo, ou <a href="#" onclick={on_selector_clicked}>sélectionnez-en</a> une !
        </p>
    </div>
</div>


<style>
    .video-import {
        position: relative;
        min-width: 24rem;
        max-width: 100rem;
        aspect-ratio: 16/9;
        overflow: hidden;
        background: #ececec;
        border: 1px solid #cfcfcf;
        border-radius: .8rem;
        isolation: isolate;
        z-index: 0;
    }

    .video-import_preview {
        position: absolute;
        inset: 0;
        z-index: 50;
        opacity: 0.6;
    }

    .video-import_content {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        z-index: 100;
    }

    .video-import_icon {
        display: block;
        width: 20%;
        height: auto;
        aspect-ratio: 1;
        text-align: center;
        text-indent: 0;
        line-height: normal;

        font-size: 5rem;
        color: #989898;
        border: 1px solid #989898;
        background: rgba(236, 236, 236, 0.8);
        border-radius: .8rem;
    }

    .video-import_icon:hover,
    .video-import_icon:active,
    .video-import.dragging .video-import_icon {
        color: black;
        border-color: black;
        background: rgba(216, 216, 216, 0.8);
    }

    .video-import_icon:focus-visible {
        outline: 2px solid var(--focus-visible-color);
    }

    .video-import_info {
        padding: 1rem;
        border-radius: .4rem;
        font-size: 1.4rem;
        background: rgba(236, 236, 236, 0.5);
    }
</style>