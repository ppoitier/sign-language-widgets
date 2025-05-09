<script>
    import VideoActions from '../interaction/video-actions.svelte'
    import Video from '../media/video.svelte'
    import TagList from '../tags/tag-list.svelte'

    /**
     * @typedef {import('../../entities/sign.js').Sign} Sign
     * @typedef {import('svelte').Snippet} Snippet
     *
     * @typedef {Object} SignListItemProps
     * @property {Sign} sign - Sign displayed in the card.
     * @property {NewWordCallback} on_new_word - Function called when a new word is added to the sign.
     * @property {UpdatedWordCallback} on_updated_word - Function called when a word of the sign is updated.
     * @property {DeletedWordCallback} on_deleted_word - Function called when a word of the sign is deleted.
     * @property {Snippet | undefined} [video_actions_right] - Additional actions displayed in the top-right corner of the sign video.
     * @property {Snippet | undefined} [video_actions_left] - Additional actions displayed in the top-left corner of the sign video.
     * @property {Snippet | undefined} [main_actions] - Additional actions displayed in the table.
     */

    /**
     * @callback NewWordCallback
     * @param {string} sign_id
     * @param {string} new_word
     */

    /**
     * @callback UpdatedWordCallback
     * @param {string} sign_id
     * @param {string} word_id
     * @param {string} new_word
     */

    /**
     * @callback DeletedWordCallback
     * @param {string} sign_id
     * @param {string} word_id
     */

    /** @type {SignListItemProps} */
    let {sign, on_new_word, on_updated_word, on_deleted_word, video_actions_right, video_actions_left, main_actions} = $props()
    let word_names = $derived(sign.words.map(w => w.word))

    /**
     * @param {string} new_word
     */
    function handle_new_word(new_word) {
        on_new_word(sign.id, new_word)
    }

    /**
     * @param {number} index
     * @param {string} new_word
     */
    function handle_updated_word(index, new_word) {
        on_updated_word(sign.id, sign.words[index].id, new_word)
    }

    /**
     * @param {number} index
     */
    function handle_deleted_word(index) {
        on_deleted_word(sign.id, sign.words[index].id)
    }
</script>

<tr class="sign-list-item" class:highlighted={sign.highlighted}>
    <td>
        <div class="sign-list-item_preview">
            <Video mime_type={sign.mime_type} url={sign.url}>
                <VideoActions>
                    {@render video_actions_right?.()}
                </VideoActions>
                <VideoActions location="top-left">
                    {@render video_actions_left?.()}
                </VideoActions>
            </Video>
        </div>
    </td>
    <td>
        <div class="sign-list-item_info">
            <TagList editable={true}
                     on_new={handle_new_word}
                     on_updated={handle_updated_word}
                     on_deleted={handle_deleted_word}
                     texts={word_names}
            />
        </div>
    </td>
    <td>
        <div class="sign-list-item_actions">
            {#if sign.with_actions}
                {@render main_actions?.(sign.id)}
            {/if}
        </div>
    </td>
</tr>


<style>
    .sign-list-item.highlighted {
        background: rgb(250, 224, 224);
    }

    .sign-list-item_preview {
        width: 100%;
        max-width: 32rem;
        min-width: 24rem;
    }

    .sign-list-item_info {
        padding: 1rem .5rem;
        font-size: 1.4rem;
    }

    .sign-list-item_actions {
        display: flex;
        flex-direction: column;
        gap: .5rem;
        padding: 1rem .5rem;
    }
</style>
